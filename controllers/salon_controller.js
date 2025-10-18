var express = require("express");
var router = express.Router();
var db = require("../models");
const SALON_NAME = "Blvd6 Salon";
const { requireAuth } = require("../middleware/auth");
const { validateAppointmentData, validateIdParam } = require("../middleware/validation");

// Function to decode HTML entities
function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

// Optional: Add nodemailer for email notifications (uncomment if you want email notifications)
// var nodemailer = require('nodemailer');

//display
router.get("/about", (req, res) => {
  //show salon info on the about page
  db.Salon.findOne({
    where: {
      name: SALON_NAME
    },
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then(function (data) {
    // console.log(data);

    res.render("about", { about: data });
  });
});

//show contactus
router.get("/contactus", async (req, res) => {
  try {
    const data = await db.Salon.findOne({
      where: { name: SALON_NAME },
      include: [db.Address, db.Email, db.Phone]
    });
    
    if (!data) {
      console.error('❌ Salon information not found');
      return res.status(404).render('contactus', { 
        contactus: null,
        error: 'Salon information not available'
      });
    }
    
    // Convert to plain object for proper Handlebars access
    const salonData = data.toJSON();
    
    // Check for success message
    const renderData = { contactus: salonData };
    if (req.query.message === 'success') {
      renderData.success = 'Thank you for your message! We will get back to you soon.';
    }
    
    res.render("contactus", renderData);
  } catch (error) {
    console.error('❌ Error loading contact page:', error);
    res.status(500).render('contactus', { 
      contactus: null,
      error: 'Error loading contact information'
    });
  }
});

router.post("/leads", async (req, res) => {
  try {
    const { firstNameContact, lastNameContact, emailContact, phoneContact, reasonContact, addlContact } = req.body;
    
    // Check if this is an empty/automated request (no referer and all fields empty)
    const isEmptyRequest = !req.get('Referer') && 
      !firstNameContact && !lastNameContact && !emailContact && !reasonContact && !addlContact;
    
    if (isEmptyRequest) {
      // Silently ignore empty/automated requests (bots, crawlers, etc.)
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request' 
      });
    }
    
    // Validate required fields
    if (!firstNameContact || !lastNameContact || !emailContact || !reasonContact || !addlContact) {
      console.log('❌ Lead validation failed: Missing required fields');
      return res.status(400).render('contactus', { 
        error: 'Please fill in all required fields.',
        contactus: await getSalonInfo()
      });
    }
    
    // Create lead in database
    const lead = await db.Lead.create({
      firstName: firstNameContact.trim(),
      lastName: lastNameContact.trim(),
      email: emailContact.trim().toLowerCase(),
      phone: phoneContact ? phoneContact.trim() : null,
      reason: reasonContact,
      message: addlContact.trim(),
      status: 'new',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    console.log('✅ New lead saved successfully:', {
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      reason: lead.reason
    });
    
    // TODO: Send email notification to salon (uncomment if email is configured)
    // await sendLeadNotification(lead);
    
    // Redirect with success message
    res.redirect("/contactus?message=success");
    
  } catch (error) {
    console.error('❌ Error saving lead:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      return res.status(400).render('contactus', { 
        error: `Validation error: ${validationErrors}`,
        contactus: await getSalonInfo()
      });
    }
    
    // Handle other errors
    res.status(500).render('contactus', { 
      error: 'Sorry, there was an error sending your message. Please try again or call us directly.',
      contactus: await getSalonInfo()
    });
  }
});

// Helper function to get salon info for contact page
async function getSalonInfo() {
  try {
    const data = await db.Salon.findOne({
      where: { name: SALON_NAME },
      include: [db.Address, db.Email, db.Phone]
    });
    return data ? data.toJSON() : null;
  } catch (error) {
    console.error('Error fetching salon info:', error);
    return null;
  }
}

//show product brand on the product page
router.get("/products", async (req, res) => {
  try {
    // Get distinct brands with their first non-empty photo
    const brands = await db.Product.findAll({
      attributes: ['brand'],
      group: ['brand'],
      raw: true
    });
    
    // For each brand, find the first product with a photo
    const data = await Promise.all(brands.map(async (brandItem) => {
      const productWithPhoto = await db.Product.findOne({
        where: {
          brand: brandItem.brand,
          photo: {
            [db.Sequelize.Op.ne]: null,
            [db.Sequelize.Op.ne]: ''
          }
        },
        attributes: ['id', 'photo'],
        raw: true
      });
      
      // If no product with photo found, get any product from this brand for the ID
      const fallbackProduct = await db.Product.findOne({
        where: { brand: brandItem.brand },
        attributes: ['id'],
        raw: true
      });
      
      // Decode HTML entities in photo URL
      let photoUrl = productWithPhoto ? decodeHtmlEntities(productWithPhoto.photo) : null;
      
      return {
        brand: brandItem.brand,
        photo: photoUrl,
        id: productWithPhoto ? productWithPhoto.id : (fallbackProduct ? fallbackProduct.id : null)
      };
    }));
    
    console.log('🔍 Product brands data:', data);
    res.render("products", { productBrands: data });
  } catch (error) {
    console.error('Error loading product brands:', error);
    res.render("products", { productBrands: [] });
  }
});

