import React, { useState } from "react";

export default function GameLoader({ onStartGame, loadingProgress, isLoading }) {
    const [weather, setWeather] = useState("sunny");
    const [pet, setPet] = useState("dog");

    const handleStart = () => {
        onStartGame({ weather, pet });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-900 to-black text-white">
            <div className="text-center space-y-8 p-8 bg-black/50 rounded-lg shadow-2xl">
                <h1 className="text-6xl font-bold mb-8">Relax Game</h1>
                
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="text-xl">Loading game assets...</div>
                        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <div className="text-sm text-gray-400">{Math.round(loadingProgress)}%</div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl">Choose Weather</h2>
                            <div className="flex justify-center space-x-4">
                                <button
                                    className={`px-4 py-2 rounded ${
                                        weather === "sunny"
                                            ? "bg-blue-500"
                                            : "bg-gray-700"
                                    }`}
                                    onClick={() => setWeather("sunny")}
                                >
                                    Sunny
                                </button>
                                <button
                                    className={`px-4 py-2 rounded ${
                                        weather === "rain"
                                            ? "bg-blue-500"
                                            : "bg-gray-700"
                                    }`}
                                    onClick={() => setWeather("rain")}
                                >
                                    Rainy
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl">Choose Pet</h2>
                            <div className="flex justify-center space-x-4">
                                <button
                                    className={`px-4 py-2 rounded ${
                                        pet === "dog"
                                            ? "bg-blue-500"
                                            : "bg-gray-700"
                                    }`}
                                    onClick={() => setPet("dog")}
                                >
                                    Dog
                                </button>
                                <button
                                    className={`px-4 py-2 rounded ${
                                        pet === "cat"
                                            ? "bg-blue-500"
                                            : "bg-gray-700"
                                    }`}
                                    onClick={() => setPet("cat")}
                                >
                                    Cat
                                </button>
                            </div>
                        </div>

                        <button
                            className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition-colors"
                            onClick={handleStart}
                        >
                            Start Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}