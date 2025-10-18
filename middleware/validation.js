// Input validation middleware
const validator = require('validator');

// Sanitize input data
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return validator.escape(str.trim());
}

// Validate email format
function isValidEmail(email) {
    return validator.isEmail(email);
}

// Validate phone number (basic)
function isValidPhone(phone) {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Validate appointment data
function validateAppointmentData(req, res, next) {
    const { service, preferredDate, phone } = req.body;
    const errors = [];

    // Required field validation
    if (!service || service.trim().length === 0) {
        errors.push('Service is required');
    }

    if (!preferredDate) {
        errors.push('Preferred date is required');
    } else {
        // Validate date format and ensure it's in the future
        const date = new Date(preferredDate);
        if (isNaN(date.getTime())) {
            errors.push('Invalid date format');
        } else if (date < new Date()) {
            errors.push('Appointment date must be in the future');
        }
    }

    if (phone && !isValidPhone(phone)) {
        errors.push('Invalid phone number format');
    }

    // Sanitize inputs
    if (req.body.service) req.body.service = sanitizeInput(req.body.service);
    if (req.body.notes) req.body.notes = sanitizeInput(req.body.notes);
    if (req.body.preferredTime) req.body.preferredTime = sanitizeInput(req.body.preferredTime);

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Validate product data
function validateProductData(req, res, next) {
    const { name, brand, price, stock_quantity } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Product name is required');
    }

    if (!brand || brand.trim().length === 0) {
        errors.push('Brand is required');
    }

    if (price && !validator.isFloat(price.toString(), { min: 0 })) {
        errors.push('Price must be a valid positive number');
    }

    if (stock_quantity && !validator.isInt(stock_quantity.toString(), { min: 0 })) {
        errors.push('Stock quantity must be a valid positive integer');
    }

    // Sanitize inputs
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeInput(req.body[key]);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Validate service data
function validateServiceData(req, res, next) {
    const { name, duration, member_price, nonmember_price } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Service name is required');
    }

    if (duration && !validator.isInt(duration.toString(), { min: 1 })) {
        errors.push('Duration must be a valid positive integer');
    }

    if (member_price && !validator.isFloat(member_price.toString(), { min: 0 })) {
        errors.push('Member price must be a valid positive number');
    }

    if (nonmember_price && !validator.isFloat(nonmember_price.toString(), { min: 0 })) {
        errors.push('Non-member price must be a valid positive number');
    }

    // Sanitize inputs
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeInput(req.body[key]);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Validate staff data
function validateStaffData(req, res, next) {
    const { name, email, mobile } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Staff name is required');
    }

    if (!email || !isValidEmail(email)) {
        errors.push('Valid email is required');
    }

    if (mobile && !isValidPhone(mobile)) {
        errors.push('Invalid mobile number format');
    }

    // Sanitize inputs
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeInput(req.body[key]);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Validate customer data
function validateCustomerData(req, res, next) {
    const { name, email, mobile } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Customer name is required');
    }

    if (!email || !isValidEmail(email)) {
        errors.push('Valid email is required');
    }

    if (mobile && !isValidPhone(mobile)) {
        errors.push('Invalid mobile number format');
    }

    // Sanitize inputs
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeInput(req.body[key]);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Validate ID parameter
function validateIdParam(req, res, next) {
    const id = req.params.id;
    
    if (!validator.isInt(id.toString(), { min: 1 })) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID parameter'
        });
    }

    next();
}

module.exports = {
    sanitizeInput,
    isValidEmail,
    isValidPhone,
    validateAppointmentData,
    validateProductData,
    validateServiceData,
    validateStaffData,
    validateCustomerData,
    validateIdParam
};