// show products in the brand
router.get("/products/:brand", (req, res)=>{
  db.Product.findAll({
    where:{
      brand:req.params.brand
    } 
  }).then(data =>{
    // Decode HTML entities in photo URLs
    const decodedData = data.map(product => {
      const productData = product.toJSON ? product.toJSON() : product;
      if (productData.photo) {
        productData.photo = decodeHtmlEntities(productData.photo);
      }
      return productData;
    });
    
    console.log("data2: ", decodedData);
    res.json({products: decodedData});
  });
});

//show staff
router.get("/staff", (req, res)=>{
  db.Staff.findAll({
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then(data=>{
    //console.log(data);
    res.render("staff", {staff:data});
  });
});

router.get("/", (req, res) => {
  res.render("index", { data: "hello" });
});

//show services
router.get("/services", async (req, res) => {
  try {
    const data = await db.Service.findAll({
      order: [['name', 'ASC']]
    });
    
    // Convert to plain objects for proper Handlebars access
    const services = data.map(service => service.toJSON());
    
    console.log('🔍 Services loaded for user:', services.length);
    console.log('📋 First service:', services[0]);
    
    res.render("services", { services: services });
  } catch (error) {
    console.error('❌ Error loading services:', error);
    res.render("services", { services: [] });
  }
});

// Handle appointment requests (with database storage) - REQUIRES LOGIN
router.post("/appointment-request", validateAppointmentData, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.isAuthenticated || !req.session.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please sign in to book an appointment',
        requiresLogin: true
      });
    }

    const { service, preferredDate, preferredTime, notes, phone } = req.body;
    const user = req.session.user;
    
    console.log(`📅 Creating appointment for authenticated user: ${user.email}`);
    
    // Use authenticated user's information
    const appointment = await db.Appointment.create({
      firstName: user.name ? user.name.split(' ')[0] : 'User',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
      email: user.email,
      phone: phone, // Use phone number from the form
      service,
      preferredDate,
      preferredTime,
      notes,
      status: 'pending',
      userId: user.id // Always link to authenticated user
    });

    console.log('✅ New Appointment Created for user:', appointment.toJSON());

    // Respond with success and confirmation code
    res.status(200).json({ 
      success: true, 
      message: 'Appointment request received successfully. We will contact you soon!',
      confirmationCode: appointment.confirmationCode,
      appointmentId: appointment.id,
      userEmail: user.email
    });

  } catch (error) {
    console.error('❌ Error creating appointment:', error.message);
    console.error('Stack Trace:', error.stack);
    console.error('Request Body:', req.body);
    console.error('Session User:', req.session.user);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create appointment. Please try again.' 
    });
  }
});

// Check appointment status with enhanced debugging
router.get("/appointment-status/:confirmationCode", async (req, res) => {
  try {
    const confirmationCode = req.params.confirmationCode.trim().toUpperCase();
    console.log(`🔍 Looking up appointment with code: ${confirmationCode}`);
    
    const appointment = await db.Appointment.findOne({
      where: { confirmationCode: confirmationCode }
    });

    if (!appointment) {
      console.log(`❌ No appointment found for code: ${confirmationCode}`);
      
      // Debug: Show all confirmation codes in database (remove in production)
      const allCodes = await db.Appointment.findAll({
        attributes: ['confirmationCode', 'firstName', 'lastName'],
        limit: 10
      });
      console.log('📋 Available confirmation codes:', allCodes.map(a => a.confirmationCode));
      
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        debug: {
          searchedCode: confirmationCode,
          availableCodes: allCodes.map(a => a.confirmationCode)
        }
      });
    }

    console.log(`✅ Found appointment for: ${appointment.firstName} ${appointment.lastName}`);
    
    res.json({
      success: true,
      appointment: {
        id: appointment.id,
        name: `${appointment.firstName} ${appointment.lastName}`,
        service: appointment.service,
        preferredDate: appointment.preferredDate,
        preferredTime: appointment.preferredTime,
        actualDateTime: appointment.actualDateTime,
        status: appointment.status,
        confirmationCode: appointment.confirmationCode,
        createdAt: appointment.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment status',
      error: error.message
    });
  }
});

