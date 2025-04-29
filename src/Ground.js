import React from "react";

export default function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="olive" /> {/* Use a solid green color */}
        </mesh>
    );
}