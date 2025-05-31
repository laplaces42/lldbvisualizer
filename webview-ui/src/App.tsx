import React, { useEffect, useState } from 'react';
import './App.css';
import DebugVisualizer from './DebugVisualizer';
import snapshot from './snapshot.json';

function App() {

  // production mode
  const emptyState = {
    metadata: {
      wordSize: -1,
      pointerSize: -1,
      endianness: "",
      architecture: "",
      processID: -1,
      processState: -1
    },
    threads: [],
    breakpoints: [],
    heap: {
      start: "",
      end: "",
      blocks: []
    }
  };

  const [debuggerState, setDebuggerState] = useState(emptyState);
  const [memoryInspection, setMemoryInspection] = useState(null);
  const [otherCommand, setOtherCommand] = useState(null);
  
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const {data}  = event.data;
      if (!data) return;
      // console.log("Received message from extension:", data);
      if (data.type === "debug-state") {
        setDebuggerState({ ...data.payload }); // update your UI
      } else if (data.type === "memory-inspect") {
        setMemoryInspection({ ...data.payload });
      } else {
        setOtherCommand({ ...data });
      }
      
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  const hasValidThreads = Array.isArray(debuggerState.threads) && debuggerState.threads.length > 0;
  
  // development mode
  // const [debuggerState, setDebuggerState] = useState(null);
  // const [memoryInspection, setMemoryInspection] = useState(null);
  // const [otherCommand, setOtherCommand] = useState(null);
  // const hasValidThreads = true
  





  return (
    <div className="App">
      <DebugVisualizer data={debuggerState} memoryInspection={memoryInspection} otherCommand={otherCommand} />
    </div>
  );
}

export default App;
