import StackFrames from "./StackFrames";
import LocalVars from "./LocalVars";
import { StackFrameType } from "./types/memory";
import { useState } from "react";

function StackController({frames, selectedFrame, setSelectedFrame, sendDebuggerCommand}: {frames: StackFrameType[], selectedFrame: StackFrameType, setSelectedFrame: Function, sendDebuggerCommand: Function}) {
    

    return (<div className="stack-controller">
        <StackFrames frames={frames} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} sendDebuggerCommand={sendDebuggerCommand} />
        <LocalVars  locals={selectedFrame ? selectedFrame.locals: []} />
    </div>);
}

export default StackController;