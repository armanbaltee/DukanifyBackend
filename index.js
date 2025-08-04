const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();
const session = require('express-session');
const route = require('./routes/auth/auth.routes')
const adminRoutes = require('./routes/admin/admin.routes')
const storeRoutes = require('./routes/store/store.routes')
const productCategory = require('./routes/product/category.routes')
const productRoutes = require("./routes/product/product.routes")
const profileRoutes = require('./routes/profile/profile.routes')
const Store = require ('./models/store.model')
const SearchRoutes = require('./routes/search/search.routes')
const checkoutRoutes = require('./routes/checkout/checkout.routes')
const http = require('http'); 
const { Server } = require('socket.io'); 
const socketUtil = require('./utils/socket.order');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
  }
});

socketUtil.initSocket(io); 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);


  socket.on('joinStore', (storeId) => {
    console.log(`Store joined room: ${storeId}`);
    socket.join(storeId);
  });

  socket.on('joinBuyer', (userId) => {
    console.log(`Buyer joined room: ${userId}`);
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use('/api/auth', route)
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes)

app.use('/product/category', productCategory);
app.use('/product', productRoutes)
app.use('/api/profile', profileRoutes)
app.use('/uploads', express.static('uploads'));
app.use('/api/search', SearchRoutes);
app.use('/checkout', checkoutRoutes)


const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/Dukanify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));