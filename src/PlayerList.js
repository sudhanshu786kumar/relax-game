import React, { useState, useEffect } from 'react';
import { multiplayerManager } from './server/MultiplayerManager';

export default function PlayerList() {
    const [players, setPlayers] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const updatePlayers = () => {
            const allPlayers = multiplayerManager.getOtherPlayers();
            setPlayers(allPlayers);
        };

        const interval = setInterval(updatePlayers, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    padding: '10px',
                    background: '#4ECDC4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                Show Players
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '10px',
                borderRadius: '5px',
                color: 'white',
                zIndex: 1000,
                minWidth: '200px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Players Online</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '20px'
                    }}
                >
                    ×
                </button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {players.map((player) => (
                    <div
                        key={player.id}
                        style={{
                            padding: '5px',
                            margin: '5px 0',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Player {player.id.substring(0, 4)}...</span>
                            <span>{player.pet && player.pet !== "none" ? `Pet: ${player.pet}` : 'No Pet'}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>
                            Position: {Math.round(player.position.x)}, {Math.round(player.position.z)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 