
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const DATABASE_URL = '';
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
    const usersCollection = db.collection('users');
    
    // Check if profile already exists
    const existingProfile = await profilesCollection.findOne({ email: profileData.email });
    if (existingProfile) {
      return res.status(409).json({ error: 'Profile already exists' });
    }
    
    // If password is provided, ensure user exists in users collection
    if (profileData.password) {
      const existingUser = await usersCollection.findOne({ email: profileData.email });
      if (!existingUser) {
        // Create user if it doesn't exist
        await usersCollection.insertOne({
          email: profileData.email,
          password: profileData.password,
          created_at: new Date().toISOString()
        });
      } else {
        // Update password if user exists but password is different
        await usersCollection.updateOne(
          { email: profileData.email },
          { $set: { password: profileData.password } }
        );
      }
    }
    
    // Create profile (exclude password from profile data)
    const { password, ...profileDataWithoutPassword } = profileData;
    const profile = {
      ...profileDataWithoutPassword,
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

app.post('/api/reset-password', checkDbConnection, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    
    const usersCollection = db.collection('users');
    
    // Check if user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update password (in production, hash this)
    await usersCollection.updateOne(
      { email },
      { $set: { password: newPassword, updated_at: new Date().toISOString() } }
    );
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
