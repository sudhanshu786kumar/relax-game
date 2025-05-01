import { useLoader } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import LeaveTexture from "../public/textures/leaves.jpg";
import BarkTexture from "../public/textures/bark.jpg";

export default function Tree({ position }) {
    // Generate random sizes for the trunk and leaves using useMemo to prevent retriggering
    const { trunkHeight, trunkRadius, leavesRadius } = useMemo(() => ({
        trunkHeight: Math.random() * 1.5 + 24.5, // Random height between 4.5 and 6
        trunkRadius: Math.random() * 0.3 + 3.3, // Random radius between 1.3 and 1.6
        leavesRadius: Math.random() * 10.5 + 20.1, // Random radius between 7.1 and 8.6
    }), []);

    const leavesTexture = useLoader(THREE.TextureLoader, LeaveTexture);
    const barkTexture = useLoader(THREE.TextureLoader, BarkTexture);

    // Generate random positions for leaves clusters with reduced complexity
    const leavesClusters = useMemo(() => {
        const clusters = [];
        const clusterCount = Math.floor(Math.random() * 3) + 3; // Reduced from 5 to 3
        for (let i = 0; i < clusterCount; i++) {
            clusters.push({
                position: [
                    (Math.random() - 0.5) * leavesRadius,
                    trunkHeight + Math.random() * leavesRadius * 0.5,
                    (Math.random() - 0.5) * leavesRadius,
                ],
                size: Math.random() * 1.5 + 1, // Reduced size range
            });
        }
        return clusters;
    }, [trunkHeight, leavesRadius]);

    return (
        <group position={position}>
            {/* Trunk with reduced geometry segments */}
            <mesh position={[0, trunkHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[trunkRadius, trunkRadius, trunkHeight, 8]} /> {/* Reduced from 16 to 8 segments */}
                <meshStandardMaterial   map={barkTexture}
                        transparent={true}

                        alphaTest={0.5}
                        emissive="black"
                        emissiveIntensity={0.3} />
            </mesh>

            {/* Leaves Clusters with reduced geometry segments */}
            {leavesClusters.map((cluster, index) => (
                <mesh key={index} position={cluster.position} castShadow>
                    <sphereGeometry args={[cluster.size, 18, 28]} /> {/* Reduced from 16 to 8 segments */}
                    <meshStandardMaterial
                        map={leavesTexture}
                        transparent={true}
                        alphaTest={0.5}
                        emissive="green"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}