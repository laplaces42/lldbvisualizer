from json_helper import create_thread, create_frame, create_local, create_register, create_bp, create_bp_loc, create_block
from session import SessionContext, Server
import subprocess
import threading
import atexit
import socket
import select
import json
import time
import sys
import os
import re

# Dynamically get the LLDB Python path
def get_lldb_python_path():
    try:
        out = subprocess.check_output(['lldb', '-P'], text=True).strip()
        return out
    except Exception as e:
        print(f"[ERROR] Failed to get LLDB Python path: {e}")
        return None

lldb_path = get_lldb_python_path()
if lldb_path and lldb_path not in sys.path:
    sys.path.insert(0, lldb_path)

import lldb



session = SessionContext()
server = Server("127.0.0.1", 4952)

# Object to hold debugger state
debug_state = {
    "metadata": {},
    "threads": [],
    "breakpoints": [],
    "heap": {
        "start": "",
        "end": "",
        "blocks": []
    }
}

empty_state = {
    "metadata": {
      "wordSize": -1,
      "pointerSize": -1,
      "endianness": "",
      "architecture": "",
      "processID": -1,
      "processState": -1
    },
    "threads": [],
    "breakpoints": [],
    "heap": {
      "start": "",
      "end": "",
      "blocks": []
    }
  }




def get_heap_bounds(process):
     # Get the process address map
    session.cmd_interpreter.HandleCommand(f"shell vmmap {process.GetProcessID()}", session.result)
    
    # Get the regions associated with malloc to find heap
    malloc_regions = re.findall(r'MALLOC(?:_TINY|_SMALL)?\s+([0-9a-fA-Fx]+)-([0-9a-fA-Fx]+)', session.result.GetOutput())

    # Convert addresses to integers and find bounds
    if malloc_regions:
        heap_start = min(int(start, 16) for start, end in malloc_regions)
        heap_end = max(int(end, 16) for start, end in malloc_regions)

        # Add the heap bounds to the debug state
        with session.debug_lock:
            debug_state["heap"]["start"] = f"0x{heap_start:x}"
            debug_state["heap"]["end"] = f"0x{heap_end:x}"
    
def handle_malloc(ptr, size):
    block = create_block(ptr, "", size, None, "")
    with session.debug_lock:
        debug_state["heap"]["blocks"].append(block)
   
def handle_free(ptr):
    with session.debug_lock:
        debug_state["heap"]["blocks"] = [b for b in debug_state["heap"]["blocks"] if b["address"] != ptr]

def handle_realloc(old, new, size):
    if old == new:
        block = [b for b in debug_state["heap"]["blocks"] if b["address"] == old]
        if not block:
            return
        with session.debug_lock:
            block[0]["size"] = size

    else:
        handle_free(old)
        handle_malloc(new, size)

def handle_calloc(ptr, nmemb, size):
    total_size = nmemb * size
    block = create_block(ptr, "", total_size, None, "")
    with session.debug_lock:
        debug_state["heap"]["blocks"].append(block)    

