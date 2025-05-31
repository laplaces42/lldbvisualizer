import { Redo, Play, Pause, FastForward, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { MetadataType, ThreadType } from './types/memory';



function ControlPanel({metadata, sendDebuggerCommand, selectedThread}: {metadata: MetadataType, sendDebuggerCommand: Function, selectedThread: ThreadType}) {
    
    return(
    <div className="control-panel">
        <div className="control-buttons">
            <div title='Play'>
                <Play onClick={() => sendDebuggerCommand("debug-command", "run")} className='control-button' />
            </div>
            <div onClick={() => sendDebuggerCommand("debug-command", "continue")} title='Continue'>
                <FastForward className='control-button' />
            </div>
            <div onClick={() => sendDebuggerCommand("debug-command", "process interrupt")} className='Pause'>
                <Pause className='control-button' />
            </div>
            <div onClick={() => sendDebuggerCommand("debug-command", "next")} className='Step Over'>
                <Redo className='control-button' />
            </div>
            <div onClick={() => sendDebuggerCommand("debug-command", "step")} title='Step Into'>
                <ArrowDownToLine className='control-button' />
            </div>
            <div onClick={() => sendDebuggerCommand("debug-command", "finish")} title='Step Out'>
                <ArrowUpFromLine className='control-button' />
            </div>
        </div>
        <div>
            {metadata.processID !== -1 && selectedThread && <p style={{ paddingRight:"10px"}}>{`Process #${metadata.processID}, ${selectedThread.filename}:${selectedThread.lineNumber}`}</p>}
            
        </div>
    </div>
    )
}
// redo 
// play
// pause
// fast-forward
// arrow-down-to-line
// arrow-up-from-line
export default ControlPanel;