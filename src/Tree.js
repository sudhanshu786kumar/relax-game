import React from "react";

export default function Tree({ position }) {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                <meshStandardMaterial color="brown" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 3, 0]} castShadow>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="green" />
            </mesh>
        </group>
    );
}