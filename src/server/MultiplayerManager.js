import { io } from 'socket.io-client';
import { SERVER_CONFIG } from './config';

class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.players = new Map();
        this.playerId = null;
        this.isConnected = false;
        this.lastPosition = null;
        this.lastRotation = null;
        this.lastUpdateTime = 0;
        this.petType = "none";
        this.updateInterval = null;
        this.chatListeners = new Set();
    }

    connect() {
        this.socket = io(SERVER_CONFIG.SERVER_URL, {
            reconnectionAttempts: SERVER_CONFIG.RECONNECT_ATTEMPTS,
            reconnectionDelay: SERVER_CONFIG.RECONNECT_DELAY,
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.playerId = this.socket.id;
            console.log('Connected to server with ID:', this.playerId);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
        });

        this.socket.on('playerJoined', (playerData) => {
            console.log('Player joined:', playerData);
            this.players.set(playerData.id, {
                ...playerData,
                lastUpdate: Date.now()
            });
        });

        this.socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            this.players.delete(playerId);
        });

        this.socket.on('playerUpdate', (playerData) => {
            if (playerData.id !== this.playerId) {
                const currentPlayer = this.players.get(playerData.id);
                if (currentPlayer) {
                    // Only update if the new data is more recent
                    if (playerData.timestamp > currentPlayer.lastUpdate) {
                        this.players.set(playerData.id, {
                            ...playerData,
                            lastUpdate: playerData.timestamp
                        });
                    }
                } else {
                    this.players.set(playerData.id, {
                        ...playerData,
                        lastUpdate: playerData.timestamp
                    });
                }
            }
        });

        // Add chat message listener
        this.socket.on('chatMessage', (message) => {
            this.chatListeners.forEach(listener => listener(message));
        });
    }

    // Add chat message listener
    onChatMessage(callback) {
        this.chatListeners.add(callback);
        return () => this.chatListeners.delete(callback);
    }

    // Send chat message
    sendChatMessage(message) {
        if (this.socket && this.isConnected) {
            this.socket.emit('chatMessage', message);
        }
    }

    setPetType(petType) {
        this.petType = petType;
    }

    updatePlayerState(position, rotation) {
        if (!this.isConnected) return;

        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastUpdateTime;

        // Only send updates if position or rotation has changed significantly
        const positionChanged = !this.lastPosition || 
            Math.abs(position.x - this.lastPosition.x) > SERVER_CONFIG.POSITION_THRESHOLD ||
            Math.abs(position.y - this.lastPosition.y) > SERVER_CONFIG.POSITION_THRESHOLD ||
            Math.abs(position.z - this.lastPosition.z) > SERVER_CONFIG.POSITION_THRESHOLD;

        const rotationChanged = !this.lastRotation || 
            Math.abs(rotation.y - this.lastRotation.y) > SERVER_CONFIG.POSITION_THRESHOLD;

        if (positionChanged || rotationChanged || timeSinceLastUpdate >= SERVER_CONFIG.SYNC_INTERVAL) {
            const updateData = {
                position,
                rotation,
                pet: this.petType,
                timestamp: currentTime,
                velocity: this.calculateVelocity(position)
            };

            this.socket.emit('playerUpdate', updateData);
            
            this.lastPosition = { ...position };
            this.lastRotation = rotation ? { ...rotation } : null;
            this.lastUpdateTime = currentTime;
        }
    }

    calculateVelocity(position) {
        if (!this.lastPosition) return { x: 0, y: 0, z: 0 };
        
        const timeDiff = (Date.now() - this.lastUpdateTime) / 1000; // Convert to seconds
        if (timeDiff === 0) return { x: 0, y: 0, z: 0 };

        return {
            x: (position.x - this.lastPosition.x) / timeDiff,
            y: (position.y - this.lastPosition.y) / timeDiff,
            z: (position.z - this.lastPosition.z) / timeDiff
        };
    }

    getOtherPlayers() {
        return Array.from(this.players.values());
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.players.clear();
            this.chatListeners.clear();
        }
    }
}

export const multiplayerManager = new MultiplayerManager(); 