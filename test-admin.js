#!/usr/bin/env node

/**
 * Admin Functionality Test Script for SalonSite
 * This script tests all admin features to ensure they work correctly
 */

const { exec } = require('child_process');
const db = require('./models');

console.log('🧪 Testing Admin Functionality...\n');

// Test database connection and models
async function testDatabase() {
    console.log('📊 Testing Database Connection...');
    
    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Test each model
        const models = ['Salon', 'Service', 'Product', 'Staff', 'Customer', 'Appointment'];
        
        for (const modelName of models) {
            if (db[modelName]) {
                const count = await db[modelName].count();
                console.log(`✅ ${modelName}: ${count} records found`);
            } else {
                console.log(`❌ ${modelName}: Model not found`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test appointment functionality
async function testAppointments() {
    console.log('\n📅 Testing Appointment Functionality...');
    
    try {
        // Test fetching appointments
        const allAppointments = await db.Appointment.findAll();
        console.log(`✅ Can fetch appointments: ${allAppointments.length} found`);
        
        // Test filtering by status
        const pendingAppointments = await db.Appointment.findAll({
            where: { status: 'pending' }
        });
        console.log(`✅ Can filter pending: ${pendingAppointments.length} found`);
        
        const confirmedAppointments = await db.Appointment.findAll({
            where: { status: 'confirmed' }
        });
        console.log(`✅ Can filter confirmed: ${confirmedAppointments.length} found`);
        
        // Test appointment update (if appointments exist)
        if (allAppointments.length > 0) {
            const testAppointment = allAppointments[0];
            const originalStatus = testAppointment.status;
            
            // Test status update
            await testAppointment.update({ status: 'confirmed' });
            console.log('✅ Can update appointment status');
            
            // Restore original status
            await testAppointment.update({ status: originalStatus });
            console.log('✅ Status update rollback successful');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Appointment tests failed:', error.message);
        return false;
    }
}

// Test service management
async function testServices() {
    console.log('\n💇 Testing Service Management...');
    
    try {
        // Test fetching services
        const services = await db.Service.findAll();
        console.log(`✅ Can fetch services: ${services.length} found`);
        
        // Test creating a service
        const testService = await db.Service.create({
            name: 'Test Service',
            duration: 30,
            member_price: 25.00,
            nonmember_price: 30.00,
            cost: 10.00,
            photo: 'test.jpg',
            comment: 'Test service for verification'
        });
        console.log('✅ Can create new service');
        
        // Test updating service
        await testService.update({ name: 'Updated Test Service' });
        console.log('✅ Can update service');
        
        // Test deleting service
        await testService.destroy();
        console.log('✅ Can delete service');
        
        return true;
    } catch (error) {
        console.error('❌ Service tests failed:', error.message);
        return false;
    }
}

// Test staff management
async function testStaff() {
    console.log('\n👥 Testing Staff Management...');
    
    try {
        // Test fetching staff with relationships
        const staff = await db.Staff.findAll({
            include: [db.Address, db.Email, db.Phone]
        });
        console.log(`✅ Can fetch staff with relationships: ${staff.length} found`);
        
        return true;
    } catch (error) {
        console.error('❌ Staff tests failed:', error.message);
        return false;
    }
}

// Test product management
async function testProducts() {
    console.log('\n🧴 Testing Product Management...');
    
    try {
        // Test fetching products
        const products = await db.Product.findAll();
        console.log(`✅ Can fetch products: ${products.length} found`);
        
        return true;
    } catch (error) {
        console.error('❌ Product tests failed:', error.message);
        return false;
    }
}

// Test customer management
async function testCustomers() {
    console.log('\n👤 Testing Customer Management...');
    
    try {
        // Test fetching customers with relationships
        const customers = await db.Customer.findAll({
            include: [db.Address, db.Email, db.Phone]
        });
        console.log(`✅ Can fetch customers with relationships: ${customers.length} found`);
        
        return true;
    } catch (error) {
        console.error('❌ Customer tests failed:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🎯 SalonSite Admin Functionality Test Suite\n');
    
    const results = {};
    
    // Run all tests
    results.database = await testDatabase();
    results.appointments = await testAppointments();
    results.services = await testServices();
    results.staff = await testStaff();
    results.products = await testProducts();
    results.customers = await testCustomers();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Test Results Summary:');
    console.log('='.repeat(50));
    
    let passedTests = 0;
    let totalTests = 0;
    
    for (const [testName, passed] of Object.entries(results)) {
        totalTests++;
        if (passed) {
            passedTests++;
            console.log(`✅ ${testName.charAt(0).toUpperCase() + testName.slice(1)}: PASSED`);
        } else {
            console.log(`❌ ${testName.charAt(0).toUpperCase() + testName.slice(1)}: FAILED`);
        }
    }
    
    console.log('='.repeat(50));
    console.log(`📊 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All admin functionality tests PASSED!');
        console.log('✅ The system is ready for demonstration.');
        
        console.log('\n🚀 Ready to demo:');
        console.log('   • Appointment management (view, filter, update status)');
        console.log('   • Service management (create, read, update, delete)');
        console.log('   • Staff management (view with full details)');
        console.log('   • Product management (inventory view)');
        console.log('   • Customer management (view with relationships)');
        console.log('   • Database integrity and relationships');
        
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.');
        console.log('💡 Consider running `node seedDatabase.js` to reset data.');
    }
    
    console.log('\n🏁 Test completed. You can now start the demo with:');
    console.log('   node start-demo.js');
    
    process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error.message);
    process.exit(1);
});

// Run tests
runTests();