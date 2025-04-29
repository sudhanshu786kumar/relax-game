import React, { forwardRef } from "react";

const Player = forwardRef((props, ref) => {
    return (
        <group ref={ref} {...props} castShadow>
            {/* Body */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="peachpuff" />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            {/* Right Arm */}
            <mesh position={[0.75, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
                <meshStandardMaterial color="blue" />
            </mesh>
        </group>
    );
});

export default Player;