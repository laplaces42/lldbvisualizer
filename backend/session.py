import threading
import subprocess
import socket
import sys
import os
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

class SessionContext:
    def __init__(self):
        self.debugger = lldb.SBDebugger.Create()
        self.debugger.SetAsync(False)
        self.cmd_interpreter = self.debugger.GetCommandInterpreter()
        self.result = lldb.SBCommandReturnObject()
        self.stream = lldb.SBStream()
        self.listener = lldb.SBListener("lldb_listener")
        # self.debugger.GetBroadcaster().AddListener(self.listener,
        #     # lldb.SBTarget.eBroadcastBitModulesLoaded |
        #     lldb.SBTarget.eBroadcastBitBreakpointChanged 
        #     # lldb.SBProcess.eBroadcastBitStateChanged
        #     )
        self.debug_lock = threading.Lock()
    

class Server:
    def __init__(self, HOST, PORT, port_file):
        os.makedirs(os.path.dirname(port_file), exist_ok=True)
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        port_found = False
        max_tries = 100
        tries = 0
        while not port_found and tries < max_tries:
            try:
                self.server.bind((HOST, PORT))
                port_found = True
                with open(port_file, "w") as pf:
                    pf.write(str(PORT))
            except socket.error as e:
                if e.errno == 48:  # Address already in use
                    PORT += 1
                    tries += 1
                    continue
                else:
                    print(f"[ERROR] Failed to bind server socket: {e}")
                    sys.exit(1)
        if not port_found:
            print(f"[ERROR] Could not bind to any port after {max_tries} attempts.")
            sys.exit(1)
        self.server.listen(1)
        self.conn, self.addr = self.server.accept()
        self.socket_lock = threading.Lock()
        self.debug_thread = None
        self.client_thread = None

    def AddDebugThread(self, thread):
        self.debug_thread = thread
        self.debug_thread.start()

    def AddClientThread(self, thread):
        self.client_thread = thread
        self.client_thread.start()