# update to run once target is launched such that breakpoints can get loaded
def update_debugger(memory_log):
    '''
    Update the debugger state and send it to the frontend.
    Params:
        target: the target to update
        process: the process to update
        memory_log: the path to the memory log
        snapshot_file: the path to the snapshot file
        conn: the socket connection to the frontend
    '''

    # while True:
    #     change_made = False
    #     target = session.debugger.GetSelectedTarget()
    #     if not target or not target.IsValid():
    #         continue
    #     event = lldb.SBEvent()
    #     session.listener.WaitForEvent(0, event)
    #     if not event.IsValid():
    #         continue
    #     # event.GetDescription(session.stream)
    #     # print(f"[DEBUG] Received event: {session.stream.GetData()}")
    #     if lldb.SBBreakpoint.EventIsBreakpointEvent(event):
    #         for bp in target.breakpoints:
    #             # Potentially add description on hover
    #             names = lldb.SBStringList()
    #             bp.GetNames(names) # Get names of the current breakpoint

    #             # Create a new breakpoint object
    #             new_bp = create_bp(bp.GetID(), list(names), bp.IsEnabled())
                
    #             # Iterate through all the locations for the breakpoint
    #             for loc in bp.locations:
    #                 addr = loc.GetAddress() # Location address
    #                 line_entry = addr.GetLineEntry() # Location line entry
    #                 filespec = line_entry.GetFileSpec() # Line entry filespec

    #                 session.stream.Clear()
    #                 loc.GetDescription(session.stream, True) # Get the description of the breakpoint

    #                 # Create a new breakpoint lcoation and add it to the breakpoint
    #                 new_loc = create_bp_loc(loc.GetID(), filespec.basename if filespec.basename else "", line_entry.GetLine(), addr.GetFileAddress(), loc.IsEnabled(), session.stream.GetData())
    #                 new_bp["locations"].append(new_loc)

    #             # Add the breakpoint
    #             with session.debug_lock:
    #                 debug_state["breakpoints"].append(new_bp)
    #             change_made = True
    #             # print(f"[DEBUG] Breakpoint event: {session.stream.GetData()}")
    #     else:
    #         print(False)

    #     if change_made:
    #         try:
    #             # Send the updated state to the frontend
    #             message = {
    #                 "type": "debug-state",
    #                 "payload": debug_state
    #             }
    #             with server.socket_lock:
    #                 server.conn.sendall(json.dumps(message).encode() + b'\n')
    #         except socket.error as e:
    #             # print(f"[ERROR] Failed to send data: {e}")
    #             continue

    #         with session.debug_lock:
    #             debug_state["threads"] = []
    #             debug_state["breakpoints"] = []


    # Infinite loop so that the visualization can continuously be updated
    while True:
        
        target = session.debugger.GetSelectedTarget()
        if not target or not target.IsValid():
            continue
        # Iterate through all the breakpoints
        for bp in target.breakpoints:
            # Potentially add description on hover
            names = lldb.SBStringList()
            bp.GetNames(names) # Get names of the current breakpoint

            # Create a new breakpoint object
            new_bp = create_bp(bp.GetID(), list(names), bp.IsEnabled())
            
            # Iterate through all the locations for the breakpoint
            for loc in bp.locations:
                addr = loc.GetAddress() # Location address
                line_entry = addr.GetLineEntry() # Location line entry
                filespec = line_entry.GetFileSpec() # Line entry filespec

                session.stream.Clear()
                loc.GetDescription(session.stream, True) # Get the description of the breakpoint

                # Create a new breakpoint lcoation and add it to the breakpoint
                new_loc = create_bp_loc(loc.GetID(), filespec.basename if filespec.basename else "", line_entry.GetLine(), addr.GetFileAddress(), loc.IsEnabled(), session.stream.GetData())
                new_bp["locations"].append(new_loc)

            # Add the breakpoint
            with session.debug_lock:
                debug_state["breakpoints"].append(new_bp)

        if target.GetProcess().IsValid():
            process = target.GetProcess()

            state = process.GetState()
            if state not in [lldb.eStateStopped, lldb.eStateCrashed]:
                time.sleep(0.05)
                continue

            # Update the process state
            with session.debug_lock:
                debug_state["metadata"]["processState"] = state
                debug_state["metadata"]["processID"] = process.GetProcessID()

            # Iterate through every thread in the process
            for thread in process:
                # Get the top stack frame and create a new thread object
                top = thread.GetFrameAtIndex(0)
                line_entry = top.GetLineEntry() # Line entry of the top frame
                filespec = line_entry.GetFileSpec() # File spec for the current line entry
                new_thread = create_thread(thread.GetIndexID(), thread.GetThreadID(), hex(top.GetPC()), top.GetFunctionName(), thread.GetName() if thread.GetName() else "", filespec.basename if filespec.basename else "", line_entry.GetLine())

                # Iterate through every frame in the current thread
                for frame in thread:
                    line_entry = frame.GetLineEntry() # Line entry of the current frame
                    filespec = line_entry.GetFileSpec() # File spec for the current line entry
                
                    # Create a new frame object
                    new_frame = create_frame(frame.GetFunctionName(), filespec.basename if filespec.basename else "", frame.GetFrameID(), line_entry.GetLine())

                    # Iterate through all the variables in the frame
                    for var in frame.GetVariables(True, True, True, True):
                        var_type = var.GetTypeName()
                        # Clean the value output if it is a pointer and create a new local object
                        if var_type[-1] == "*":
                            value = f"0x{int(var.GetValue(), 16):x}"
                            new_var = create_local(var.GetName(), var_type, value, var.GetAddress().GetFileAddress())
                        else:
                            new_var = create_local(var.GetName(), var_type, var.GetValue(), var.GetAddress().GetFileAddress())

                        # Add the local to the frame
                        new_frame["locals"].append(new_var)

                    # Add the frame to the thread
                    new_thread["stack"].append(new_frame)

                # Iterate through all the general purpose registers
                for register_set in top.GetRegisters():
                    if register_set.GetName() != "General Purpose Registers":
                        continue

                    # Create a new register object and add it to the current thread
                    for reg in register_set:
                        new_reg = create_register(reg.GetName(), f"0x{int(reg.GetValue(), 16):x}")
                        new_thread["registers"].append(new_reg)
                with session.debug_lock:
                   debug_state["threads"].append(new_thread)

            

            # Handle the heap blocks from the memory log
            with open(memory_log, "r") as f:
                while line := f.readline():
                    entry = json.loads(line)
                    match entry["op"]:
                        case "malloc":
                            handle_malloc(entry["ptr"], entry["size"])
                        case "free":
                            handle_free(entry["ptr"])
                        case "realloc":
                            handle_realloc(entry["old_ptr"], entry["new_ptr"], entry["size"])
                        case "calloc":
                            handle_calloc(entry["ptr"], entry["nmemb"], entry["size"])

            # Add in the raw data for each allocated block if the process is stopped
            if process.GetState() == lldb.eStateStopped:
                for block in debug_state["heap"]["blocks"]:
                    error = lldb.SBError()
                    data = process.ReadMemory(int(block["address"], 16), block["size"], error)
                    block["raw"] = data.hex() if data else ""

            # Clear the memory log
            with open(memory_log, "w") as f:
                f.write("")

            # Get the heap bounds
            get_heap_bounds(process)


        try:
            # Send the updated state to the frontend
            message = {
                "type": "debug-state",
                "payload": debug_state
            }
            with server.socket_lock:
                server.conn.sendall(json.dumps(message).encode() + b'\n')
        except socket.error as e:
            # print(f"[ERROR] Failed to send data: {e}")
            continue

        with session.debug_lock:
            debug_state["threads"] = []
            debug_state["breakpoints"] = []

        
        time.sleep(0.05)

