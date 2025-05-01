export const SERVER_CONFIG = {
    // Production server URL - will be replaced during build
    SERVER_URL: process.env.NODE_ENV === 'production' 
        ? 'https://relax-game.onrender.com' 
        : 'http://localhost:3001',
    
    // Game settings
    MAX_PLAYERS: 10,
    SYNC_INTERVAL: 50, // Reduced from 100ms to 50ms for smoother updates
    POSITION_THRESHOLD: 0.05, // Reduced threshold for more frequent updates
    
    // Reconnection settings
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000,
}; 