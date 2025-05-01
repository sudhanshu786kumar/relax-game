import React, { useEffect, useState } from 'react';
import { multiplayerManager } from './server/MultiplayerManager';

export default function PlayerNotifications() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const handlePlayerJoined = (playerData) => {
            setMessages(prev => [...prev, {
                id: playerData.id,
                message: `Player ${playerData.id.slice(0, 4)} joined the game!`,
                timestamp: Date.now()
            }]);
            // Remove message after 3 seconds
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => msg.id !== playerData.id));
            }, 3000);
        };

        const handlePlayerLeft = (playerId) => {
            setMessages(prev => [...prev, {
                id: playerId,
                message: `Player ${playerId.slice(0, 4)} left the game.`,
                timestamp: Date.now()
            }]);
            // Remove message after 3 seconds
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => msg.id !== playerId));
            }, 3000);
        };

        multiplayerManager.socket?.on('playerJoined', handlePlayerJoined);
        multiplayerManager.socket?.on('playerLeft', handlePlayerLeft);

        return () => {
            multiplayerManager.socket?.off('playerJoined', handlePlayerJoined);
            multiplayerManager.socket?.off('playerLeft', handlePlayerLeft);
        };
    }, []);

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            {messages.map(msg => (
                <div 
                    key={`${msg.id}-${msg.timestamp}`}
                    className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg mb-2 text-center"
                >
                    {msg.message}
                </div>
            ))}
        </div>
    );
} 