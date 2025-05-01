import GameLoader from "./GameLoader";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky, Stars, KeyboardControls } from "@react-three/drei"; // Import Stars component
import Ground from "./Ground";
import Player from "./Player";
import React, { useRef, useEffect, useState } from "react";
import Tree from "./Tree";
import Animal from "./Animal";
import Pet from "./Pet";
import RainEffect from "./RainEffect";
import CloudEffect from "./CloudEffect";
import song from "../public/sounds/rain.mp3"; // Import the sound file
import Tent from "./Tent";
import * as THREE from "three";
import LeaveTexture from "../public/textures/leaves.jpg";
import BarkTexture from "../public/textures/bark.jpg";
import MusicPlayer from './MusicPlayer';
import OtherPlayers from './OtherPlayers';
import PlayerNotifications from './PlayerNotifications';
import { multiplayerManager } from './server/MultiplayerManager';
import PlayerList from './PlayerList';

// Define keyboard controls
const keyboardControls = [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] }
];

export default function App() {
    const playerRef = useRef(null);
    const rainAudioRef = useRef(null);
    const [movement, setMovement] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });
    const [tentPositions] = useState([
        [50, 0, 50], // Tent 1 position
        [-50, 0, -50], // Tent 2 position
        [100, 0, -100], // Tent 3 position
    ]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOptions, setGameOptions] = useState({ weather: "sunny", pet: "dog" });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const [trees, setTrees] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [groundTiles, setGroundTiles] = useState([]);

    const visibilityRange = 300;
    const maxTrees = 100;
    const maxAnimals = 20;

    // Initialize game state
    useEffect(() => {
        // Set initial game state
        setGameStarted(false);
        setGameOptions({ weather: "sunny", pet: "dog" });
        setIsLoading(false);
        setLoadingProgress(0);
    }, []);

    // Generate ground tiles
    const generateGroundTiles = () => {
        const tiles = [];
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                tiles.push([x * 100, 0, z * 100]);
            }
        }
        return tiles;
    };

    // Load game assets
    const loadAssets = async () => {
        try {
            setIsLoading(true);
            setLoadingProgress(0);

            // Load textures
            const textureLoader = new THREE.TextureLoader();
            const textures = [
                LeaveTexture,
                BarkTexture,
            ];

            let loadedTextures = 0;
            const totalAssets = textures.length + 1; // +1 for audio
            
            for (const texturePath of textures) {
                await new Promise((resolve) => {
                    textureLoader.load(texturePath, () => {
                        loadedTextures++;
                        const progress = (loadedTextures / totalAssets) * 100;
                        setLoadingProgress(progress);
                        resolve();
                    }, undefined, (error) => {
                        console.error("Error loading texture:", error);
                        resolve();
                    });
                });
            }

            // Load audio
            await new Promise((resolve) => {
                const audio = new Audio(song);
                audio.addEventListener('canplaythrough', () => {
                    setLoadingProgress(100);
                    rainAudioRef.current = audio;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    console.error("Error loading audio");
                    setLoadingProgress(100);
                    resolve();
                });
            });

            // Generate initial game objects
            const initialPlayerPosition = { x: 0, z: 0 };
            setGroundTiles(generateGroundTiles());
            setTrees(generatePositions(50, visibilityRange, initialPlayerPosition));
            setAnimals(generatePositions(10, visibilityRange, initialPlayerPosition));

            setIsLoading(false);
        } catch (error) {
            console.error("Error loading assets:", error);
            setLoadingProgress(100);
            setIsLoading(false);
        }
    };

    const handleStartGame = async (options) => {
        setGameOptions(options);
        await loadAssets();
        setGameStarted(true);
        multiplayerManager.setPetType(options.pet);
    };

    useEffect(() => {
        if (rainAudioRef.current && gameStarted) {
            if (gameOptions.weather === "rain") {
                rainAudioRef.current.play().catch(error => {
                    console.error("Error playing audio:", error);
                });
            } else {
                rainAudioRef.current.pause();
                rainAudioRef.current.currentTime = 0;
            }
        }
    }, [gameOptions.weather, gameStarted]);

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
        Array.from({ length: count }, () => {
            const x = playerPosition.x + (Math.random() - 0.5) * range;
            const z = playerPosition.z + (Math.random() - 0.5) * range;
            const maxDistance = 300; // Reduced from 500 to 300
            const distance = Math.sqrt(x * x + z * z);
            if (distance > maxDistance) {
                const angle = Math.atan2(z, x);
                return [Math.cos(angle) * maxDistance, 0, Math.sin(angle) * maxDistance];
            }
            return [x, 0, z];
        });

    // Add and remove objects based on player's visibility
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                const playerPosition = {
                    x: playerRef.current.position.x,
                    z: playerRef.current.position.z,
                };

                // Add new trees within visibility range
                setTrees((prevTrees) => {
                    const visibleTrees = prevTrees.filter(
                        ([x, , z]) =>
                            Math.abs(x - playerPosition.x) <= visibilityRange &&
                            Math.abs(z - playerPosition.z) <= visibilityRange
                    );
                    const newTrees = generatePositions(5, visibilityRange, playerPosition);
                    const combinedTrees = [...visibleTrees, ...newTrees];
                    return combinedTrees.slice(0, maxTrees); // Limit total trees
                });

                // Add new animals within visibility range
                setAnimals((prevAnimals) => {
                    const visibleAnimals = prevAnimals.filter(
                        ([x, , z]) =>
                            Math.abs(x - playerPosition.x) <= visibilityRange &&
                            Math.abs(z - playerPosition.z) <= visibilityRange
                    );
                    const newAnimals = generatePositions(2, visibilityRange, playerPosition);
                    const combinedAnimals = [...visibleAnimals, ...newAnimals];
                    return combinedAnimals.slice(0, maxAnimals); // Limit total animals
                });

                // Update ground tiles based on visibility
                const generateGroundTiles = () => {
                    const tiles = [];
                    for (let x = -1; x <= 1; x++) {
                        for (let z = -1; z <= 1; z++) {
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
        }, 5000); // Increased interval from 9000 to 5000

        return () => clearInterval(interval);
    }, []);

    // Update player position based on movement with collision detection
    const updatePlayerPosition = (player, movement) => {
        const speed = 1;
        const maxDistance = 300;
        const playerRadius = 2;

        // Helper function to check collision with objects
        const checkCollision = (newX, newZ) => {
            // Check collision with trees
            for (const [treeX, , treeZ] of trees) {
                const treeRadius = 5;
                const distance = Math.sqrt(
                    Math.pow(newX - treeX, 2) + Math.pow(newZ - treeZ, 2)
                );
                if (distance < playerRadius + treeRadius) {
                    return true;
                }
            }

            // Check collision with animals
            for (const [animalX, , animalZ] of animals) {
                const animalRadius = 3;
                const distance = Math.sqrt(
                    Math.pow(newX - animalX, 2) + Math.pow(newZ - animalZ, 2)
                );
                if (distance < playerRadius + animalRadius) {
                    return true;
                }
            }

            // Check collision with tents
            for (const [tentX, , tentZ] of tentPositions) {
                const tentRadius = 10;
                const distance = Math.sqrt(
                    Math.pow(newX - tentX, 2) + Math.pow(newZ - tentZ, 2)
                );
                if (distance < playerRadius + tentRadius) {
                    return true;
                }
            }

            return false;
        };

        // Calculate new position
        let newX = player.position.x;
        let newZ = player.position.z;

        if (movement.forward) {
            newZ = player.position.z - speed;
        }
        if (movement.backward) {
            newZ = player.position.z + speed;
        }
        if (movement.left) {
            newX = player.position.x - speed;
        }
        if (movement.right) {
            newX = player.position.x + speed;
        }

        // Check if new position is within game bounds and no collision
        const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ);
        if (distanceFromCenter <= maxDistance && !checkCollision(newX, newZ)) {
            player.position.x = newX;
            player.position.z = newZ;
        }
    };

    // Camera follow logic
    const CameraFollow = () => {
        const { camera } = useThree();

        useFrame(() => {
            if (playerRef.current) {
                const player = playerRef.current;

                // Smoothly interpolate the camera position
                camera.position.x += (player.position.x - camera.position.x) * 0.05;
                camera.position.z += (player.position.z + 30 - camera.position.z) * 0.05;
                camera.position.y = 10;

                // Update player position based on movement with collision detection
                updatePlayerPosition(player, movement);
            }
        });

        return null;
    };

    // Initialize multiplayer connection
    useEffect(() => {
        if (gameStarted) {
            multiplayerManager.connect();
        }
        return () => {
            multiplayerManager.disconnect();
        };
    }, [gameStarted]);

    // Update player position in multiplayer
    useEffect(() => {
        console.log(playerRef.current)
        if (gameStarted && playerRef.current) {
            const interval = setInterval(() => {
                const position = playerRef.current.position;
                const rotation = playerRef.current.rotation;
                console.log(position,rotation)
                multiplayerManager.updatePlayerState(
                    {
                        x: position.x,
                        y: position.y,
                        z: position.z
                    },
                    {
                        y: rotation.y
                    }
                );
            }, 50);
            return () => clearInterval(interval);
        }
    }, [gameStarted]);

    return (
        <div className="h-screen w-screen bg-black">
            {!gameStarted ? (
                <GameLoader 
                    onStartGame={handleStartGame}
                    loadingProgress={loadingProgress}
                    isLoading={isLoading}
                />
            ) : (
                <>
                    <PlayerNotifications />
                    <PlayerList />
                    <KeyboardControls map={keyboardControls}>
                        <Canvas
                            shadows
                            camera={{
                                position: [0, 5, 10],
                                fov: 50,
                                near: 0.1,
                                far: 1000
                            }}
                        >
                            {/* Sky Component */}
                            {gameOptions.weather === "night" ? (
                                <Stars radius={300} depth={60} count={5000} factor={7} fade />
                            ) : (
                                <Sky
                                    sunPosition={[100, 1000, 100]}
                                    distance={450000}
                                />
                            )}

                            <CameraFollow />
                            <PointerLockControls />

                            {/* Add weather effects based on gameOptions.weather */}
                            {gameOptions.weather === "rain" && <RainEffect key="rain" />}
                            {gameOptions.weather === "cloudy" && <CloudEffect key="cloud" />}

                            <ambientLight intensity={gameOptions.weather === "night" ? 0.2 : 0.5} />
                            <directionalLight
                                position={[10, 10, 10]}
                                castShadow
                                intensity={gameOptions.weather === "night" ? 0.5 : 1}
                            />

                            {groundTiles.map((pos, index) => (
                                <Ground key={`ground-${index}`} position={pos} />
                            ))}
                            <Player ref={playerRef}  />
                            {tentPositions.map((pos, index) => (
                                <Tent key={`tent-${index}`} position={pos} />
                            ))}
                            {trees.map((pos, index) => (
                                <Tree key={`tree-${index}`} position={pos} />
                            ))}
                            {animals.map((pos, index) => (
                                <Animal key={`animal-${index}`} position={pos} />
                            ))}
                            {gameOptions.pet !== "none" && <Pet key="pet" type={gameOptions.pet} playerRef={playerRef} />}
                            <OtherPlayers  />
                        </Canvas>
                    </KeyboardControls>
                    <MusicPlayer />
                </>
            )}
        </div>
    );
}