def get_memory(process, address, words):
    '''
    Get the memory at the given address in the process.

    Params:
        process: the process to get memory from
        address: the address to get memory from
        words: the number of words to get

    Returns:
        The memory at the given address in the process.
    '''
    if not process.IsValid():
        return {"data": "", "error": "Invalid process"}
    error = lldb.SBError()
    data = process.ReadMemory(address, words * debug_state["metadata"]["wordSize"], error)
    
    return {"data": str(data.hex()) if data else "", "error": error.GetCString() if error.Fail() else ""}

def receive_messsage():
    
    while True:
        buffer = server.conn.makefile("r")
        for line in buffer:
            try:
                message = json.loads(line)
                target = session.debugger.GetSelectedTarget()
                if not target or not target.IsValid():
                    continue
                # print(f"Received message: {message}")
                if message["type"] == "memory-inspect":
                    process = target.GetProcess()
                    data = get_memory(process, message["command"]["address"], message["command"]["words"])
                    message = {
                        "type": "memory-inspect",
                        "payload": data
                    }   
                    with server.socket_lock:
                        server.conn.sendall(json.dumps(message).encode() + b'\n')
            except socket.error as e:
                # print(f"[ERROR] Failed to receive data: {e}")
                break
            except json.JSONDecodeError as e:
                # print(f"[ERROR] Failed to decode JSON: {e}")
                break

