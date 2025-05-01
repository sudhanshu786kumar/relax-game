import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Pet({ type, playerRef }) {
    const petRef = useRef();
    const mixer = useRef(null);
    const clock = useRef(new THREE.Clock());
    const [petGeometry, setPetGeometry] = useState(null);
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [animationTimer, setAnimationTimer] = useState(0);

    // Create pet geometry
    const createPetGeometry = (type) => {
        const group = new THREE.Group();
        
        if (type === "dog") {
            // Body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 2),
                new THREE.MeshStandardMaterial({ color: "brown" })
            );
            body.position.y = 0.5;
            group.add(body);

            // Head
            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 16, 16),
                new THREE.MeshStandardMaterial({ color: "brown" })
            );
            head.position.set(0, 1, 1.2);
            group.add(head);

            // Ears
            const leftEar = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.4, 0.1),
                new THREE.MeshStandardMaterial({ color: "brown" })
            );
            leftEar.position.set(-0.3, 1.3, 1.2);
            leftEar.rotation.z = -0.3;
            group.add(leftEar);

            const rightEar = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.4, 0.1),
                new THREE.MeshStandardMaterial({ color: "brown" })
            );
            rightEar.position.set(0.3, 1.3, 1.2);
            rightEar.rotation.z = 0.3;
            group.add(rightEar);

            // Tail
            const tail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8),
                new THREE.MeshStandardMaterial({ color: "brown" })
            );
            tail.position.set(0, 0.5, -1.2);
            tail.rotation.x = 0.5;
            group.add(tail);

            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
            const legMaterial = new THREE.MeshStandardMaterial({ color: "brown" });

            const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
            frontLeftLeg.position.set(-0.4, 0, 0.5);
            group.add(frontLeftLeg);

            const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
            frontRightLeg.position.set(0.4, 0, 0.5);
            group.add(frontRightLeg);

            const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
            backLeftLeg.position.set(-0.4, 0, -0.5);
            group.add(backLeftLeg);

            const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
            backRightLeg.position.set(0.4, 0, -0.5);
            group.add(backRightLeg);
        } else if (type === "cat") {
            // Cat geometry
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 1.2),
                new THREE.MeshStandardMaterial({ color: "gray" })
            );
            body.position.y = 0.4;
            group.add(body);

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 16, 16),
                new THREE.MeshStandardMaterial({ color: "gray" })
            );
            head.position.set(0, 0.7, 0.8);
            group.add(head);

            const leftEar = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.3, 0.1),
                new THREE.MeshStandardMaterial({ color: "gray" })
            );
            leftEar.position.set(-0.2, 1, 0.8);
            leftEar.rotation.z = -0.3;
            group.add(leftEar);

            const rightEar = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.3, 0.1),
                new THREE.MeshStandardMaterial({ color: "gray" })
            );
            rightEar.position.set(0.2, 1, 0.8);
            rightEar.rotation.z = 0.3;
            group.add(rightEar);

            const tail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8),
                new THREE.MeshStandardMaterial({ color: "gray" })
            );
            tail.position.set(0, 0.4, -0.8);
            tail.rotation.x = 0.3;
            group.add(tail);

            const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
            const legMaterial = new THREE.MeshStandardMaterial({ color: "gray" });

            const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
            frontLeftLeg.position.set(-0.3, 0, 0.3);
            group.add(frontLeftLeg);

            const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
            frontRightLeg.position.set(0.3, 0, 0.3);
            group.add(frontRightLeg);

            const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
            backLeftLeg.position.set(-0.3, 0, -0.3);
            group.add(backLeftLeg);

            const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
            backRightLeg.position.set(0.3, 0, -0.3);
            group.add(backRightLeg);
        }

        return group;
    };

    useEffect(() => {
        const pet = createPetGeometry(type);
        setPetGeometry(pet);
        petRef.current = pet;

        // Initialize animation mixer
        mixer.current = new THREE.AnimationMixer(pet);

        // Create animations
        const animations = {
            idle: {
                duration: 2,
                tracks: [
                    new THREE.VectorKeyframeTrack(
                        '.children[4].rotation[x]',
                        [0, 0.5, 1, 1.5, 2],
                        [0.5, 0.8, 0.5, 0.2, 0.5]
                    )
                ]
            },
            walk: {
                duration: 1,
                tracks: [
                    new THREE.VectorKeyframeTrack(
                        '.children[5].position[y]',
                        [0, 0.25, 0.5, 0.75, 1],
                        [0, 0.2, 0, -0.2, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[6].position[y]',
                        [0, 0.25, 0.5, 0.75, 1],
                        [0, -0.2, 0, 0.2, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[7].position[y]',
                        [0, 0.25, 0.5, 0.75, 1],
                        [0, -0.2, 0, 0.2, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[8].position[y]',
                        [0, 0.25, 0.5, 0.75, 1],
                        [0, 0.2, 0, -0.2, 0]
                    )
                ]
            },
            jump: {
                duration: 1,
                tracks: [
                    new THREE.VectorKeyframeTrack(
                        '.position[y]',
                        [0, 0.5, 1],
                        [0, 1, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[5].rotation[x]',
                        [0, 0.5, 1],
                        [0, -0.5, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[6].rotation[x]',
                        [0, 0.5, 1],
                        [0, -0.5, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[7].rotation[x]',
                        [0, 0.5, 1],
                        [0, 0.5, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[8].rotation[x]',
                        [0, 0.5, 1],
                        [0, 0.5, 0]
                    )
                ]
            },
            eat: {
                duration: 1,
                tracks: [
                    new THREE.VectorKeyframeTrack(
                        '.children[1].rotation[x]',
                        [0, 0.5, 1],
                        [0, 0.3, 0]
                    ),
                    new THREE.VectorKeyframeTrack(
                        '.children[4].rotation[x]',
                        [0, 0.5, 1],
                        [0.5, 0.8, 0.5]
                    )
                ]
            }
        };

        // Create animation actions
        const actions = {};
        Object.entries(animations).forEach(([name, animation]) => {
            const clip = new THREE.AnimationClip(name, animation.duration, animation.tracks);
            actions[name] = mixer.current.clipAction(clip);
            actions[name].clampWhenFinished = true;
        });

        // Set up animation transitions
        const playAnimation = (name) => {
            if (currentAnimation === name) return;
            
            if (currentAnimation) {
                actions[currentAnimation].fadeOut(0.2);
            }
            
            actions[name].reset().fadeIn(0.2).play();
            setCurrentAnimation(name);
        };

        // Start with idle animation
        playAnimation('idle');

        return () => {
            if (mixer.current) {
                mixer.current.stopAllAction();
            }
        };
    }, [type]);

    useFrame((state, delta) => {
        if (!playerRef.current || !petRef.current || !mixer.current) return;

        const player = playerRef.current;
        const pet = petRef.current;

        // Update animation timer
        setAnimationTimer(prev => prev + delta);

        // Calculate distance between pet and player
        const distance = pet.position.distanceTo(player.position);
        const targetPosition = new THREE.Vector3();

        // Randomly trigger different animations
        if (animationTimer > 5) {
            const random = Math.random();
            if (random < 0.3) {
                // Jump
                pet.position.y = 0;
                mixer.current.timeScale = 1;
                setCurrentAnimation('jump');
            } else if (random < 0.6) {
                // Eat
                mixer.current.timeScale = 1;
                setCurrentAnimation('eat');
            } else {
                // Walk around
                mixer.current.timeScale = 1;
                setCurrentAnimation('walk');
            }
            setAnimationTimer(0);
        }

        // Follow player with some distance
        if (distance > 2) {
            // Calculate target position behind the player
            targetPosition.copy(player.position);
            targetPosition.z += 2; // Stay 2 units behind the player

            // Add some random movement
            targetPosition.x += Math.sin(animationTimer) * 0.5;
            targetPosition.z += Math.cos(animationTimer) * 0.5;

            // Smooth movement
            pet.position.lerp(targetPosition, 0.05);

            // Rotate pet to face movement direction
            const direction = new THREE.Vector3();
            direction.subVectors(targetPosition, pet.position).normalize();
            const targetRotation = Math.atan2(direction.x, direction.z);
            pet.rotation.y = THREE.MathUtils.lerp(pet.rotation.y, targetRotation, 0.1);

            // Adjust animation speed based on distance
            const speed = Math.min(1, distance / 5);
            mixer.current.timeScale = speed;
        } else {
            // Slow down animations when close to player
            mixer.current.timeScale = 0.5;
        }

        // Update animation mixer
        mixer.current.update(delta);
    });

    if (!petGeometry) return null;

    return (
        <group 
            ref={petRef} 
            position={[0, 0, 0]} 
            scale={[1.5, 1.5, 1.5]} // Increased scale
            rotation={[0, 0, 0]}
        >
            <primitive object={petGeometry} />
        </group>
    );
}