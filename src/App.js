import GameLoader from "./GameLoader";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky, Stars } from "@react-three/drei"; // Import Stars component
import Ground from "./Ground";
import Player from "./Player";
import React, { useRef, useEffect, useState } from "react";
import Tree from "./Tree";
import Animal from "./Animal";
import Pet from "./Pet";
import RainEffect from "./RainEffect";
import CloudEffect from "./CloudEffect";
import song from "../public/sounds/rain.mp3"; // Import the sound file

export default function App() {
    const playerRef = useRef();
    const rainAudioRef = useRef(null);
    const [movement, setMovement] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    const [gameStarted, setGameStarted] = useState(false);
    const [gameOptions, setGameOptions] = useState({ weather: "sunny", pet: "dog" });

    const [trees, setTrees] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [groundTiles, setGroundTiles] = useState([]);

    const visibilityRange = 500; // Define the range of visibility around the player

    const handleStartGame = (options) => {
        setGameOptions(options);
        setGameStarted(true);
    };
    useEffect(() => {
        if (rainAudioRef.current) {
            if (gameOptions.weather === "rain") {
                rainAudioRef.current.play();
            } else {
                rainAudioRef.current.pause();
                rainAudioRef.current.currentTime = 0; // Reset the audio
            }
        }
    }, [gameOptions.weather]);

    // Handle keyboard input for WASD movement
    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "w":
                case "ArrowUp":
                    setMovement((m) => ({ ...m, forward: true }));
                    break;
                case "s":
                case "ArrowDown":
                    setMovement((m) => ({ ...m, backward: true }));
                    break;
                case "a":
                case "ArrowLeft":
                    setMovement((m) => ({ ...m, left: true }));
                    break;
                case "d":
                case "ArrowRight":
                    setMovement((m) => ({ ...m, right: true }));
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.key) {
                case "w":
                case "ArrowUp":
                    setMovement((m) => ({ ...m, forward: false }));
                    break;
                case "s":
                case "ArrowDown":
                    setMovement((m) => ({ ...m, backward: false }));
                    break;
                case "a":
                case "ArrowLeft":
                    setMovement((m) => ({ ...m, left: false }));
                    break;
                case "d":
                case "ArrowRight":
                    setMovement((m) => ({ ...m, right: false }));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // Generate random positions within a range
    const generatePositions = (count, range, playerPosition) =>
        Array.from({ length: count }, () => [
            playerPosition.x + (Math.random() - 0.5) * range, // Random x position near the player
            0, // Ground level
            playerPosition.z + (Math.random() - 0.5) * range, // Random z position near the player
        ]);

    // Generate initial ground tiles, trees, and animals
    useEffect(() => {
        const initialPlayerPosition = { x: 0, z: 0 };

        // Generate ground tiles
        const generateGroundTiles = () => {
            const tiles = [];
            for (let x = -2; x <= 2; x++) {
                for (let z = -2; z <= 2; z++) {
                    tiles.push([x * 100, 0, z * 100]); // Each tile is 100x100
                }
            }
            return tiles;
        };

        setGroundTiles(generateGroundTiles());
        setTrees(generatePositions(50, visibilityRange, initialPlayerPosition));
        setAnimals(generatePositions(20, visibilityRange, initialPlayerPosition));
    }, []);

    // Add and remove objects based on player's visibility
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                const playerPosition = {
                    x: playerRef.current.position.x,
                    z: playerRef.current.position.z,
                };

                // Add new trees and animals within visibility range
                setTrees((prevTrees) => [
                    ...prevTrees.filter(
                        ([x, , z]) =>
                            Math.abs(x - playerPosition.x) <= visibilityRange &&
                            Math.abs(z - playerPosition.z) <= visibilityRange
                    ),
                    ...generatePositions(5, visibilityRange, playerPosition),
                ]);

                setAnimals((prevAnimals) => [
                    ...prevAnimals.filter(
                        ([x, , z]) =>
                            Math.abs(x - playerPosition.x) <= visibilityRange &&
                            Math.abs(z - playerPosition.z) <= visibilityRange
                    ),
                    ...generatePositions(3, visibilityRange, playerPosition),
                ]);

                // Update ground tiles based on visibility
                const generateGroundTiles = () => {
                    const tiles = [];
                    for (let x = -2; x <= 2; x++) {
                        for (let z = -2; z <= 2; z++) {
                            tiles.push([
                                Math.floor(playerPosition.x / 100) * 100 + x * 100,
                                0,
                                Math.floor(playerPosition.z / 100) * 100 + z * 100,
                            ]);
                        }
                    }
                    return tiles;
                };

                setGroundTiles(generateGroundTiles());
            }
        }, 9000); // Update every second

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Camera follow logic
    const CameraFollow = () => {
        const { camera } = useThree();

        useFrame(() => {
            if (playerRef.current) {
                const player = playerRef.current;

                // Smoothly interpolate the camera position
                camera.position.x += (player.position.x - camera.position.x) * 0.05;
                camera.position.z += (player.position.z + 30 - camera.position.z) * 0.05;
                // Keep the camera at a fixed height
               

                // Update player position based on movement
                const speed = 1; // Adjust speed for smoother movement
                if (movement.forward) {
                    player.position.z -= speed; // Move forward
                }
                if (movement.backward) {
                    player.position.z += speed; // Move backward
                }
                if (movement.left) {
                    player.position.x -= speed; // Move left
                }
                if (movement.right) {
                    player.position.x += speed; // Move right
                }
            }
        });

        return null;
    };

    return (
        <>
            {!gameStarted ? (
                <GameLoader onStartGame={handleStartGame} />
            ) : (
                <>
                    <audio ref={rainAudioRef} src={song} type="audio/mpeg" loop /> {/* Rain sound */}
                    <Canvas shadows camera={{ position: [0, 10, 20], fov: 50 }}>
                        {/* Sky Component */}
                        {gameOptions.weather === "night" ? (
                            <Stars radius={300} depth={60} count={5000} factor={7} fade />
                        ) : (
                            <Sky
                                sunPosition={[100, 1000, 100]} // Sky for other weather options
                                distance={450000}
                            />
                        )}

                        <CameraFollow />
                        <PointerLockControls />

                        {/* Add weather effects based on gameOptions.weather */}
                        {gameOptions.weather === "rain" && <RainEffect />}
                        {gameOptions.weather === "cloudy" && <CloudEffect />}

                        <ambientLight intensity={gameOptions.weather === "night" ? 0.2 : 0.5} />
                        <directionalLight
                            position={[10, 10, 10]}
                            castShadow
                            intensity={gameOptions.weather === "night" ? 0.5 : 1}
                        />

                        {groundTiles.map((pos, index) => (
                            <Ground key={index} position={pos} />
                        ))}
                        <Player ref={playerRef} />
                        {trees.map((pos, index) => (
                            <Tree key={index} position={pos} />
                        ))}
                        {animals.map((pos, index) => (
                            <Animal key={index} position={pos} />
                        ))}
                        {gameOptions.pet !== "none" && <Pet type={gameOptions.pet} playerRef={playerRef} />}
                    </Canvas>
                </>
            )}
        </>
    );
}