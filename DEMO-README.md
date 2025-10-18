# SalonSite - Faculty Demo Guide

## 🎯 Quick Start for Demonstration

### Prerequisites
- Node.js and npm installed
- MySQL database running
- `.env` file configured (see below)

### Starting the Demo
```bash
node start-demo.js
```

This will automatically:
- ✅ Install dependencies
- ✅ Seed the database with realistic sample data
- ✅ Start the server at http://localhost:3000

---

## 🗄️ Sample Data Included

The demo comes pre-populated with:

### 📊 **8 Sample Appointments**
- **3 Pending** appointments (need admin approval)
- **2 Confirmed** appointments 
- **1 Completed** appointment
- **1 Cancelled** appointment
- **1 Additional** pending appointment

### 💇 **5 Professional Services**
- Haircut & Style ($45 member / $55 non-member)
- Hair Coloring ($85 / $100)
- Blowout ($35 / $45)  
- Deep Conditioning Treatment ($25 / $35)
- Wedding Updo ($75 / $95)

### 🧴 **5 Beauty Products**
- Olaplex No. 3 Hair Perfector
- Kerastase Nutritive Shampoo
- Moroccanoil Treatment Oil
- Redken All Soft Conditioner
- Paul Mitchell Tea Tree Shampoo

### 👥 **2 Staff Members**
- Sarah Johnson (Senior Stylist)
- Emily Rodriguez (Bridal Specialist)

---

## 🚀 Demo Flow for Faculty

### 1. **Customer Experience** (5 minutes)
1. Visit http://localhost:3000
2. Browse services and products
3. Click "Book Now" → Shows Google sign-in requirement
4. Navigate through responsive pages (About, Services, Products)

### 2. **Admin Dashboard** (10 minutes)
1. Visit http://localhost:3000/admin
2. Sign in with admin Google account
3. **Dashboard Overview:**
   - View appointment statistics
   - See recent activity
   - Quick access to management areas

### 3. **Appointment Management** (Key Feature)
1. Go to "Appointments" from admin menu
2. **Demonstrate:**
   - View all appointments with status badges
   - Filter by status (All, Pending, Confirmed, etc.)
   - Search by customer name or service
   - **Approve pending appointments:** Click green checkmark → Set date/time
   - **Cancel appointments:** Click red X → Confirm cancellation
   - **View appointment details:** Click eye icon

### 4. **Staff & Service Management**
1. **Services:** Add/edit/delete services with pricing
2. **Staff:** Manage staff profiles and schedules
3. **Products:** Inventory management
4. **Customers:** View customer profiles and history

### 5. **Technical Features to Highlight**
- **Responsive Design:** Test on mobile/tablet simulation
- **Authentication:** Google OAuth integration
- **Role-based Access:** Admin vs Customer views
- **Real-time Updates:** Appointment status changes
- **Data Validation:** Form validation and error handling

---

## 🔑 Login Instructions

### Admin Access
Use any Google account listed in your `ADMIN_EMAILS` environment variable:
- Default: `kaushikeebhatt4@gmail.com` (if configured)
- Or add your email to `.env` file

### Customer Access
Any Google account can:
- Book appointments
- View personal dashboard
- Manage their bookings

---

## 🎨 UI/UX Features to Showcase

### ✨ **Modern Design**
- Clean, professional salon aesthetics
- Consistent branding and color scheme
- Smooth animations and transitions

### 📱 **Responsive Layout**
- Mobile-first design
- Tablet and desktop optimization
- Touch-friendly interface

### ⚡ **User Experience**
- Intuitive navigation
- Clear call-to-action buttons
- Informative status indicators
- Loading states and feedback

---

## 🔧 Technical Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** Google OAuth 2.0
- **Frontend:** Handlebars templates, Bootstrap 5
- **Styling:** Custom CSS with CSS variables
- **JavaScript:** jQuery, SweetAlert2

---

## 📝 Key Talking Points

1. **Real-World Application:** This is a functional salon management system
2. **Full-Stack Implementation:** Database, server, and client-side code
3. **Modern Web Technologies:** Current industry standards
4. **User-Centered Design:** Both admin and customer perspectives
5. **Scalable Architecture:** Can handle multiple locations/staff
6. **Security Considerations:** Authentication, data validation

---

## 🐛 Troubleshooting

### If appointments don't show:
```bash
node seedDatabase.js
```

### If authentication fails:
- Check `.env` file configuration
- Verify Google OAuth settings

### If styles look broken:
- Ensure `public/assets/css/salon.css` exists
- Check browser console for errors

---

## 📞 Demo Support

If you encounter issues during the demo:
1. Check the terminal for error messages
2. Verify database connection
3. Ensure all environment variables are set

---

**Total Demo Time Recommended:** 15-20 minutes
**Key Focus:** Appointment management workflow and admin capabilities