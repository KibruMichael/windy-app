const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

// Load environment variables
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware - CORS configured for production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
    });

    const { email, password, name } = schema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const { email, password } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// ============ COMMENTS ROUTES ============

// Get all comments
app.get('/api/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
app.post('/api/comments', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      commentText: z.string().min(1),
      mapLocation: z.string().optional(),
    });

    const { commentText, mapLocation } = schema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        commentText,
        mapLocation: mapLocation || 'General',
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ============ FAVORITES ROUTES ============

// Get user's favorites
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Create favorite
app.post('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      locationName: z.string().min(1),
      coordinates: z.string().min(1),
    });

    const { locationName, coordinates } = schema.parse(req.body);

    // Check for duplicate
    const existing = await prisma.favorite.findFirst({
      where: { userId: req.user.id, coordinates },
    });
    if (existing) {
      return res.status(400).json({ error: 'Location already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        locationName,
        coordinates,
        userId: req.user.id,
      },
    });

    res.json(favorite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create favorite error:', error);
    res.status(500).json({ error: 'Failed to create favorite' });
  }
});

// Delete favorite
app.delete('/api/favorites/:id', authMiddleware, async (req, res) => {
  try {
    const favorite = await prisma.favorite.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// ============ RATINGS ROUTES ============

// Get all ratings
app.get('/api/ratings', authMiddleware, async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany();
    res.json(ratings);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Create or update rating
app.post('/api/ratings', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      value: z.number().int().min(1).max(5),
    });

    const { value } = schema.parse(req.body);

    const existing = await prisma.rating.findUnique({
      where: { userId: req.user.id },
    });

    let rating;
    if (existing) {
      rating = await prisma.rating.update({
        where: { userId: req.user.id },
        data: { value },
      });
    } else {
      rating = await prisma.rating.create({
        data: { value, userId: req.user.id },
      });
    }

    res.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
