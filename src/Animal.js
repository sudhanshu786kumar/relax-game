import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Animal({ position, color }) {
    const animalRef = useRef();

    useFrame(() => {
        if (animalRef.current) {
            animalRef.current.position.x += Math.sin(Date.now() * 0.001) * 0.05; // Simulate random movement
            animalRef.current.position.z += Math.cos(Date.now() * 0.001) * 0.05;
        }
    });

    return (
        <mesh ref={animalRef} position={position}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}