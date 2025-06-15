import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://kosemani:omowunmi888@cluster0.4i82g.mongodb.net/learn?retryWrites=true';
let db;

// Connect to MongoDB with both native client and Mongoose
let isConnected = false;

// Mongoose connection
mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log("Mongoose connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Mongoose connection error:", error);
  });

// Native MongoDB client for legacy endpoints
MongoClient.connect(DATABASE_URL)
  .then((client) => {
    console.log("Native MongoDB client connected");
    db = client.db("learn");
    isConnected = true;
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    isConnected = false;
  });

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isConnected || !db) {
    return res.status(503).json({ error: "Database connection not available" });
  }
  next();
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Server is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

const profileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: String },
  gender: { type: String },
  nationality: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  items: [{ 
    id: String,
    name: String,
    price: Number,
    quantity: Number 
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'pending' },
  transactionId: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop' },
  category: { type: String, required: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  orderId: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const surveyResponseSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  surveyId: { type: String, required: true },
  responses: { type: Object, required: true },
  pointsEarned: { type: Number, default: 0 },
  completed_at: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Order = mongoose.model('Order', orderSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// Menu Items API Routes
app.get('/api/menu-items', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({ id: req.params.id });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.post("/api/signin", checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple authentication (in production, use proper password hashing)
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ email: user.email, id: user._id });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/signup", checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = {
      email,
      password, // In production, hash this
      created_at: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    res.json({ email: newUser.email, id: result.insertedId });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profile/:email", checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;

    const profilesCollection = db.collection("profiles");
    const profile = await profilesCollection.findOne({ email });

    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profile", checkDbConnection, async (req, res) => {
  try {
    const profileData = req.body;

    const profilesCollection = db.collection("profiles");
    const usersCollection = db.collection("users");

    // Check if profile already exists
    const existingProfile = await profilesCollection.findOne({
      email: profileData.email,
    });
    if (existingProfile) {
      return res.status(409).json({ error: "Profile already exists" });
    }

    // If password is provided, ensure user exists in users collection
    if (profileData.password) {
      const existingUser = await usersCollection.findOne({
        email: profileData.email,
      });
      if (!existingUser) {
        // Create user if it doesn't exist
        await usersCollection.insertOne({
          email: profileData.email,
          password: profileData.password,
          created_at: new Date().toISOString(),
        });
      } else {
        // Update password if user exists but password is different
        await usersCollection.updateOne(
          { email: profileData.email },
          { $set: { password: profileData.password } },
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
    console.error("Create profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profile/:email", checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;
    const profileData = req.body;

    const profilesCollection = db.collection("profiles");

    // Check if profile exists
    const existingProfile = await profilesCollection.findOne({ email });
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Update profile data (exclude email from updates)
    const { email: _, password, ...updateData } = profileData;
    const updatedProfile = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    await profilesCollection.updateOne(
      { email },
      { $set: updatedProfile }
    );

    // Fetch and return updated profile
    const profile = await profilesCollection.findOne({ email });
    res.json(profile);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/reset-password", checkDbConnection, async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email and new password are required" });
    }

    const usersCollection = db.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update password (in production, hash this)
    await usersCollection.updateOne(
      { email },
      { $set: { password: newPassword, updated_at: new Date().toISOString() } },
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Payment processing endpoints
app.post("/api/process-payment", checkDbConnection, async (req, res) => {
  try {
    const { amount, paymentMethod, orderId, userEmail } = req.body;

    // Simulate payment processing based on method type
    const paymentResult = {
      success: false,
      transactionId: null,
      error: null,
    };

    switch (paymentMethod.type) {
      case "grabpay":
        // Simulate GrabPay API integration
        paymentResult.success = Math.random() > 0.1; // 90% success rate
        paymentResult.transactionId = `grab_${Date.now()}`;
        break;

      case "touchngo":
        // Simulate Touch 'n Go API integration
        paymentResult.success = Math.random() > 0.1; // 90% success rate
        paymentResult.transactionId = `tng_${Date.now()}`;
        break;

      case "bank_transfer":
        // Simulate FPX bank transfer
        paymentResult.success = Math.random() > 0.05; // 95% success rate
        paymentResult.transactionId = `fpx_${Date.now()}`;
        break;

      default:
        paymentResult.error = "Unsupported payment method";
    }

    // Store payment record
    if (paymentResult.success) {
      const paymentsCollection = db.collection("payments");
      await paymentsCollection.insertOne({
        transactionId: paymentResult.transactionId,
        amount,
        paymentMethod: paymentMethod.type,
        orderId,
        userEmail,
        status: "completed",
        created_at: new Date().toISOString(),
      });
    }

    res.json(paymentResult);
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.get("/api/payment-history/:email", checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;

    const paymentsCollection = db.collection("payments");
    const payments = await paymentsCollection
      .find({ userEmail: email })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    res.json(payments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Order management endpoints
app.post("/api/create-order", checkDbConnection, async (req, res) => {
  try {
    const { userEmail, items, totalAmount, paymentMethod } = req.body;

    const ordersCollection = db.collection("orders");
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = {
      orderId,
      userEmail,
      items,
      totalAmount,
      paymentMethod,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await ordersCollection.insertOne(order);
    res.json({ ...order, _id: result.insertedId });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.put("/api/update-order-status", checkDbConnection, async (req, res) => {
  try {
    const { orderId, status, transactionId } = req.body;

    const ordersCollection = db.collection("orders");
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await ordersCollection.updateOne({ orderId }, { $set: updateData });

    res.json({ success: true });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

app.get("/api/order-history/:email", checkDbConnection, async (req, res) => {
  try {
    const { email } = req.params;

    const ordersCollection = db.collection("orders");
    const orders = await ordersCollection
      .find({ userEmail: email })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    res.json(orders);
  } catch (error) {
    console.error("Get order history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin endpoints
app.get("/api/admin/dashboard-stats", checkDbConnection, async (req, res) => {
  try {
    const usersCollection = db.collection("users");
    const ordersCollection = db.collection("orders");
    const profilesCollection = db.collection("profiles");

    // Get counts
    const totalUsers = await usersCollection.countDocuments();
    const totalOrders = await ordersCollection.countDocuments();

    // Get revenue from completed orders
    const completedOrders = await ordersCollection
      .find({ status: "completed" })
      .toArray();
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await ordersCollection.countDocuments({
      created_at: { $gte: today.toISOString() },
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
      recentOrders,
    };

    res.json(stats);
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/users", checkDbConnection, async (req, res) => {
  try {
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("profiles");
    const ordersCollection = db.collection("orders");

    // Get all users
    const users = await usersCollection.find({}).toArray();

    // Enhance users with profile data and stats
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const profile = await profilesCollection.findOne({ email: user.email });
        const userOrders = await ordersCollection
          .find({ userEmail: user.email })
          .toArray();

        const stats = {
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce(
            (sum, order) => sum + order.totalAmount,
            0,
          ),
          pointsEarned: 0, // This would come from points system
          lastActive: user.created_at, // Simplified
        };

        return {
          ...user,
          profile,
          stats,
          status: "active", // Default status - you might want to add this field to your user schema
        };
      }),
    );

    res.json(enhancedUsers);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/api/admin/users/:userId/:action",
  checkDbConnection,
  async (req, res) => {
    try {
      const { userId, action } = req.params;
      const usersCollection = db.collection("users");

      if (action === "suspend" || action === "activate") {
        const status = action === "suspend" ? "suspended" : "active";
        await usersCollection.updateOne(
          { _id: new db.collection("users").s.pkFactory(userId) },
          { $set: { status, updated_at: new Date().toISOString() } },
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Admin user action error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.get("/api/admin/orders", checkDbConnection, async (req, res) => {
  try {
    const ordersCollection = db.collection("orders");
    const orders = await ordersCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    res.json(orders);
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put(
  "/api/admin/orders/:orderId/status",
  checkDbConnection,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const ordersCollection = db.collection("orders");
      await ordersCollection.updateOne(
        { orderId },
        { $set: { status, updated_at: new Date().toISOString() } },
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.put(
  "/api/admin/orders/:orderId/verify-payment",
  checkDbConnection,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { transactionId } = req.body;

      const ordersCollection = db.collection("orders");
      await ordersCollection.updateOne(
        { orderId },
        {
          $set: {
            transactionId,
            status: "completed",
            updated_at: new Date().toISOString(),
          },
        },
      );

      // Log payment verification
      const paymentsCollection = db.collection("payments");
      await paymentsCollection.insertOne({
        orderId,
        transactionId,
        action: "payment_verified",
        verifiedBy: "admin",
        verified_at: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.post(
  "/api/admin/orders/:orderId/refund",
  checkDbConnection,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { amount, type } = req.body;

      const ordersCollection = db.collection("orders");
      const order = await ordersCollection.findOne({ orderId });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Create refund record
      const refundsCollection = db.collection("refunds");
      const refundId = `REF_${Date.now()}`;

      await refundsCollection.insertOne({
        refundId,
        orderId,
        originalAmount: order.totalAmount,
        refundAmount: amount,
        refundType: type,
        status: "processed",
        processedBy: "admin",
        processed_at: new Date().toISOString(),
      });

      // Update order status
      const newStatus = type === "full" ? "refunded" : order.status;
      await ordersCollection.updateOne(
        { orderId },
        {
          $set: {
            status: newStatus,
            refund_status: type === "full" ? "full_refund" : "partial_refund",
            refund_amount: amount,
            updated_at: new Date().toISOString(),
          },
        },
      );

      res.json({ success: true, refundId });
    } catch (error) {
      console.error("Process refund error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Survey management endpoints
app.get("/api/admin/surveys", checkDbConnection, async (req, res) => {
  try {
    const surveysCollection = db.collection("surveys");
    const surveys = await surveysCollection.find({}).toArray();

    // Add completion stats for each survey
    const surveysWithStats = await Promise.all(
      surveys.map(async (survey) => {
        const responsesCollection = db.collection("survey_responses");
        const totalResponses = await responsesCollection.countDocuments({
          surveyId: survey.id,
        });
        const usersCollection = db.collection("users");
        const totalUsers = await usersCollection.countDocuments();

        return {
          ...survey,
          totalResponses,
          completionRate:
            totalUsers > 0
              ? Math.round((totalResponses / totalUsers) * 100)
              : 0,
        };
      }),
    );

    res.json(surveysWithStats);
  } catch (error) {
    console.error("Get surveys error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/surveys", checkDbConnection, async (req, res) => {
  try {
    const surveyData = req.body;
    const surveysCollection = db.collection("surveys");

    const survey = {
      ...surveyData,
      id: surveyData.id || `survey_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await surveysCollection.insertOne(survey);
    res.json(survey);
  } catch (error) {
    console.error("Create survey error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/admin/surveys/:surveyId", checkDbConnection, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const updateData = req.body;
    const surveysCollection = db.collection("surveys");

    await surveysCollection.updateOne(
      { id: surveyId },
      {
        $set: {
          ...updateData,
          updated_at: new Date().toISOString(),
        },
      },
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Update survey error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete(
  "/api/admin/surveys/:surveyId",
  checkDbConnection,
  async (req, res) => {
    try {
      const { surveyId } = req.params;
      const surveysCollection = db.collection("surveys");

      await surveysCollection.deleteOne({ id: surveyId });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete survey error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.get(
  "/api/admin/survey-responses/:surveyId",
  checkDbConnection,
  async (req, res) => {
    try {
      const { surveyId } = req.params;
      const responsesCollection = db.collection("survey_responses");

      const responses = await responsesCollection
        .find({ surveyId })
        .sort({ completed_at: -1 })
        .toArray();

      res.json(responses);
    } catch (error) {
      console.error("Get survey responses error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.post("/api/survey-response", checkDbConnection, async (req, res) => {
  try {
    const { userEmail, surveyId, responses, pointsEarned } = req.body;
    const responsesCollection = db.collection("survey_responses");

    const responseRecord = {
      userEmail,
      surveyId,
      responses,
      pointsEarned,
      completed_at: new Date().toISOString(),
    };

    await responsesCollection.insertOne(responseRecord);
    res.json({ success: true });
  } catch (error) {
    console.error("Save survey response error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Financial management endpoints
app.get("/api/admin/financial-stats", checkDbConnection, async (req, res) => {
  try {
    const ordersCollection = db.collection("orders");
    const usersCollection = db.collection("users");
    const paymentsCollection = db.collection("payments");
    const responsesCollection = db.collection("survey_responses");
    const conversionRatesCollection = db.collection("conversion_rates");

    // Calculate total revenue from completed orders
    const completedOrders = await ordersCollection
      .find({ status: "completed" })
      .toArray();
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Calculate points distribution from survey responses
    const surveyResponses = await responsesCollection.find({}).toArray();
    const totalPointsDistributed = surveyResponses.reduce(
      (sum, response) => sum + (response.pointsEarned || 0),
      0,
    );

    // Calculate points redeemed from orders paid with points
    const pointOrders = await ordersCollection
      .find({ paymentMethod: "points" })
      .toArray();
    const totalPointsRedeemed = pointOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Get active users count
    const activeUsers = await usersCollection.countDocuments();

    // Calculate monthly revenue for the last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date();
      startOfMonth.setMonth(startOfMonth.getMonth() - i, 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const monthOrders = await ordersCollection
        .find({
          status: "completed",
          created_at: {
            $gte: startOfMonth.toISOString(),
            $lt: endOfMonth.toISOString(),
          },
        })
        .toArray();

      const monthRevenue = monthOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );
      monthlyRevenue.push(monthRevenue);
    }

    // Payment method analytics
    const paymentMethods = {};
    completedOrders.forEach((order) => {
      const method = order.paymentMethod || "unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // Points distribution by category
    const pointsDistribution = {};
    surveyResponses.forEach((response) => {
      const category = response.surveyId || "unknown";
      pointsDistribution[category] =
        (pointsDistribution[category] || 0) + (response.pointsEarned || 0);
    });

    // Get current conversion rate
    let conversionRate = await conversionRatesCollection.findOne(
      {},
      { sort: { updated_at: -1 } },
    );
    if (!conversionRate) {
      conversionRate = {
        pointsToRM: 1,
        lastUpdated: new Date().toISOString(),
        updatedBy: "system",
      };
    }

    const stats = {
      totalRevenue,
      totalPointsDistributed,
      totalPointsRedeemed,
      activeUsers,
      monthlyRevenue,
      paymentMethods,
      pointsDistribution,
    };

    res.json({ stats, conversionRate });
  } catch (error) {
    console.error("Financial stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/api/admin/update-conversion-rate",
  checkDbConnection,
  async (req, res) => {
    try {
      const { pointsToRM, updatedBy } = req.body;
      const conversionRatesCollection = db.collection("conversion_rates");

      const newRate = {
        pointsToRM: parseFloat(pointsToRM),
        lastUpdated: new Date().toISOString(),
        updatedBy: updatedBy || "admin",
      };

      await conversionRatesCollection.insertOne(newRate);
      res.json({ success: true });
    } catch (error) {
      console.error("Update conversion rate error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

app.get(
  "/api/admin/export-financial-report",
  checkDbConnection,
  async (req, res) => {
    try {
      const ordersCollection = db.collection("orders");
      const paymentsCollection = db.collection("payments");

      const orders = await ordersCollection
        .find({})
        .sort({ created_at: -1 })
        .toArray();
      const payments = await paymentsCollection
        .find({})
        .sort({ created_at: -1 })
        .toArray();

      // Create CSV content
      let csvContent =
        "Type,Date,Amount,Payment Method,Status,Order ID,User Email\n";

      orders.forEach((order) => {
        csvContent += `Order,${order.created_at},${order.totalAmount},${order.paymentMethod || "N/A"},${order.status},${order.orderId},${order.userEmail}\n`;
      });

      payments.forEach((payment) => {
        csvContent += `Payment,${payment.created_at},${payment.amount},${payment.paymentMethod || "N/A"},${payment.status},${payment.orderId || "N/A"},${payment.userEmail}\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financial-report.csv",
      );
      res.send(csvContent);
    } catch (error) {
      console.error("Export financial report error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// System settings endpoints
app.get("/api/admin/system-settings", checkDbConnection, async (req, res) => {
  try {
    const settingsCollection = db.collection("system_settings");
    const settings = await settingsCollection.findOne(
      {},
      { sort: { updated_at: -1 } },
    );

    // Default settings if none exist
    const defaultSettings = {
      system: {
        appName: "EarnEats",
        appVersion: "1.0.0",
        maintenanceMode: false,
        allowRegistration: true,
        maxUsersPerOrder: 5,
        sessionTimeout: 30,
      },
      payment: {
        grabPayEnabled: true,
        touchNGoEnabled: true,
        bankTransferEnabled: true,
        pointsConversionRate: 1.0,
        minimumOrderAmount: 10.0,
        serviceFeePercentage: 2.5,
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushNotificationsEnabled: true,
        orderConfirmationTemplate: "Default order confirmation template",
        welcomeEmailTemplate: "Default welcome template",
        resetPasswordTemplate: "Default reset password template",
      },
    };

    res.json(settings || defaultSettings);
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/system-settings", checkDbConnection, async (req, res) => {
  try {
    const settingsData = req.body;
    const settingsCollection = db.collection("system_settings");

    const newSettings = {
      ...settingsData,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
    };

    await settingsCollection.insertOne(newSettings);
    res.json({ success: true });
  } catch (error) {
    console.error("Save system settings error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/backup-database", checkDbConnection, async (req, res) => {
  try {
    const collections = [
      "users",
      "profiles",
      "orders",
      "payments",
      "surveys",
      "survey_responses",
    ];
    const backup = {};

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      backup[collectionName] = await collection.find({}).toArray();
    }

    backup.metadata = {
      created_at: new Date().toISOString(),
      version: "1.0.0",
      total_collections: collections.length,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=earneats-backup-${new Date().toISOString().split("T")[0]}.json`,
    );
    res.json(backup);
  } catch (error) {
    console.error("Database backup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/test-email", checkDbConnection, async (req, res) => {
  try {
    const { template } = req.body;

    // Simulate sending email (in production, integrate with email service)
    console.log(`Sending test email with template: ${template}`);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});