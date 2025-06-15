
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

// Payment processing endpoints
app.post('/api/process-payment', checkDbConnection, async (req, res) => {
  try {
    const { amount, paymentMethod, orderId, userEmail } = req.body;
    
    // Simulate payment processing based on method type
    const paymentResult = {
      success: false,
      transactionId: null,
      error: null
    };
    
    switch (paymentMethod.type) {
      case 'grabpay':
        // Simulate GrabPay API integration
        paymentResult.success = Math.random() > 0.1; // 90% success rate
        paymentResult.transactionId = `grab_${Date.now()}`;
        break;
        
      case 'touchngo':
        // Simulate Touch 'n Go API integration
        paymentResult.success = Math.random() > 0.1; // 90% success rate
        paymentResult.transactionId = `tng_${Date.now()}`;
        break;
        
      case 'bank_transfer':
        // Simulate FPX bank transfer
        paymentResult.success = Math.random() > 0.05; // 95% success rate
        paymentResult.transactionId = `fpx_${Date.now()}`;
        break;
        
      default:
        paymentResult.error = 'Unsupported payment method';
    }
    
    // Store payment record
    if (paymentResult.success) {
      const paymentsCollection = db.collection('payments');
      await paymentsCollection.insertOne({
        transactionId: paymentResult.transactionId,
        amount,
        paymentMethod: paymentMethod.type,
        orderId,
        userEmail,
        status: 'completed',
        created_at: new Date().toISOString()
      });
    }
    
    res.json(paymentResult);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.get('/api/payment-history/:email', checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;
    
    const paymentsCollection = db.collection('payments');
    const payments = await paymentsCollection
      .find({ userEmail: email })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    
    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Order management endpoints
app.post('/api/create-order', checkDbConnection, async (req, res) => {
  try {
    const { userEmail, items, totalAmount, paymentMethod } = req.body;
    
    const ordersCollection = db.collection('orders');
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const order = {
      orderId,
      userEmail,
      items,
      totalAmount,
      paymentMethod,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = await ordersCollection.insertOne(order);
    res.json({ ...order, _id: result.insertedId });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/update-order-status', checkDbConnection, async (req, res) => {
  try {
    const { orderId, status, transactionId } = req.body;
    
    const ordersCollection = db.collection('orders');
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    await ordersCollection.updateOne(
      { orderId },
      { $set: updateData }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.get('/api/order-history/:email', checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;
    
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection
      .find({ userEmail: email })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoints
app.get('/api/admin/dashboard-stats', checkDbConnection, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');
    const profilesCollection = db.collection('profiles');

    // Get counts
    const totalUsers = await usersCollection.countDocuments();
    const totalOrders = await ordersCollection.countDocuments();
    
    // Get revenue from completed orders
    const completedOrders = await ordersCollection.find({ status: 'completed' }).toArray();
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await ordersCollection.countDocuments({
      created_at: { $gte: today.toISOString() }
    });

    // Get recent orders
    const recentOrders = await ordersCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    const stats = {
      totalUsers,
      totalOrders,
      totalSurveys: 0, // This would come from survey responses
      totalRevenue,
      todayOrders,
      activeUsers: totalUsers, // Simplified - could be based on recent activity
      recentOrders
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/users', checkDbConnection, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const profilesCollection = db.collection('profiles');
    const ordersCollection = db.collection('orders');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    
    // Enhance users with profile data and stats
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      const profile = await profilesCollection.findOne({ email: user.email });
      const userOrders = await ordersCollection.find({ userEmail: user.email }).toArray();
      
      const stats = {
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        pointsEarned: 0, // This would come from points system
        lastActive: user.created_at // Simplified
      };

      return {
        ...user,
        profile,
        stats,
        status: 'active' // Default status - you might want to add this field to your user schema
      };
    }));

    res.json(enhancedUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/users/:userId/:action', checkDbConnection, async (req, res) => {
  try {
    const { userId, action } = req.params;
    const usersCollection = db.collection('users');

    if (action === 'suspend' || action === 'activate') {
      const status = action === 'suspend' ? 'suspended' : 'active';
      await usersCollection.updateOne(
        { _id: new db.collection('users').s.pkFactory(userId) },
        { $set: { status, updated_at: new Date().toISOString() } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Admin user action error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/orders', checkDbConnection, async (req, res) => {
  try {
    const ordersCollection = db.collection('orders');
    const orders = await ordersCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    res.json(orders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/orders/:orderId/status', checkDbConnection, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const ordersCollection = db.collection('orders');
    await ordersCollection.updateOne(
      { orderId },
      { $set: { status, updated_at: new Date().toISOString() } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
