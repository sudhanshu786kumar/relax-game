import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Pet({ type, playerRef }) {
    const petRef = useRef();

    useFrame(() => {
        if (playerRef.current && petRef.current) {
            const playerPos = playerRef.current.position;

            // Calculate the desired offset position for the pet
            const offsetX = 1; // Distance on the x-axis
            const offsetY = 1; // Height offset (can be adjusted if needed)
            const offsetZ = 3; // Distance behind the player on the z-axis

            // Smoothly move the pet to the offset position relative to the player
            petRef.current.position.x +=
                (playerPos.x + offsetX - petRef.current.position.x) * 0.2;
            petRef.current.position.z +=
                (playerPos.z + offsetZ - petRef.current.position.z) * 0.2;
            petRef.current.position.y +=  (playerPos.y + offsetY - petRef.current.position.y) * 0.2; // Keep the pet at the same height as the player
        }
    });

    return (
        <mesh ref={petRef} position={[2, 2, 0]}>
            {type === "dog" && <sphereGeometry args={[0.5, 16, 16]} />}
            {type === "cat" && <boxGeometry args={[0.5, 0.8, 0.5]} />}
            <meshStandardMaterial color={type === "dog" ? "brown" : "gray"} />
        </mesh>
    );
}