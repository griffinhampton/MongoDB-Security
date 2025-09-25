const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for demo purposes (replace with MongoDB in production)
let submissions = [];
let submissionCounter = 1;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

console.log('Running in DEMO mode with in-memory storage');
console.log('In production, this would connect to MongoDB');

// Validation middleware
const validateInput = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .trim()
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to handle form submissions
app.post('/api/submit', validateInput, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        // Create new user data entry (in-memory for demo)
        const userData = {
            _id: `demo-${submissionCounter++}`,
            name,
            email,
            message,
            ipAddress,
            createdAt: new Date()
        };

        // Save to in-memory storage (in production, this would be MongoDB)
        submissions.push(userData);

        console.log('New submission saved:', { id: userData._id, name, email });

        res.status(201).json({
            success: true,
            message: 'Data saved successfully',
            id: userData._id
        });

    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// API endpoint to get all submissions (for demonstration)
app.get('/api/submissions', async (req, res) => {
    try {
        const recentSubmissions = submissions
            .map(s => ({
                _id: s._id,
                name: s.name,
                email: s.email,
                message: s.message,
                createdAt: s.createdAt
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50);

        res.json({
            success: true,
            data: recentSubmissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submissions'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'demo-mode (in-memory)',
        submissions_count: submissions.length
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Demo mode: Using in-memory storage`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;