def main(memory_log, snapshot_file):
    
     # Clear the memory log
    os.makedirs(os.path.dirname(memory_log), exist_ok=True)
    with open(memory_log, "w") as f:
        f.write("")
    
    byte_order_enum = {0: "invalid", 1: "big", 2: "pdp", 4: "little"}

    prev_command = ""
    prev_target = None
    target = None
    server.AddDebugThread(threading.Thread(target=update_debugger, args=(memory_log,)))
    server.AddClientThread(threading.Thread(target=receive_messsage, args=()))

    lldb_process = subprocess.Popen("lldb", stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
    while True:
        command = input("(lldb) ").strip()
        if not command:
            command = prev_command
        else:
            prev_command = command
        if command in ["exit", "quit", "q"]:
            if target and target.GetProcess().IsValid():
                confirmation = input("Quitting LLDB will kill one or more processes. Do you really want to proceed: [Y/n] ")
                while confirmation not in ["Y", "y", "N", "n"]:
                    confirmation = input("Quitting LLDB will kill one or more processes. Do you really want to proceed: [Y/n] ")
                if confirmation in ["Y", "y"]:
                    lldb_process.terminate()
                    break
                else:
                    continue
            else:
                lldb_process.terminate()
                break
        session.cmd_interpreter.HandleCommand(command, session.result)
        lldb_process.stdin.write(command + '\n')
        lldb_process.stdin.flush()
        fds = [lldb_process.stdout, lldb_process.stderr]

        while True:
            ready, _, _ = select.select(fds, [], [], 0.7)
            if not ready:
                break
            for fd in ready:
                data = os.read(fd.fileno(), 2048).decode()
                if data.strip().startswith(f"(lldb) {command}"):
                    continue

                print(data, end="", flush=True)

        target = session.debugger.GetSelectedTarget()
        if target and target != prev_target:
            target.GetBroadcaster().AddListener(session.listener, lldb.SBTarget.eBroadcastBitBreakpointChanged)
            with session.debug_lock:
                debug_state["metadata"] = {
                    "wordSize": target.GetAddressByteSize(),
                    "pointerSize": target.GetAddressByteSize(),
                    "endianness": byte_order_enum[target.GetByteOrder()],
                    "architecture": target.GetPlatform().GetTriple().split("-")[0]
                }
            
            # Get the library to intercept dynamic memory manipulation functions
            intercept_lib = os.path.dirname(os.path.abspath(__file__)) + "/libintercept.dylib"
            launch = target.GetLaunchInfo() # Launch info
            env = launch.GetEnvironment() # Environment info

            # Load the intercept library
            env.PutEntry(f"MEMORY_LOG_PATH={memory_log}")
            env.PutEntry(f"DYLD_INSERT_LIBRARIES={intercept_lib}")
            env.PutEntry("DYLD_FORCE_FLAT_NAMESPACE=1")

            # Set the environmemt and launch info
            launch.SetEnvironment(env, False)
            target.SetLaunchInfo(launch)

            prev_target = target


def cleanup():
    # print("Cleaning up...")

    # Safely close socket connections
    try:
        server.conn.shutdown(socket.SHUT_RDWR)
    except Exception as e:
        print(f"Socket shutdown error: {e}")

    try:
        server.conn.close()
        # print("Connection closed.")
    except Exception as e:
        print(f"Connection close error: {e}")

    try:
        server.close()
        # print("Server closed.")
    except Exception as e:
        print(f"Server close error: {e}")

    # Wait for threads to finish if they were started
    # try:
    #     if 'debug_thread' in globals() and debug_thread.is_alive():
    #         debug_thread.join(timeout=2)
    #         # print("Debug thread joined.")
    # except Exception as e:
    #     sprint(f"Debug thread join error: {e}")

    
    # try:
    #     if 'client_thread' in globals() and client_thread.is_alive():
    #         client_thread.join(timeout=2)
    #         # print("Client thread joined.")
    # except Exception as e:
    #     sprint(f"Client thread join error: {e}")

    # print("Cleanup complete.")


atexit.register(cleanup)
        
if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])


'''
next steps
add in ability to add breakpoints in UI
possibly watchpoint support?
change selected thread when selected in UI
potentially change selected frame when selected in UI
memory visualization in UI and backend
dynamically size heap
clicking on heap block opens in memory inspector
view information about breakpoint locations

'''