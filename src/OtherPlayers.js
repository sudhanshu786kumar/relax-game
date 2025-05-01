import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { multiplayerManager } from './server/MultiplayerManager';
import * as THREE from 'three';
import Pet from './Pet';

// Generate a random color for each player
const generatePlayerColor = (id) => {
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#FFEEAD', // Yellow
        '#D4A5A5', // Pink
        '#9B59B6', // Purple
        '#E67E22', // Orange
        '#1ABC9C', // Turquoise
        '#F1C40F'  // Gold
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

const OtherPlayer = React.memo(React.forwardRef(({ player, color }, ref) => {
    return (
        <group ref={ref} castShadow>
            {/* Body */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="peachpuff" />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Right Arm */}
            <mesh position={[0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Pet - always show */}
            <Pet type="dog" playerRef={ref} />
        </group>
    );
}));

export default function OtherPlayers() {
    const [otherPlayers, setOtherPlayers] = useState([]);
    const playerGroups = useRef(new Map());
    const lastUpdateTime = useRef(Date.now());

    const updatePlayers = useCallback(() => {
        const players = multiplayerManager.getOtherPlayers();
        const currentTime = Date.now();
        
        // Only update state if there are actual changes
        if (players.length !== otherPlayers.length || 
            currentTime - lastUpdateTime.current > 100) {
            setOtherPlayers(players);
            lastUpdateTime.current = currentTime;
        }
    }, [otherPlayers.length]);

    useEffect(() => {
        const interval = setInterval(updatePlayers, 100);
        return () => clearInterval(interval);
    }, [updatePlayers]);

    useFrame((state, delta) => {
        // Smoothly interpolate player positions and rotations
        otherPlayers.forEach(player => {
            const group = playerGroups.current.get(player.id);
            if (group) {
                const targetPosition = new THREE.Vector3(
                    player.position.x,
                    player.position.y,
                    player.position.z
                );

                // Use lerp for smooth movement
                group.position.lerp(targetPosition, 0.5);

                // Rotation interpolation if available
                if (player.rotation) {
                    const targetRotation = player.rotation.y;
                    group.rotation.y = THREE.MathUtils.lerp(
                        group.rotation.y,
                        targetRotation,
                        0.5
                    );
                }
            }
        });
    });

    return (
        <>
            {otherPlayers.map((player) => {
                const color = generatePlayerColor(player.id);
                return (
                    <OtherPlayer
                        key={player.id}
                        ref={(ref) => {
                            if (ref) {
                                playerGroups.current.set(player.id, ref);
                                // Set initial position
                                ref.position.set(
                                    player.position.x,
                                    player.position.y,
                                    player.position.z
                                );
                                if (player.rotation) {
                                    ref.rotation.y = player.rotation.y;
                                }
                            } else {
                                playerGroups.current.delete(player.id);
                            }
                        }}
                        player={player}
                        color={color}
                    />
                );
            })}
        </>
    );
} 