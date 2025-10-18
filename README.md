# SalonSite - Professional Salon Management System

A full-stack web application for managing salon operations, including appointment booking, staff management, service catalog, and customer relationship management.

## 🌟 Features

### 👥 Customer Features
- **Service Browsing**: Explore available salon services with detailed descriptions and pricing
- **Product Catalog**: View professional beauty products with inventory information
- **Online Booking**: Schedule appointments with Google OAuth authentication
- **Appointment Management**: Track appointment status and history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔧 Admin Features
- **Dashboard Overview**: Real-time statistics and recent activity monitoring
- **Appointment Management**: Approve, decline, reschedule, and track appointments
- **Service Management**: Add, edit, and manage salon services with pricing tiers
- **Staff Management**: Maintain staff profiles, schedules, and contact information
- **Product Inventory**: Track product stock, pricing, and vendor information
- **Customer Database**: Comprehensive customer profiles and service history

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaushikeeBhatt/salon-management-system.git
   cd salon-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=salon_db
   DB_DIALECT=mysql

   # Authentication
   SESSION_SECRET=your_session_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # User Roles (comma separated emails)
   ADMIN_EMAILS=admin@blvd6salon.com,owner@blvd6salon.com
   STAFF_EMAILS=staff@blvd6salon.com,stylist@blvd6salon.com

   # Server Configuration
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Create database tables and seed with sample data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start

   # Demo mode (includes automatic seeding)
   npm run demo
   ```

## 📋 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-restart
- `npm run demo` - Complete demo setup with sample data
- `npm run seed` - Populate database with sample data
- `npm run test-admin` - Test all admin functionality
- `npm run build:css` - Compile SCSS to CSS
- `npm run watch:css` - Watch and compile SCSS changes

## 🏗️ Project Structure

```
SalonSite/
├── config/                 # Configuration files
│   ├── database.js         # Database configuration
│   └── passport.js         # Authentication configuration
├── controllers/            # Route controllers
│   ├── admin_controller.js # Admin panel logic
│   ├── auth_controller.js  # Authentication logic
│   └── main_controller.js  # Public routes
├── middleware/             # Custom middleware
│   ├── auth.js            # Authentication middleware
│   └── validation.js      # Input validation
├── models/                # Database models
│   ├── appointment.js     # Appointment model
│   ├── customer.js        # Customer model
│   ├── service.js         # Service model
│   └── staff.js          # Staff model
├── public/                # Static assets
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   └── images/       # Image assets
├── routes/                # Route definitions
├── views/                 # Handlebars templates
│   ├── layouts/          # Page layouts
│   ├── partials/         # Reusable components
│   └── *.handlebars      # Page templates
├── seedDatabase.js        # Database seeding script
├── server.js             # Main application file
└── package.json          # Project configuration
```

## 🎯 Usage Guide

### For Customers

1. **Browse Services**
   - Visit the homepage to explore available services
   - View detailed service descriptions and pricing

2. **Book an Appointment**
   - Click "Book Now" and sign in with Google
   - Select your preferred service, date, and time
   - Receive confirmation with appointment details

3. **Manage Bookings**
   - Access your dashboard to view upcoming appointments
   - Track appointment status updates

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin` and sign in with an admin Google account
   - View the dashboard for system overview

2. **Manage Appointments**
   - Review pending appointment requests
   - Approve appointments by setting confirmed date/time
   - Cancel or reschedule appointments as needed

3. **Manage Services**
   - Add new services with pricing tiers
   - Update existing service information
   - Track service popularity and revenue

4. **Staff Management**
   - Maintain staff profiles and contact information
   - Set working schedules and availability
   - Track staff assignments and performance

## 🔐 Authentication & Authorization

The application uses Google OAuth 2.0 for authentication with role-based access control:

- **Guests**: Can browse services and products
- **Customers**: Can book and manage their appointments
- **Staff**: Can view their assigned appointments and schedules
- **Admins**: Full system access and management capabilities

Roles are determined by email addresses configured in environment variables.

## 🗄️ Database Schema

The application uses MySQL with Sequelize ORM. Key entities include:

- **Salon**: Main salon information and configuration
- **Services**: Available salon services with pricing
- **Products**: Beauty products inventory
- **Staff**: Employee profiles and schedules
- **Customers**: Customer profiles and contact information
- **Appointments**: Booking records with status tracking
- **Users**: Authentication and session management

## 🎨 Technologies Used

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Sequelize** - Database ORM
- **MySQL** - Database system
- **Passport.js** - Authentication middleware

### Frontend
- **Handlebars** - Template engine
- **Bootstrap 5** - CSS framework
- **jQuery** - JavaScript library
- **SweetAlert2** - Enhanced alerts and modals

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Sass** - CSS preprocessing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Deployment

### Environment Setup

1. Configure production environment variables
2. Set up MySQL database with proper credentials
3. Configure Google OAuth for your domain
4. Set up SSL certificates for HTTPS

### Production Considerations

- Enable HTTPS for secure authentication
- Configure proper session secrets
- Set up database connection pooling
- Enable compression and caching
- Configure rate limiting for API endpoints
- Set up logging and monitoring

## 🧪 Testing

Run the admin functionality tests:

```bash
npm run test-admin
```

This will verify:
- Database connectivity
- Model relationships
- CRUD operations
- Authentication flows
- Admin panel functionality

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add appropriate error handling and validation
- Update documentation for new features
- Test thoroughly before submitting PRs

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check database credentials in .env file
# Ensure MySQL server is running
# Verify database exists and user has proper permissions
```

**Authentication Not Working**
```bash
# Verify Google OAuth credentials
# Check callback URLs in Google Console
# Ensure admin emails are correctly configured
```

**Missing Sample Data**
```bash
# Re-run database seeding
npm run seed
```

**Styles Not Loading**
```bash
# Ensure CSS files are properly compiled
npm run build:css
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the demo guide in `DEMO-README.md`
3. Check existing GitHub issues
4. Create a new issue with detailed description

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Google for OAuth 2.0 authentication services
- All contributors who helped improve this project

---

**Made with ❤️ for professional salon management**