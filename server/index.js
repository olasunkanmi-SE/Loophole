
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const DATABASE_URL = 'mongodb+srv://kosemani:omowunmi888@cluster0.4i82g.mongodb.net/learn?retryWrites=true';
let db;

// Connect to MongoDB
let isConnected = false;

MongoClient.connect(DATABASE_URL)
  .then(client => {
    console.log('Connected to MongoDB Atlas');
    db = client.db('learn');
    isConnected = true;
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    isConnected = false;
  });

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isConnected || !db) {
    return res.status(503).json({ error: 'Database connection not available' });
  }
  next();
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/signin', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple authentication (in production, use proper password hashing)
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ email: user.email, id: user._id });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signup', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      email,
      password, // In production, hash this
      created_at: new Date().toISOString()
    };
    
    const result = await usersCollection.insertOne(newUser);
    res.json({ email: newUser.email, id: result.insertedId });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile/:email', checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;
    
    const profilesCollection = db.collection('profiles');
    const profile = await profilesCollection.findOne({ email });
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/profile', checkDbConnection, async (req, res) => {
  try {
    const profileData = req.body;
    
    const profilesCollection = db.collection('profiles');
    
    // Check if profile already exists
    const existingProfile = await profilesCollection.findOne({ email: profileData.email });
    if (existingProfile) {
      return res.status(409).json({ error: 'Profile already exists' });
    }
    
    const profile = {
      ...profileData,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    
    await profilesCollection.insertOne(profile);
    res.json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
