import HeapInfo from "./HeapInfo";
import { HeapBlockType, HeapMemoryType } from "./types/memory";
import React, { useState } from "react";

function HeapBlock({block, multiplier, heap, setMemoryData, setAddress, setWords, wordSize}: {block: HeapBlockType, multiplier: number, heap: HeapMemoryType, setMemoryData: Function, setAddress: Function, setWords: Function, wordSize: number}) {
  const blockSize = block.size * multiplier;
  const offset = (parseInt(heap.end, 16) - parseInt(block.address, 16) - block.size) * multiplier;
  const [hoveredBlock, setHoveredBlock] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onClick={() => {setMemoryData(block.raw); setAddress(block.address); setWords((block.size/ wordSize).toString())}} onMouseMove={handleMouseMove} onMouseEnter={() => setHoveredBlock(true)} onMouseLeave={() => setHoveredBlock(false)} style={{height: blockSize, top: `${offset}px`}} className={"heap-block"}>
      {hoveredBlock && (HeapInfo({block, position: mousePos}))}
    </div>
  );
}

export default HeapBlock;