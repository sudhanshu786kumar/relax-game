import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Fire({ position }) {
    const fireRef = useRef();

    // Animate the fire to flicker
    useFrame(() => {
        if (fireRef.current) {
            fireRef.current.scale.set(
                1 + Math.random() * 0.1,
                1 + Math.random() * 0.1,
                1 + Math.random() * 0.1
            );
        }
    });

    return (
        <group position={position}>
            {/* Fireball */}
            <mesh ref={fireRef}>
                <sphereGeometry args={[2, 0.2, 10]} />
                <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={1} />
            </mesh>

            {/* Fire Glow */}
            <pointLight color="orange" intensity={2} distance={10} />
        </group>
    );
}