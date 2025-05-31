import { DebuggerSnapshot } from "./types/memory";
import React, { useEffect, useState } from "react";
import ControlPanel from "./ControlPanel";
import ThreadController from "./ThreadControl";
import Breakpoints from "./Breakpoints";
import MemoryInspection from "./MemoryInspection";
import Heap from "./Heap";

// const vscode = acquireVsCodeApi()
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { postMessage: () => {} };



function DebugVisualizer({data, memoryInspection, otherCommand}: {data: DebuggerSnapshot, memoryInspection: any, otherCommand: any}) {
    const { metadata, threads, breakpoints, heap } = data;
    const [selectedThread, setSelectedThread] = useState(threads[0])
    const [memoryData, setMemoryData] = useState("")
    const [address, setAddress] = useState("")
    const [words, setWords] = useState("")

    useEffect(() => {
        if (!threads || threads.length === 0) return;
        if (!selectedThread){
            setSelectedThread(threads[0]);
            return;
        }

        const selectedThreadExists = threads.some(thread => thread.id === selectedThread.id);
        if (selectedThreadExists) {
            setSelectedThread(threads.find(thread => thread.id === selectedThread.id) ?? threads[0]);
        } else {
            setSelectedThread(threads[0]);
        }
    }, [threads]);

    useEffect(() => {
        if (otherCommand) {
            // console.log("Other command received: ", otherCommand)
            
            const {type, payload} = otherCommand
            if (type === "thread-select") {
                const currThread = threads.find(thread => thread.id === parseInt(payload));
                if (currThread) {
                    // console.log("Selected thread: ", currThread)
                    setSelectedThread(currThread);
                }
            }
        }
    }, [otherCommand])

    const sendDebuggerCommand = (type: string, command: string, args: any = {}) => {
        vscode.postMessage({
            type,
            command,
            args,
        });
        };
    return (
    <div className="debug-visualizer">
        <div className="row-container">
            <ControlPanel metadata={metadata} selectedThread={selectedThread} sendDebuggerCommand={sendDebuggerCommand} />
            <ThreadController threads={threads} selectedThread={selectedThread} setSelectedThread={setSelectedThread} sendDebuggerCommand={sendDebuggerCommand} otherCommand={otherCommand} />
        </div>
        <div className="col-container">
            <div className="left-col">
                <MemoryInspection metadata={metadata} sendDebuggerCommand={sendDebuggerCommand} memoryInspection={memoryInspection} memoryData={memoryData} setMemoryData={setMemoryData} address={address} setAddress={setAddress} words={words} setWords={setWords} />
                <Breakpoints breakpoints={breakpoints} sendDebuggerCommand={sendDebuggerCommand} />
            </div>
            <div className="right-col">
                <Heap heap={heap} setMemoryData={setMemoryData} setAddress={setAddress} setWords={setWords} wordSize={metadata.wordSize} />
            </div>
        </div>
    </div>
    );
}

export default DebugVisualizer;