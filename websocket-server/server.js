require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});

// Store player states
const playerStates = new Map();

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Initialize player state
    playerStates.set(socket.id, {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        rotation: { y: 0 },
        timestamp: Date.now(),
        petType: 'none'
    });

    // Notify other players about new player
    socket.broadcast.emit('playerJoined', {
        id: socket.id,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        rotation: { y: 0 },
        petType: 'none'
    });

    // Handle player updates
    socket.on('playerUpdate', (data) => {
        // Update player state
        const currentState = playerStates.get(socket.id);
        if (currentState) {
            playerStates.set(socket.id, {
                ...currentState,
                position: data.position,
                velocity: data.velocity,
                rotation: data.rotation,
                petType: data.pet || 'none',
                timestamp: Date.now()
            });

            // Broadcast update to other players
            socket.broadcast.emit('playerUpdate', {
                id: socket.id,
                position: data.position,
                velocity: data.velocity,
                rotation: data.rotation,
                petType: data.pet || 'none',
                timestamp: Date.now()
            });
        }
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
        // Broadcast message to all players
        io.emit('chatMessage', {
            ...message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        playerStates.delete(socket.id);
        io.emit('playerLeft', socket.id);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        players: Array.from(playerStates.keys())
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
}); 