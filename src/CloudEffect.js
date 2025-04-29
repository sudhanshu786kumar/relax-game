import React from "react";
import { Cloud } from "@react-three/drei";

export default function CloudEffect() {
    const cloudCount = 10; // Number of large clouds
    const clouds = Array.from({ length: cloudCount }, () => ({
        position: [
            (Math.random() - 0.5) * 2000, // Random x position in a larger range
            Math.random() * 200 + 10, // Random y position (higher in the sky)
            (Math.random() - 0.5) * 2000, // Random z position in a larger range
        ],
        scale: Math.random() * 10 + 5, // Larger scale between 5 and 15
    }));

    return (
        <>
            {clouds.map((cloud, index) => (
                <Cloud
                    key={index}
                    position={cloud.position}
                    scale={cloud.scale}
                />
            ))}
        </>
    );
}