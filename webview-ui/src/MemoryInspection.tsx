import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MetadataType } from './types/memory';
import { parse } from 'path';

function MemoryInspection({metadata, sendDebuggerCommand, memoryInspection, memoryData, setMemoryData, address, setAddress, words, setWords}: {metadata: MetadataType, sendDebuggerCommand: Function, memoryInspection: any, memoryData: string, setMemoryData: Function, address: string, setAddress: Function, words: string, setWords: Function}) {

    
    const [memoryError, setMemoryError] = useState("")
    

    useEffect(() => {
        if (!memoryInspection) return
        const {data, error} = memoryInspection
        if (error) {
            setMemoryError(error)
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return
        }

        if (data === null) {
            setMemoryError("No data returned")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return
        }

        setMemoryData(data)
    }, [memoryInspection])

    function errorCheck() {
        if (address === "") {
            setMemoryError("Address must be populated")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return false
        }
        if (words === "") {
            setMemoryError("Number of words must be populated")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return false
        }

        if (!address.startsWith("0x")) {
            setMemoryError("Address must start with 0x")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return false
        }
        if (parseInt(words) < 1 || parseInt(words) > 256) {
            setMemoryError("Number of words must be between 1 and 256")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return false
        }

        if (metadata.processState === 6) {
            setMemoryError("Memory inspection is not available when the process is running")
            setTimeout(() => {
                setMemoryError("")
            }, 2000)
            return false
        }
        return true
    }
    
    function handleSubmit(checkErrors: boolean) {
        if (checkErrors) {
            if(!errorCheck()) return
        }

        const addressInt = parseInt(address, 16)
        const memoryAccess = { "address": addressInt, "words": parseInt(words) }
        sendDebuggerCommand("memory-inspect", memoryAccess)
    }

    function parseMemoryData(data: string) {
        let parsedData = []
        for (let i = 0; i < data.length; i += 2 * metadata.wordSize) {
            const offset = i / 2
            const rawData = data.slice(i, i + 2 * metadata.wordSize)
            const hexData = metadata.endianness === "little" ? parseInt(rawData.split("").reverse().join(''), 16) : parseInt(rawData, 16)
            parsedData.push({offset, rawData, hexData})
            // console.log(data.slice(i, i + 2 * metadata.wordSize))
        }

        return parsedData
    }
    
    const parsedData = parseMemoryData(memoryData)

    
    
    return (
    <div className="memory-inspection">
        <h4 className="memory-inspection-header">Memory Inspection</h4>
        <div className="memory-inspection-container">
            <div className="memory-search-bar">
                <div className='search-bar'>
                    <label htmlFor="address">Address:</label>
                    <input placeholder='0x...' onChange={(e) => setAddress(e.target.value)} value={address} type="text" id="address" name="address" className="address-input" />
                    <label htmlFor="words">Words:</label>
                    <input onChange={(e) => setWords(e.target.value)} min={1} max={256} step={1} value={words} type="number" id="words" name="number" className="word-count-input" />
                </div>
                <Search onClick={() => handleSubmit(true)} className='search-button' />
            </div>
            {memoryError !== "" &&
            <p className='memory-error'>{memoryError}</p>
            }

            {parsedData.length > 0 && (
                <div className='memory-table-container'>
                    <table className="memory-table">
                        <thead>
                            <tr>
                                <th>Offset</th>
                                <th>Raw Data</th>
                                <th>Hex Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.map((entry, idx) => (
                                <tr key={idx}>
                                    <td>{`+${entry.offset}`}</td>
                                    <td>{entry.rawData}</td>
                                    <td>{`0x${entry.hexData.toString(16)}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>);
}

export default MemoryInspection;