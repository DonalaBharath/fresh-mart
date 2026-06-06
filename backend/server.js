require('dotenv').config();
const contactRoutes = require("./routes/contactRoutes");
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const sanitizeRequest = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

/* Security Middleware */
app.use(helmet( {
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

/* Body Parser */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* Cookies */
app.use(cookieParser());

/* Input Sanitization */
app.use(sanitizeRequest);

/* CORS */
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-Requested-With'],
}));

/* Static Uploads */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

/* Logger */
app.use(morgan('dev'));

/* Rate Limiting */
// Global rate limiter - applies to all endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased from 150 to 300 requests
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

app.use(limiter);

/* Health Route */
app.get('/', (req, res) => {
res.json({ message: 'Fresh Mart API is live' });
});

/* API Routes */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

/* Global Error Handler */
app.use(errorHandler);

/* Start Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Fresh Mart backend running on port ${PORT}`);
});
