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

const app = express();
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
// app.use('/users', route);

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