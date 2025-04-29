import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RainEffect() {
    const rainRef = useRef();

    useEffect(() => {
        const rainGeometry = new THREE.BufferGeometry();
        const rainCount = 10000; // Number of raindrops
        const positions = new Float32Array(rainCount * 3); // x, y, z for each raindrop

        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 500; // Random x position
            positions[i * 3 + 1] = Math.random() * 500; // Random y position (height)
            positions[i * 3 + 2] = (Math.random() - 0.5) * 500; // Random z position
        }

        rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        if (rainRef.current) {
            rainRef.current.geometry = rainGeometry;
        }
    }, []);

    useFrame(() => {
        if (rainRef.current && rainRef.current.geometry.attributes.position) {
            const positions = rainRef.current.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 2; // Move raindrop down (y-axis)

                // Reset raindrop to the top if it falls below ground level
                if (positions[i + 1] < 0) {
                    positions[i + 1] = 500;
                }
            }

            rainRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={rainRef}>
            <bufferGeometry />
            <pointsMaterial
                color="#00aaff"
                size={0.5}
                transparent={true}
                opacity={0.6}
            />
        </points>
    );
}