import { StackFrameType } from "./types/memory";

function StackFrames({frames, selectedFrame, setSelectedFrame, sendDebuggerCommand}: {frames: StackFrameType[], selectedFrame: StackFrameType, setSelectedFrame: Function, sendDebuggerCommand: Function}) {
    function handleFrameSelect(frame: StackFrameType) {
        if (frame === selectedFrame) return;
        setSelectedFrame(frame);
        sendDebuggerCommand("debug-command", `frame select ${frame.frameIndex}`);
    }
    
    return (
    <div className="frames">
        <h4 className="frames-header">Stack Frames</h4>
        <div className="frames-container">
            {frames?.map(frame => (
                <div title={`${frame.function}, ${frame.filename}:${frame.lineNumber}`} onClick={() => handleFrameSelect(frame)} className={`stack-frame${frame === selectedFrame ? "-selected" : ""}`}>
                    <p>{`${frame.function}, ${frame.filename}:${frame.lineNumber}`}</p>
                </div>
            ))}
        </div>
    </div>
    );
}

export default StackFrames;