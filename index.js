// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const session = require("express-session");
const http = require("http");

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
const paymentRoutes = require("./routes/payment.routes");

const socketUtil = require("./utils/socket.order");
const chatSockets = require("./sockets/chat.socket");

const app = express();
const server = http.createServer(app);

// --------------------
// CORS setup
// --------------------
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:59257",
  "http://localhost:63137",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --------------------
// Middlewares
// --------------------
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/product/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/buyer", buyerOrderRoutes);
app.use("/storeOrders", storeOrdersRoutes);
app.use("/product/unit", unitsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
// --------------------
// Socket.IO Setup
// --------------------
const io = socketUtil.init(server);
const chatIO = io.of("/chat");

app.use((req, res, next) => {
  req.io = io;
  req.chatIO = chatIO;
  next();
});

chatSockets(chatIO);

// --------------------
// MongoDB + Server start
// --------------------
const PORT = process.env.PORT || 3000;

mongoose
  .connect("mongodb://localhost:27017/Dukanify", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
