import { HeapMemoryType } from "./types/memory";
import { useMeasure } from "@uidotdev/usehooks";
import HeapBlock from "./HeapBlock";
import { useRef } from "react";

function Heap( {heap, setMemoryData, setAddress, setWords, wordSize}: {heap: HeapMemoryType, setMemoryData: Function, setAddress: Function, setWords: Function, wordSize: number} ) {
    const { start, end, blocks } = heap;
    const heapSize = parseInt(end, 16) - parseInt(start, 16);
    const [ref, { width, height }] = useMeasure();
    const localRef = useRef<HTMLDivElement | null>(null);
    
    const baseMultiplier = 0.08;
    let pixelHeight = heapSize * baseMultiplier;
    pixelHeight = Math.max(300, Math.min(pixelHeight, 1200));

    return (
        <div className="heap">
            <h4 className="heap-header">Heap</h4>
            <div className="heap-container">
                <div style={ {height: `${pixelHeight}px`}} ref={(node) => {ref(node); localRef.current = node;}} className="heap-obj">
                    {blocks.map((block, index) => (
                        <HeapBlock key={index} block={block} multiplier={(height == null ? 0 : height) / heapSize} heap={heap} setMemoryData={setMemoryData} setAddress={setAddress} setWords={setWords} wordSize={wordSize} />
                    ))}
                </div>
            </div>
        </div>
    );

}

export default Heap;