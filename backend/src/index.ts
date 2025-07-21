import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { text } = req.body;
    const message = await prisma.message.create({
      data: { text }
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 