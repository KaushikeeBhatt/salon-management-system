// Global error handling middleware
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logger function
function logError(error, req = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${error.stack || error.message}\n`;
    
    if (req) {
        const requestInfo = `Request: ${req.method} ${req.url}\nUser: ${req.session?.user?.email || 'Anonymous'}\nIP: ${req.ip}\n`;
        fs.appendFileSync(path.join(logsDir, 'error.log'), requestInfo + logMessage + '\n');
    } else {
        fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage + '\n');
    }
}

// Database error handler
function handleDatabaseError(error) {
    console.error('❌ Database Error:', error);
    
    // Log specific database errors
    if (error.name === 'SequelizeConnectionError') {
        return {
            status: 503,
            message: 'Database connection failed. Please try again later.',
            code: 'DB_CONNECTION_ERROR'
        };
    } else if (error.name === 'SequelizeValidationError') {
        return {
            status: 400,
            message: 'Invalid data provided.',
            errors: error.errors.map(e => e.message),
            code: 'VALIDATION_ERROR'
        };
    } else if (error.name === 'SequelizeUniqueConstraintError') {
        return {
            status: 409,
            message: 'A record with this information already exists.',
            code: 'DUPLICATE_ERROR'
        };
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        return {
            status: 400,
            message: 'Invalid reference to related data.',
            code: 'FOREIGN_KEY_ERROR'
        };
    }
    
    return {
        status: 500,
        message: 'Database operation failed.',
        code: 'DB_ERROR'
    };
}

// Authentication error handler
function handleAuthError(error) {
    console.error('❌ Auth Error:', error);
    
    return {
        status: 401,
        message: 'Authentication failed. Please sign in again.',
        code: 'AUTH_ERROR'
    };
}

// Validation error handler
function handleValidationError(error) {
    return {
        status: 400,
        message: error.message || 'Invalid input data.',
        errors: error.errors || [],
        code: 'VALIDATION_ERROR'
    };
}

// Main error handling middleware
function errorHandler(error, req, res, next) {
    // Log the error
    logError(error, req);
    
    let errorResponse = {
        success: false,
        message: 'An unexpected error occurred.',
        code: 'INTERNAL_ERROR'
    };
    
    // Handle specific error types
    if (error.name && error.name.includes('Sequelize')) {
        errorResponse = { ...errorResponse, ...handleDatabaseError(error) };
    } else if (error.code && error.code.includes('AUTH')) {
        errorResponse = { ...errorResponse, ...handleAuthError(error) };
    } else if (error.name === 'ValidationError') {
        errorResponse = { ...errorResponse, ...handleValidationError(error) };
    } else if (error.status) {
        // HTTP errors
        errorResponse.status = error.status;
        errorResponse.message = error.message;
    }
    
    const status = errorResponse.status || 500;
    
    // In production, don't expose sensitive error details
    if (process.env.NODE_ENV === 'production') {
        delete errorResponse.stack;
        if (status === 500) {
            errorResponse.message = 'Internal server error. Please contact support if the problem persists.';
        }
    } else {
        // In development, include stack trace
        errorResponse.stack = error.stack;
        errorResponse.details = error.details || null;
    }
    
    // Send JSON response for API calls
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(status).json(errorResponse);
    }
    
    // For HTML requests, render error page
    res.status(status).render('error', {
        status: status,
        message: errorResponse.message,
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
}

// 404 handler
function notFoundHandler(req, res, next) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found.',
            code: 'NOT_FOUND'
        });
    }
    
    res.status(404).render('404', {
        url: req.originalUrl
    });
}

// Async error wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Graceful shutdown handler
function setupGracefulShutdown(server) {
    const gracefulShutdown = (signal) => {
        console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
        
        server.close(() => {
            console.log('✅ HTTP server closed.');
            
            // Close database connections
            if (require('../models').sequelize) {
                require('../models').sequelize.close().then(() => {
                    console.log('✅ Database connections closed.');
                    process.exit(0);
                }).catch((err) => {
                    console.error('❌ Error closing database:', err);
                    process.exit(1);
                });
            } else {
                process.exit(0);
            }
        });
        
        // Force close server after 10 seconds
        setTimeout(() => {
            console.error('❌ Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        logError(error);
        process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        logError(new Error(`Unhandled Rejection: ${reason}`));
        process.exit(1);
    });
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    setupGracefulShutdown,
    logError,
    handleDatabaseError,
    handleAuthError,
    handleValidationError
};