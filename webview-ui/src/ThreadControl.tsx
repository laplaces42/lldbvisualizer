import StackController from "./StackController";
import Registers from "./Registers";
import { StackFrameType, ThreadType } from "./types/memory";
import { useEffect, useRef, useState } from "react";

function ThreadController({threads, selectedThread, setSelectedThread, sendDebuggerCommand, otherCommand}: {threads: ThreadType[], selectedThread: ThreadType, setSelectedThread: Function, sendDebuggerCommand: Function, otherCommand: any}) {
    const frames = selectedThread?.stack
    const [selectedFrame, setSelectedFrame] = useState(selectedThread?.stack[0])
    useEffect(() => {
            if (!frames || frames.length === 0) return;
            if (!selectedFrame){
                setSelectedFrame(frames[0]);
                return;
            }
    
            const selectedFrameExists = frames.some(frame => frame.frameIndex === selectedFrame.frameIndex);
            if (selectedFrameExists) {
                setSelectedFrame(frames.find(frame => frame.frameIndex === selectedFrame.frameIndex) ?? frames[0]);
            } else {
                setSelectedFrame(frames[0]);
            }
        }, [frames]);

    useEffect(() => {
            if (otherCommand) {
                // console.log("Other command received: ", otherCommand)
                const {type, payload} = otherCommand
                if (type === "frame-select") {
                    const currFrame = frames.find(frames => frames.frameIndex === parseInt(payload));
                    if (currFrame) {
                        // console.log("Selected frame: ", currFrame)
                        setSelectedFrame(currFrame);
                    }
                }
            }
        }, [otherCommand])

    function handleThreadSelect(index: number)  {
        const thread = threads[index]
        if (thread === selectedThread) return;
        setSelectedThread(thread);
        setSelectedFrame(thread.stack[0]);
        sendDebuggerCommand("debug-command", `thread select ${thread.index}`)
    }
    
  
    return (
    <div className="thread-controller">
        <div className="thread-dropdown">
            <label htmlFor="thread-selector">Thread Selector: </label>
            <select onChange={(e) => handleThreadSelect(parseInt(e.target.value) - 1)} name="thread-selector" id="thread-selector">
                {threads.map(thread => (
                    <option value={thread.index}>{`Thread #${thread.index} - TID: ${thread.id}, PC @ ${thread.pc} (${thread.function})`}</option>
                ))}
            </select>
        </div>
        <div className="thread-info">
            <StackController frames={selectedThread?.stack} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} sendDebuggerCommand={sendDebuggerCommand} />
            <Registers registers={selectedThread?.registers} />
        </div>
    </div>
    );
}

export default ThreadController;