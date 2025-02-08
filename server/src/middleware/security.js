// server/src/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const securityMiddleware = (app) => {
    // Add security headers
    app.use(helmet());
    
    // Add rate limiting
    app.use(limiter);
    
    // CORS configuration
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
        res.header('Access-Control-Allow-Methods', 'GET, POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
};

module.exports = securityMiddleware;