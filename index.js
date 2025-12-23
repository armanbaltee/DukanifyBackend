// index.js
// Main entry point for the Dukanify Backend Application

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config(); // Load environment variables from .env file
const session = require("express-session");
const http = require("http");

// --------------------
// Import API Routes
// --------------------
const authRoutes = require("./routes/auth/auth.routes");
const adminRoutes = require("./routes/admin/admin.routes");
const storeRoutes = require("./routes/store/store.routes");
const categoryRoutes = require("./routes/script/category.routes");
const productRoutes = require("./routes/product/product.routes");
const profileRoutes = require("./routes/profile/profile.routes");
const searchRoutes = require("./routes/search/search.routes");
const checkoutRoutes = require("./routes/checkout/checkout.routes");
const storeOrdersRoutes = require("./routes/store-orders/storeOrders.routes");
const buyerOrderRoutes = require("./routes/buyer orders/buyer.order.routes");
const unitsRoutes = require("./routes/script/scripts.routes");
const chatRoutes = require("./routes/chat/chat.routes");
const paymentRoutes = require("./routes/Payment/payment.routes"); // Updated path to match file structure

// --------------------
// Import Socket & Utilities
// --------------------
const socketUtil = require("./utils/socket.order");
const chatSockets = require("./sockets/chat.socket");

// Initialize Express App and HTTP Server
const app = express();
const server = http.createServer(app);

// --------------------
// CORS Configuration
// --------------------
// Define which origins are allowed to access the API
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:59257",
  "http://localhost:63137",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);

// --------------------
// Global Middlewares
// --------------------
app.use(express.json()); // Parse incoming JSON payloads

// Configure Session Middleware
app.use(
  session({
    secret: "your-secret-key", // Recommendation: Use process.env.SESSION_SECRET in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// --------------------
// Register API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/product/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded files statically
app.use("/buyer", buyerOrderRoutes);
app.use("/storeOrders", storeOrdersRoutes);
app.use("/product/unit", unitsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);

// --------------------
// Socket.IO Integration
// --------------------
// Initialize Socket.io with the HTTP server
const io = socketUtil.init(server);
const chatIO = io.of("/chat"); // Create a namespace for chat

// Attach IO instances to the request object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  req.chatIO = chatIO;
  next();
});

// Initialize Chat Socket Listeners
chatSockets(chatIO);

// --------------------
// Database Connection & Server Startup
// --------------------
const PORT = process.env.PORT || 3000;

mongoose
  .connect("mongodb://localhost:27017/Dukanify", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    // Start the server only after successful DB connection
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
