import { StackLocalType } from "./types/memory";

function LocalVars({locals}: {locals: StackLocalType[]}) {
    return (
    <div className="locals">
        <h4 className="locals-header">Local Variables</h4>
        <div className="locals-container">
            {locals.map(local => (
                <p>{`(${local.type}) ${local.name}${local.value === "null" ? "" : ` = ${local.value}`}`} <i style={{color: "grey", fontSize: "x-small"}}>{`0x${local.address.toString(16)}`}</i></p>
            ))}
        </div>
    </div>
    );
}

export default LocalVars;