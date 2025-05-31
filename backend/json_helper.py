def create_thread(index, id, pc, function, name, filename, lineNumber):
    '''
    Create a thread entry in the debug state.

    Params:
        index: the index of the thread
        id: the ID of the thread
        pc: the program counter of the thread
        function: the function the thread is actively on
        name: the name of the thread

    Returns:
        A dictionary representing a thread entry in the debug state.
    '''
    return {
        "index": index,
        "filename": filename,
        "lineNumber": lineNumber,
        "id": id,
        "pc": pc,
        "function": function,
        "name": name,
        "stack": [],
        "registers": []
        }

def create_register(name, value):
    return {
        "name": name,
        "value": value
    }

def create_bp(id, names, enabled):
    return {
        "id": id,
        "names": names,
        "enabled": enabled,
        "locations": []
        }

def create_bp_loc(index, file, line, address, enabled, description):
    return {
        "id": index,
        "file": file,
        "line": line,
        "address": address,
        "enabled": enabled,
        "description": description
        }


def create_frame(function, filename, frameIndex, lineNumber):
    return {
        "function": function,
        "filename": filename,
        "frameIndex": frameIndex,
        "lineNumber": lineNumber,
        "locals": []
    }

def create_local(name, type, value, address):
    return {
        "name": name,
        "type": type,
        "value": value if value else "null",
        "address": address,
    }

def create_block(address, type, size, value, raw):
    return {
        "address": address,
        "type": type,
        "size": size,
        "value": value if value else "null",
        "raw": raw
    }