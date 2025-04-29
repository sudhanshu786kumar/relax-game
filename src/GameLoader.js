import React, { useState } from "react";
import { motion } from "framer-motion";

export default function GameLoader({ onStartGame }) {
    const [weather, setWeather] = useState("sunny");
    const [pet, setPet] = useState("dog");
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setIsLoading(true);
        setTimeout(() => {
            onStartGame({ weather, pet });
        }, 3000); // Simulate a 3-second loading time
    };

    return (
        <div className="game-loader">
            {!isLoading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="options-screen"
                >
                    <h1>Select Your Preferences</h1>
                    <div className="options">
                        <div>
                            <h3>Weather</h3>
                            <select value={weather} onChange={(e) => setWeather(e.target.value)}>
                                <option value="sunny">Sunny</option>
                                <option value="rain">Rain</option>
                                <option value="cloudy">Cloudy</option>
                                <option value="night">Night</option> {/* New Night Option */}
                            </select>
                        </div>
                        <div>
                            <h3>Pet</h3>
                            <select value={pet} onChange={(e) => setPet(e.target.value)}>
                                <option value="none">None</option>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleStart}>Start Game</button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="loading-screen"
                >
                    <h1>Loading...</h1>
                    <motion.div
                        className="loading-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                </motion.div>
            )}
        </div>
    );
}