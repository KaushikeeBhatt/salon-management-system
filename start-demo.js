#!/usr/bin/env node

/**
 * Demo Startup Script for SalonSite
 * This script ensures the database is seeded and starts the application for demonstration
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🌟 Starting SalonSite Demo Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Please create one with the following variables:');
    console.log(`
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=salon_db
DB_DIALECT=mysql

SESSION_SECRET=your_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Admin and Staff emails (comma separated)
ADMIN_EMAILS=admin@blvd6salon.com,owner@blvd6salon.com,kaushikeebhatt4@gmail.com
STAFF_EMAILS=staff@blvd6salon.com,stylist@blvd6salon.com

PORT=3000
`);
    process.exit(1);
}

// Function to run a command and wait for it to complete
function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`📋 ${description}...`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr && !stderr.includes('warning')) {
                console.error(`⚠️  Warning: ${stderr}`);
            }
            if (stdout) {
                console.log(stdout);
            }
            console.log(`✅ ${description} completed\n`);
            resolve(stdout);
        });
    });
}

async function setupDemo() {
    try {
        // Check if node_modules exists
        if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
            await runCommand('npm install', 'Installing dependencies');
        } else {
            console.log('✅ Dependencies already installed\n');
        }

        // Seed the database
        await runCommand('node seedDatabase.js', 'Seeding database with sample data');

        console.log('🎉 Demo setup completed successfully!');
        console.log('\n📊 Database now contains:');
        console.log('   • 1 Salon configuration');
        console.log('   • 5 Professional services');
        console.log('   • 5 Beauty products');
        console.log('   • 2 Staff members');
        console.log('   • 2 Customers');
        console.log('   • 8 Sample appointments with various statuses');
        
        console.log('\n🚀 Starting the application...');
        console.log('💻 The salon website will be available at: http://localhost:3000');
        console.log('🔑 Admin panel will be available at: http://localhost:3000/admin');
        console.log('\n👤 Demo Users:');
        console.log('   • Admin: Log in with Google account listed in ADMIN_EMAILS');
        console.log('   • Customer: Any Google account can book appointments');
        
        console.log('\n🎯 Demo Features to Test:');
        console.log('   ✅ Browse services and products');
        console.log('   ✅ Book appointments (requires Google login)');
        console.log('   ✅ Admin: Manage appointments, services, staff');
        console.log('   ✅ Admin: View analytics and customer data');
        console.log('   ✅ Responsive design on mobile/tablet');
        
        console.log('\n' + '='.repeat(60));
        console.log('Starting server in 3 seconds...');
        
        setTimeout(() => {
            // Start the main application
            require('./server.js');
        }, 3000);

    } catch (error) {
        console.error('❌ Demo setup failed:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down demo server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down demo server...');
    process.exit(0);
});

setupDemo();