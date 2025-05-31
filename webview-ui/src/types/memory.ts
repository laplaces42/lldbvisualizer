export type StackLocalType = {
  name: string;
  type: string;
  value: string;
  address: number;
};

export type StackFrameType = {
  function: string;
  filename: string;
  frameIndex: number;
  lineNumber: number
  locals: StackLocalType[];
};


export type HeapBlockType = {
  address: string;
  type: string;
  size: number;
  value?: string;
  raw: string;
};

export type HeapMemoryType = {
  start: string;
  end: string;
  blocks: HeapBlockType[];
};


export type BreakpointLocType = {
  id: number;
  file: string;
  line: number;
  address: number;
  enabled: boolean;
  description: string
}

export type BreakpointType = {
  id: number;
  names: string[];
  enabled: boolean;
  locations: BreakpointLocType[]
}

export type RegisterType = {
  name: string;
  value: string
}

export type ThreadType = {
  index: number;
  filename: string;
  lineNumber: number;
  id: number;
  pc: string;
  function: string;
  name: string
  stack: StackFrameType[]
  registers: RegisterType[]
}

export type MetadataType = { 
  processID: number;
  processState: number;
  wordSize: number,
  pointerSize: number,
  endianness: string,
  architecture: string
}

export type DebuggerSnapshot = {
  metadata: MetadataType;
  threads: ThreadType[];
  breakpoints: BreakpointType[]
  heap: HeapMemoryType
};
