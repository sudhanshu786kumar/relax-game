import React, { useState } from "react";
import Fire from "./Fire";

export default function Tent({ position }) {
    const [firePositions, setFirePositions] = useState([
        [15, 1, 10], // position 1
      
    ]);
    return (
        <mesh position={position} castShadow>
              {/* Render Fires */}
              {firePositions.map((pos, index) => (
                            <Fire key={index} position={pos} />
                        ))}
            {/* Tent Base */}
            <boxGeometry args={[20, 5, 14]} />
            <meshStandardMaterial color="brown" />

            {/* Tent Roof */}
            <mesh position={[0, 10, 0]}>
                <coneGeometry args={[20, 14, 14]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </mesh>
    );
}