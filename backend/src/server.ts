import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import teamRoutes from './routes/team.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import progressRoutes from './routes/progress.routes';
import eventRoutes from './routes/event.routes';
import attendanceRoutes from './routes/attendance.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';
import reportRoutes from './routes/report.routes';

import { setupSocketHandlers } from './socket';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup file upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});
setupSocketHandlers(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Multer Storage for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

// Single & Multiple file upload endpoint
app.post('/api/upload', upload.array('files', 5), (req, res) => {
  try {
    const reqFiles = req.files as Express.Multer.File[];
    if (!reqFiles || reqFiles.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const fileDetails = reqFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size
    }));

    return res.json({ files: fileDetails });
  } catch (error) {
    return res.status(500).json({ error: 'File upload failed.' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Intern Management System Backend API is active.' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