// Debug endpoint to list all appointments (remove in production)
router.get("/debug/appointments", async (req, res) => {
  try {
    const appointments = await db.Appointment.findAll({
      attributes: ['id', 'confirmationCode', 'firstName', 'lastName', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user appointments (for logged-in users)
router.get("/my-appointments/:userId", async (req, res) => {
  try {
    console.log(`🔍 Fetching appointments for user ID: ${req.params.userId}`);
    
    // First, try to find appointments linked to the user ID
    let appointments = await db.Appointment.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📋 Found ${appointments.length} appointments linked to user ID`);
    
    // If no appointments found by userId, try to find by email (for backward compatibility)
    if (appointments.length === 0 && req.session.user && req.session.user.email) {
      console.log(`🔄 Trying to find appointments by email: ${req.session.user.email}`);
      
      appointments = await db.Appointment.findAll({
        where: { email: req.session.user.email },
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`📧 Found ${appointments.length} appointments by email`);
      
      // Link these appointments to the user for future reference
      if (appointments.length > 0) {
        console.log(`🔗 Linking ${appointments.length} appointments to user ID ${req.params.userId}`);
        await db.Appointment.update(
          { userId: req.params.userId },
          { where: { email: req.session.user.email, userId: null } }
        );
      }
    }

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        id: apt.id,
        service: apt.service,
        preferredDate: apt.preferredDate,
        preferredTime: apt.preferredTime,
        actualDateTime: apt.actualDateTime,
        status: apt.status,
        confirmationCode: apt.confirmationCode,
        createdAt: apt.createdAt,
        firstName: apt.firstName,
        lastName: apt.lastName
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// Alternative endpoint: Get appointments for currently logged-in user
router.get("/my-appointments", async (req, res) => {
  try {
    if (!req.session.isAuthenticated || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view your appointments'
      });
    }
    
    const userId = req.session.user.id;
    const userEmail = req.session.user.email;
    
    console.log(`🔍 Fetching appointments for logged-in user: ${userEmail} (ID: ${userId})`);
    
    // Try to find appointments by userId first, then by email
    let appointments = await db.Appointment.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { userId: userId },
          { email: userEmail }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📋 Found ${appointments.length} total appointments`);
    
    // Update any appointments found by email to link them to the user ID
    const emailOnlyAppointments = appointments.filter(apt => !apt.userId && apt.email === userEmail);
    if (emailOnlyAppointments.length > 0) {
      console.log(`🔗 Linking ${emailOnlyAppointments.length} email-based appointments to user`);
      await db.Appointment.update(
        { userId: userId },
        { where: { email: userEmail, userId: null } }
      );
    }

    res.json({
      success: true,
      appointments: appointments.map(apt => ({
        id: apt.id,
        service: apt.service,
        preferredDate: apt.preferredDate,
        preferredTime: apt.preferredTime,
        actualDateTime: apt.actualDateTime,
        status: apt.status,
        confirmationCode: apt.confirmationCode,
        createdAt: apt.createdAt,
        firstName: apt.firstName,
        lastName: apt.lastName
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
});

// Appointment status page
router.get("/appointment-lookup", (req, res) => {
  res.render("appointment-lookup");
});

// User dashboard - accessible to all users (authentication optional)
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// User profile page (for logged-in users) - REQUIRES AUTHENTICATION
router.get("/profile", requireAuth, (req, res) => {
  res.render("profile");
});

// Debug page for testing (remove in production)
router.get("/debug", (req, res) => {
  res.render("debug");
});

// Session debug endpoint (remove in production)
router.get("/debug/session", (req, res) => {
  res.json({
    session: {
      isAuthenticated: req.session.isAuthenticated || false,
      user: req.session.user || null,
      sessionID: req.sessionID
    },
    headers: {
      userAgent: req.headers['user-agent'],
      host: req.headers.host
    },
    timestamp: new Date().toISOString()
  });
});

// Test authentication endpoint
router.get("/test-auth", (req, res) => {
  const { testConfiguration } = require("../config/google-auth");
  
  res.json({
    success: true,
    session: {
      isAuthenticated: req.session.isAuthenticated || false,
      user: req.session.user || null,
      sessionId: req.sessionID
    },
    googleAuth: {
      configValid: testConfiguration(),
      clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000
    }
  });
});

//staff_service
//to show what kind of service that each staff perform, will be in the future development

// router.get("/logs", (req, res) => {
//   db.Staff.findAll({
//     order: [["name", "ASC"]],
//   }).then(data => {
//     // console.log(data);
//     res.render("adminLog", { staffLogs: data })
//   });
// });
// var staffServiceArr = [];
// router.get("/logs/:id", (req, res) => {
//   // console.log("param",req.params.id)
//   db.Staff_service.findAll({
//     where: {
//       StaffId: req.params.id,
//     }
//   }).then(data => {
//     // console.log(data);
//     for (var i = 0; i < data.length; i++) {
//       // console.log(data[i].dataValues.ServiceId);
//       staffServiceArr.push(data[i].dataValues.ServiceId)
//     }
//     return staffServiceArr
//   }).then((staffServiceArr) => {
//     // console.log("arr",staffServiceArr)
//     db.Service.findAll({
//       where: {
//         id: {
//           in: staffServiceArr
//         }
//       }
//     }).then(data => {
//       console.log(data)
//       staffServiceArr = [];
//       res.render("adminLog", { staffServiceLogs: data });
//     })
//   })
// });

module.exports = router;