import { RegisterType } from "./types/memory";

function Registers({registers}: {registers: RegisterType[]}) {
    return (
    <div className="registers">
        <h4 className="registers-header">Registers</h4>
        <div className="registers-container">
            {registers?.map(register => (
                <div className="single-register">
                    <p>{register.name}</p>
                    <p>{register.value}</p>
                </div>
                
            ))}
        </div>
    </div>
    );
}

export default Registers;