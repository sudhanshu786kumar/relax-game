import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { multiplayerManager } from './server/MultiplayerManager';
import * as THREE from 'three';
import Pet from './Pet';

// Define keyboard controls
const keyboardControls = [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] }
];

const Player = React.forwardRef(({ petType }, ref) => {
    const group = useRef();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const moveSpeed = 5;
    const rotationSpeed = 5;

    // Initialize keyboard controls
    const [subscribeKeys, getKeys] = useKeyboardControls();

    useEffect(() => {
        // Set up keyboard controls
        const unsubscribe = subscribeKeys(
            (state) => ({
                forward: state.forward,
                backward: state.backward,
                left: state.left,
                right: state.right
            }),
            (pressed) => {
                if (pressed.forward || pressed.backward || pressed.left || pressed.right) {
                    updatePosition();
                }
            }
        );

        return () => unsubscribe();
    }, []);

    const updatePosition = () => {
        if (!group.current) return;

        const state = getKeys();
        const { forward, backward, left, right } = state;
        
        // Calculate movement direction
        direction.current.set(0, 0, 0);
        if (forward) direction.current.z -= 1;
        if (backward) direction.current.z += 1;
        if (left) direction.current.x -= 1;
        if (right) direction.current.x += 1;

        // Normalize direction if moving
        if (direction.current.length() > 0) {
            direction.current.normalize();
        }

        // Calculate velocity
        velocity.current.copy(direction.current).multiplyScalar(moveSpeed);

        // Update rotation based on movement direction
        if (direction.current.length() > 0) {
            const targetRotation = Math.atan2(direction.current.x, direction.current.z);
            group.current.rotation.y = THREE.MathUtils.lerp(
                group.current.rotation.y,
                targetRotation,
                rotationSpeed * 0.016 // Assuming 60fps
            );
        }

        // Update position
        group.current.position.add(velocity.current.multiplyScalar(0.016)); // Assuming 60fps

        // Send position update to server
        multiplayerManager.updatePlayerState(
            {
                x: group.current.position.x,
                y: group.current.position.y,
                z: group.current.position.z
            },
            { y: group.current.rotation.y }
        );
    };

    useFrame(() => {
        updatePosition();
    });

    return (
        <group ref={(node) => {
            group.current = node;
            if (ref) {
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
        }}>
            {/* Body */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="peachpuff" />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            {/* Right Arm */}
            <mesh position={[0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color="#4ECDC4" />
            </mesh>
            {/* Pet */}
            {petType && petType !== "none" && (
                <Pet type={petType} playerRef={group} />
            )}
        </group>
    );
});

export default Player;