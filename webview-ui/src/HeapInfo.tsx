import { HeapBlockType } from "./types/memory";


function HeapInfo({block, position}: {block: HeapBlockType, position: {x: number, y: number}}) {
  const { address, size } = block;

  return (
    <div style={{
        top: position.y - 110,  // offset so cursor doesn't cover it
        left: position.x - 150,
      }} className={"heap-block-info"}>
      <h3>Allocated Block</h3>
      <p>Address: {address}</p>
      <p>Bytes: {size}</p>
    </div>
  );
}

export default HeapInfo;