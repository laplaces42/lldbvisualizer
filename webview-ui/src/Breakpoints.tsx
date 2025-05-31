import { useEffect, useState } from "react";
import { BreakpointType } from "./types/memory";
import { Trash } from 'lucide-react';

function Breakpoints({breakpoints, sendDebuggerCommand}: {breakpoints: BreakpointType[], sendDebuggerCommand: Function}) {
    const [breakpointsState, setBreakpointsState] = useState(breakpoints);

    useEffect(() => {
        setBreakpointsState(breakpoints)
    }, [breakpoints])

    function handleToggleBreakpoint(bpId: number) {
        // const newState = !breakpointsState.filter(bp => bp.id === bpId)[0].enabled
        const newState = !breakpointsState.find(bp => bp.id === bpId)?.enabled
        setBreakpointsState((prev) =>
            prev.map(bp => bp.id === bpId ? { ...bp, enabled: newState, locations: bp.locations.map((loc) => ({...loc, enabled: newState})) } : bp)
        );

        if (newState) {
            sendDebuggerCommand("debug-command", `break enable ${bpId}`)
        } else {
            sendDebuggerCommand("debug-command", `break disable ${bpId}`)

        }
    };

    function handleToggleLocation(bpId: number, locId: number) {
        const newState = !breakpointsState.find(bp => bp.id === bpId)?.locations.find(loc => loc.id === locId)?.enabled
        setBreakpointsState((prev) =>
            prev.map(bp =>
            bp.id === bpId
                ? {
                    ...bp,
                    locations: bp.locations.map(loc =>
                    loc.id === locId ? { ...loc, enabled: newState } : loc
                    ),
                }
                : bp
                )
            );

        if (newState) {
            sendDebuggerCommand("debug-command", `break enable ${bpId}.${locId}`)
        } else {
            sendDebuggerCommand("debug-command", `break disable ${bpId}.${locId}`)

        }
    };

    function handleDeleteBreakpoint(bpId: number) {
        setBreakpointsState((prev) => prev.filter(bp => bp.id !== bpId))
        sendDebuggerCommand("debug-command", `break delete ${bpId}`)
    }

    return (
    <div className="breakpoints">
        <h4 className="breakpoints-header">Breakpoints</h4>
        <div className="breakpoints-container">
        {breakpointsState.map((bp) => (
            <details key={bp.id} className="breakpoint-item">
                <summary className="breakpoint-summary">
                    <span className="caret">▶</span>
                <input
                    type="checkbox"
                    className="breakpoint-enabled"
                    checked={bp.enabled}
                    onChange={() => handleToggleBreakpoint(bp.id)}
                />

                <span title={bp.names.length > 0 ? bp.names.join(", ") : undefined} className="breakpoint-label">{`Breakpoint #${bp.id}`}</span>{""}
                <span style={{color: "grey"}} className="breakpoint-label"><i>{`- ${bp.locations.length} locations`}</i></span>
                <button onClick={() => handleDeleteBreakpoint(bp.id)} className="delete-bp">
                    <Trash />
                </button>
                </summary>
                <ul className="breakpoint-location-list">
                {bp.locations.map((loc) => (
                    <li key={loc.id} className="breakpoint-location">
                    <input
                        type="checkbox"
                        checked={loc.enabled}
                        onChange={() => handleToggleLocation(bp.id, loc.id)}
                    />
                    <span title={loc.description} className="breakpoint-location-label">
                        {`${loc.file}:${loc.line}`} <i style={{color: "grey"}}>(0x${loc.address.toString(16)})</i>
                    </span>
                    </li>
                ))}
                </ul>
            </details>
        ))}


        </div>
    </div>
    );
}

export default Breakpoints;