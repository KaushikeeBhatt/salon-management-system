// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var session = require("express-session");
let path = require("path");
const { format } = require('date-fns');
const helmet = require('helmet');
const compression = require('compression');

// Load environment variables
require('dotenv').config();

// Production security check
if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-secret-key-change-this-in-production') {
        console.error('❌ SECURITY WARNING: Please set a secure SESSION_SECRET in production!');
        process.exit(1);
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('❌ SECURITY WARNING: Google OAuth credentials not set in production!');
        process.exit(1);
    }
}

// Test Google Auth configuration
const { testConfiguration } = require("./config/google-auth");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 3000;

// Trust proxy for production (enable if behind load balancer/proxy)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Requiring our models for syncing
var db = require("./models");

// Security middleware - Apply helmet before other middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://code.jquery.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://code.jquery.com", "https://squareup.com", "https://app.squareup.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://code.jquery.com"],
            frameSrc: ["'self'", "https://squareup.com", "https://app.squareup.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware for better performance
app.use(compression());

// Session configuration with security improvements
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'salon.session', // Custom session name (security through obscurity)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) : 24 * 60 * 60 * 1000, // Configurable session timeout
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // Stricter in production
  }
}));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Set Handlebars.
const { engine } = require("express-handlebars");

app.engine("handlebars", engine({
  defaultLayout: "main",
  helpers: {
    eq: function(v1, v2) { return v1 === v2; },
    gt: function(v1, v2) { return v1 > v2; },
    formatDate: function(date) {
      if (!date) return '';
      try {
        return format(new Date(date), 'MMM d, yyyy h:mm a');
      } catch (e) {
        console.error('Error formatting date:', e);
        return date;
      }
    },
    substring: function(str, start, end) {
      return str ? str.substring(start, end) : '';
    },
    firstChar: function(str) {
      return str ? str.charAt(0).toUpperCase() : '';
    },
    json: function(context) {
      return JSON.stringify(context, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    }
  }
}));
app.set("view engine", "handlebars");

// Static directory
app.use(express.static("public"));

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Add authentication middleware
const { setUserContext } = require("./middleware/auth");
app.use(setUserContext);

// Enhanced CORS configuration
app.use((req, res, next) => {
  // Only allow specific origins in production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []) 
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting for production
if (process.env.NODE_ENV === 'production') {
  const rateLimit = require('express-rate-limit');
  
  // General rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Stricter rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
  });
  
  app.use(limiter);
  app.use('/auth', authLimiter);
}

// Routes
// =============================================================
// Import routes and give the server access to them.
var salon = require("./controllers/salon_controller")
var customer = require("./controllers/customer_controller")
var admin = require("./controllers/admin_controller")
var { router: auth } = require("./controllers/auth_controller")

// Serve the appointments page
app.get("/appointments", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/appointments.html"));
});

app.use("/", salon);
app.use("/customer", customer);
app.use("/admin", admin);
app.use("/auth", auth);

// Error handling middleware (must be last)
const { errorHandler, notFoundHandler, setupGracefulShutdown } = require("./middleware/errorHandler");
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync(
  //{ force: true }
).then(function() {
  // Ensure User table exists and has proper structure
  return db.User.findOrCreate({
    where: { email: 'system@test.com' },
    defaults: {
      name: 'System Test User',
      role: 'customer',
      isActive: false
    }
  });
}).then(function([user, created]) {
  if (created) {
    console.log('✅ User table verified/created successfully');
    // Remove the test user
    return user.destroy();
  } else {
    console.log('✅ User table already exists');
    return Promise.resolve();
  }
}).then(function() {
  // Ensure admin users exist
  const adminEmails = ['admin@blvd6salon.com', 'owner@blvd6salon.com', 'kaushikeebhatt4@gmail.com'];
  const promises = adminEmails.map(email => {
    return db.User.findOrCreate({
      where: { email: email },
      defaults: {
        name: email.split('@')[0],
        email: email,
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    });
  });
  
  return Promise.all(promises);
}).then(function(results) {
  const created = results.filter(([user, created]) => created);
  if (created.length > 0) {
    console.log(`✅ Created ${created.length} admin users`);
  } else {
    console.log('✅ Admin users already exist');
  }
}).then(function() {
  // Create test appointments if none exist
  return db.Appointment.findAndCountAll();
}).then(function(result) {
  if (result.count === 0) {
    console.log('📝 Creating test appointments...');
    const testAppointments = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        service: 'Haircut',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        preferredTime: '10:00 AM',
        status: 'pending'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        service: 'Hair Coloring',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        preferredTime: '2:00 PM',
        status: 'pending'
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        phone: '555-9012',
        service: 'Manicure',
        preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        preferredTime: '11:00 AM',
        status: 'confirmed'
      }
    ];
    
    return db.Appointment.bulkCreate(testAppointments);
  } else {
    console.log(`✅ Found ${result.count} existing appointments`);
    return Promise.resolve();
  }
}).then(function(createdAppointments) {
  if (createdAppointments && createdAppointments.length > 0) {
    console.log(`✅ Created ${createdAppointments.length} test appointments`);
  }
}).then(function() {
  const server = app.listen(PORT, function() {
    console.log("🚀 App listening on PORT " + PORT);
    console.log("🌐 Visit: http://localhost:" + PORT);
    
    // Test Google Auth configuration
    console.log("\n📋 Testing Google Auth Configuration...");
    testConfiguration();
    
    console.log("\n✅ Server started successfully!");
    console.log("🔒 Environment:", process.env.NODE_ENV || 'development');
    
    // Setup graceful shutdown
    setupGracefulShutdown(server);
  });
}).catch(function(error) {
  console.error("❌ Database sync error:", error);
  console.error("Please check your database connection and try again.");
  process.exit(1);
});

//{force:true}