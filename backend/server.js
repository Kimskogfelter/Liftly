import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connect from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
// Ladda miljövariabler från .env
import 'dotenv/config';
// Funktion för att ansluta till MongoDB
import { connectToDB } from './config/db.js';
// Middleware för felhantering(error) och 404-rutter
import { errorHandler, notFoundEndpoint } from './middleware/errorMiddleware.js';
// Routes
import { userRouter } from './routes/userRoutes.js';
import { postRouter } from './routes/postRoutes.js';
import { searchRouter } from './routes/searchRoutes.js';
import { workoutRouter } from './routes/workoutRoutes.js';
import { foodLogRouter } from './routes/foodLogRoutes.js';
import { calendarRouter } from './routes/calendarRoutes.js';
import { contactRouter } from './routes/contactRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';

// skapa express server
const server = express();
server.set('trust proxy', 1);

// SOCKET IO LIVE SERVER 
// Skapa en HTTP-server av din Express-server för live uppdateringarna?!
const httpServer = http.createServer(server);

// Koppla på Socket.io med samma CORS-inställningar som du redan har
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://liftly-examen.vercel.app", "https://liftlyfit.com", "https://www.liftlyfit.com", "https://localhost", "capacitor://localhost"],
        credentials: true
    }
});

// Spara `io` så du når den i dina controllers om du vill skicka notiser i realtid
server.set('io', io);

io.on('connection', (socket) => {
    // Personligt rum för notiser
    socket.on('join', (userId) => {
        if (userId) socket.join(userId.toString());
    });

    // Rum per inlägg för likes och kommentarer i realtid
    socket.on('joinPost', (postId) => {
        if (postId) socket.join(`post:${postId}`);
    });

    socket.on('leavePost', (postId) => {
        if (postId) socket.leave(`post:${postId}`);
    });
});

// Läs från miljövariabler
const port = process.env.PORT || 5000;

// middleware funktioner
server.use(cookieParser());
server.use(express.urlencoded({extended: true}))
server.use(express.json({extended: true}))
server.use(cors({credentials: true, origin: ["http://localhost:5173", "https://liftly-examen.vercel.app", "https://liftlyfit.com",
  "https://www.liftlyfit.com", "https://localhost", "capacitor://localhost"]}))
// koppla ihop multer med cloudinary senare för storage av bilder/vidoes
// const uploadImage = multer({dest: 'uploads'})

// API routes
server.use('/api/users', userRouter);
server.use('/api/posts', postRouter);
server.use('/api/search', searchRouter);
server.use('/api/foodlogs', foodLogRouter);
server.use('/api/workouts', workoutRouter);
server.use('/api/calendar', calendarRouter);
server.use('/api/contact', contactRouter);
server.use('/api/notifications', notificationRouter)

// fallback middleware, for route not found and error handler
server.use(notFoundEndpoint);
server.use(errorHandler); 


// ----------------------
// STARTA SERVERN
// ----------------------

// funktion för att starta servern efter att DB är ansluten
const startServer = async () => {
  try {
    // Vänta på att MongoDB är ansluten via funktionen connectToDB()
    await connectToDB();
    // Starta servern på angiven port
    httpServer.listen(port, () => console.log(`Express server listening on port ${port}`));
  } catch (err) {
    // Logga fel om DB-anslutning misslyckas och stoppa servern
    console.error("Failed to connect to DB, server not started: ", err);
  }
};

// kör funktionen startServer()
startServer();
