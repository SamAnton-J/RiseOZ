require('dotenv').config();

const express = require('express')
const cors = require('cors');;
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./src/models/message');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// CORS configuration for both development and production
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.netlify.app", // Replace with your actual Netlify domain
    "https://your-frontend-domain.vercel.app"   // Replace with your actual Vercel domain
];

const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

require('./config/db');
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const path = require('path');
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Health check endpoint for deployment platforms
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// ROUTES
const freelancerRoutes = require('./src/routes/freelancerRoute')
const producerRoutes = require('./src/routes/producerRoute');
const authRoutes = require('./src/routes/authRoute');
const connectionRoutes = require('./src/routes/connectionRoute');
const channeliRoutes = require('./src/routes/channeliRoute')
const aiRoutes = require('./src/utils/aiRoutes');

app.use('', authRoutes);
app.use('', connectionRoutes);
app.use('', channeliRoutes);
app.use('', aiRoutes);
app.use('/freelancer', freelancerRoutes);
app.use('/producer', producerRoutes);
app.use('/chat', require('./src/routes/chatRoute'));

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('join', ({ senderId, senderRole }) => {
        const room = `${senderRole}-${senderId}`;
        socket.join(room);
        console.log(`User ${senderId} with senderRole ${senderRole} joined room ${room}`);
    });
    socket.on('sendMessage', async (messageData) => {
        const { senderId, senderRole, receiverId, receiverRole, content } = messageData;
        // Save the message to the database
        const message = new Message({
            sender: senderId,
            senderRole,
            receiver: receiverId,
            receiverRole,
            content,
            timestamp: new Date()
        });
        await message.save();
        // Emit the message to the receiver
        const room = `${receiverRole}-${receiverId}`;
        io.to(room).emit('receiveMessage', message);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});