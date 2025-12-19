const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ เพิ่ม Health Check Route (ทดสอบว่า server รันอยู่)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Server is running! 🚀',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'ไม่พบ route ที่คุณเรียก'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API is running on http://localhost:${PORT}`);
});

module.exports = app;