import React from "react";
import floortexture from "../public/textures/floor.jpg";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
export default function Ground() {

    // Load the texture for the ground
    const groundTexture = useLoader(THREE.TextureLoader, floortexture);
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000, 8, 8]} /> {/* Reduced segments from default to 8x8 */}
            <meshStandardMaterial   map={groundTexture}
                        transparent={true}
                        alphaTest={0.5}
                        emissive="black"
                        emissiveIntensity={0.3} /> {/* Use a solid green color */}
        </mesh>
    );
}