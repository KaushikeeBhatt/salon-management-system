// Database seeding script to populate initial data
const db = require('./models');
const SALON_NAME = "Blvd6 Salon";

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Force sync database to recreate tables with correct schema
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await db.sequelize.sync({ force: true });
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        console.log('✅ Database synced with force: true');

        // 1. Create Salon record
        console.log('🏢 Creating salon record...');
        
        // First, create Address, Email, Phone records for the salon
        const salonAddress = await db.Address.findOrCreate({
            where: { address1: '123 Main Street' },
            defaults: {
                address1: '123 Main Street',
                address2: 'Suite 100',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210'
            }
        });

        const salonEmail = await db.Email.findOrCreate({
            where: { email: 'contact@blvd6salon.com' },
            defaults: {
                email: 'contact@blvd6salon.com'
            }
        });

        const salonPhone = await db.Phone.findOrCreate({
            where: { mobile: '(555) 123-4567' },
            defaults: {
                mobile: '(555) 123-4567',
                home: '(555) 123-4568'
            }
        });

        // Create the salon record
        const salon = await db.Salon.findOrCreate({
            where: { name: SALON_NAME },
            defaults: {
                name: SALON_NAME,
                password: 'admin123', // You should hash this in production
                description: 'Premium beauty salon offering high-quality hair, nail, and beauty services.',
                photo: 'salon-main.jpg',
                AddressId: salonAddress[0].id,
                EmailId: salonEmail[0].id,
                PhoneId: salonPhone[0].id
            }
        });

        console.log('✅ Salon record created/exists');

        // 2. Create Sample Services
        console.log('💇 Creating sample services...');
        
        const services = [
            {
                name: 'Haircut & Style',
                duration: 60,
                member_price: 45.00,
                nonmember_price: 55.00,
                cost: 20.00,
                photo: 'haircut.jpg',
                description: 'Professional haircut with styling'
            },
            {
                name: 'Hair Coloring',
                duration: 120,
                member_price: 85.00,
                nonmember_price: 100.00,
                cost: 35.00,
                photo: 'coloring.jpg',
                description: 'Full hair coloring service with premium products'
            },
            {
                name: 'Blowout',
                duration: 45,
                member_price: 35.00,
                nonmember_price: 45.00,
                cost: 15.00,
                photo: 'blowout.jpg',
                description: 'Professional blowout styling'
            },
            {
                name: 'Deep Conditioning Treatment',
                duration: 30,
                member_price: 25.00,
                nonmember_price: 35.00,
                cost: 10.00,
                photo: 'treatment.jpg',
                description: 'Intensive hair conditioning treatment'
            },
            {
                name: 'Wedding Updo',
                duration: 90,
                member_price: 75.00,
                nonmember_price: 95.00,
                cost: 30.00,
                photo: 'updo.jpg',
                description: 'Elegant updo styling for special occasions'
            }
        ];

        for (const service of services) {
            await db.Service.findOrCreate({
                where: { name: service.name },
                defaults: service
            });
        }

        console.log('✅ Sample services created');

        // 3. Create Sample Products
        console.log('🧴 Creating sample products...');
        
        const products = [
            {
                brand: 'Olaplex',
                name: 'No. 3 Hair Perfector',
                description: 'At-home treatment to strengthen and repair damaged hair',
                size: '100ml',
                price: 28.00,
                stock_quantity: 25,
                cost: 15.00,
                vendor: 'Beauty Supply Co',
                photo: 'olaplex-no3.jpg'
            },
            {
                brand: 'Kerastase',
                name: 'Nutritive Shampoo',
                description: 'Nourishing shampoo for dry hair',
                size: '250ml',
                price: 35.00,
                stock_quantity: 15,
                cost: 20.00,
                vendor: 'Professional Hair Products',
                photo: 'kerastase-shampoo.jpg'
            },
            {
                brand: 'Moroccanoil',
                name: 'Treatment Oil',
                description: 'Argan oil treatment for all hair types',
                size: '100ml',
                price: 44.00,
                stock_quantity: 30,
                cost: 25.00,
                vendor: 'Beauty Supply Co',
                photo: 'moroccanoil.jpg'
            },
            {
                brand: 'Redken',
                name: 'All Soft Conditioner',
                description: 'Moisturizing conditioner for dry, brittle hair',
                size: '300ml',
                price: 24.00,
                stock_quantity: 20,
                cost: 12.00,
                vendor: 'Professional Hair Products',
                photo: 'redken-conditioner.jpg'
            },
            {
                brand: 'Paul Mitchell',
                name: 'Tea Tree Shampoo',
                description: 'Invigorating shampoo with tea tree oil',
                size: '300ml',
                price: 18.50,
                stock_quantity: 40,
                cost: 9.00,
                vendor: 'Hair Care Wholesale',
                photo: 'paul-mitchell-shampoo.jpg'
            }
        ];

        for (const product of products) {
            await db.Product.findOrCreate({
                where: { brand: product.brand, name: product.name },
                defaults: product
            });
        }

        console.log('✅ Sample products created');

        // 4. Create Sample Staff
        console.log('👩‍💼 Creating sample staff...');
        
        // Create addresses, emails, phones for staff
        const staffData = [
            {
                name: 'Sarah',
                lastname: 'Johnson',
                bio: 'Senior hair stylist with 8 years of experience specializing in color and cuts.',
                station: 'Station 1',
                day: 'Monday-Friday',
                hour: '9:00 AM - 6:00 PM',
                emergency_contact_name: 'Mike Johnson',
                emergency_contact_phone: '(555) 987-6543',
                comment: 'Expert in modern hair techniques',
                email: 'sarah@blvd6salon.com',
                address1: '456 Oak Avenue',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210',
                mobile: '(555) 234-5678'
            },
            {
                name: 'Emily',
                lastname: 'Rodriguez',
                bio: 'Makeup artist and hair stylist specializing in bridal and special event styling.',
                station: 'Station 2',
                day: 'Tuesday-Saturday',
                hour: '10:00 AM - 7:00 PM',
                emergency_contact_name: 'Carlos Rodriguez',
                emergency_contact_phone: '(555) 876-5432',
                comment: 'Bridal specialist',
                email: 'emily@blvd6salon.com',
                address1: '789 Elm Street',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210',
                mobile: '(555) 345-6789'
            }
        ];

        for (const staff of staffData) {
            // Create associated records
            const staffEmail = await db.Email.findOrCreate({
                where: { email: staff.email },
                defaults: { email: staff.email }
            });

            const staffAddress = await db.Address.findOrCreate({
                where: { address1: staff.address1 },
                defaults: {
                    address1: staff.address1,
                    city: staff.city,
                    state: staff.state,
                    zip: staff.zip
                }
            });

            const staffPhone = await db.Phone.findOrCreate({
                where: { mobile: staff.mobile },
                defaults: { mobile: staff.mobile }
            });

            // Create staff record
            await db.Staff.findOrCreate({
                where: { EmailId: staffEmail[0].id },
                defaults: {
                    name: staff.name,
                    lastname: staff.lastname,
                    bio: staff.bio,
                    station: staff.station,
                    day: staff.day,
                    hour: staff.hour,
                    emergency_contact_name: staff.emergency_contact_name,
                    emergency_contact_phone: staff.emergency_contact_phone,
                    comment: staff.comment,
                    EmailId: staffEmail[0].id,
                    AddressId: staffAddress[0].id,
                    PhoneId: staffPhone[0].id
                }
            });
        }

        console.log('✅ Sample staff created');

        // 5. Create Sample Customers
        console.log('👥 Creating sample customers...');
        
        const customersData = [
            {
                name: 'Jessica',
                lastname: 'Williams',
                password: 'customer123',
                gender: 'Female',
                balance: 0,
                lastvisit: new Date('2024-01-15'),
                photo: 'customer1.jpg',
                comment: 'Regular customer, prefers Emily for styling',
                email: 'jessica.williams@email.com',
                address1: '321 Pine Street',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210',
                mobile: '(555) 456-7890'
            },
            {
                name: 'Michael',
                lastname: 'Brown',
                password: 'customer456',
                gender: 'Male',
                balance: 25.00,
                lastvisit: new Date('2024-01-10'),
                photo: 'customer2.jpg',
                comment: 'Prefers short cuts, comes monthly',
                email: 'michael.brown@email.com',
                address1: '654 Maple Drive',
                city: 'Beverly Hills',
                state: 'CA',
                zip: '90210',
                mobile: '(555) 567-8901'
            }
        ];

        for (const customer of customersData) {
            // Create associated records
            const customerEmail = await db.Email.findOrCreate({
                where: { email: customer.email },
                defaults: { email: customer.email }
            });

            const customerAddress = await db.Address.findOrCreate({
                where: { address1: customer.address1 },
                defaults: {
                    address1: customer.address1,
                    city: customer.city,
                    state: customer.state,
                    zip: customer.zip
                }
            });

            const customerPhone = await db.Phone.findOrCreate({
                where: { mobile: customer.mobile },
                defaults: { mobile: customer.mobile }
            });

            // Create customer record
            await db.Customer.findOrCreate({
                where: { EmailId: customerEmail[0].id },
                defaults: {
                    name: customer.name,
                    lastname: customer.lastname,
                    password: customer.password,
                    gender: customer.gender,
                    balance: customer.balance,
                    lastvisit: customer.lastvisit,
                    photo: customer.photo,
                    comment: customer.comment,
                    EmailId: customerEmail[0].id,
                    AddressId: customerAddress[0].id,
                    PhoneId: customerPhone[0].id
                }
            });
        }

        console.log('✅ Sample customers created');

        // 6. Create Sample Appointments
        console.log('📅 Creating sample appointments...');
        
        const appointmentsData = [
            {
                firstName: 'Jessica',
                lastName: 'Williams',
                email: 'jessica.williams@email.com',
                phone: '(555) 456-7890',
                service: 'Haircut & Style',
                preferredDate: new Date('2024-02-15'),
                preferredTime: 'morning',
                status: 'pending',
                notes: 'Would like to try something new with layers',
                userId: null
            },
            {
                firstName: 'Michael',
                lastName: 'Brown',
                email: 'michael.brown@email.com',
                phone: '(555) 567-8901',
                service: 'Hair Coloring',
                preferredDate: new Date('2024-02-20'),
                preferredTime: 'afternoon',
                status: 'confirmed',
                actualDateTime: new Date('2024-02-20 14:00:00'),
                notes: 'Regular customer - prefers natural highlights',
                userId: null
            },
            {
                firstName: 'Emma',
                lastName: 'Davis',
                email: 'emma.davis@email.com',
                phone: '(555) 678-9012',
                service: 'Blowout',
                preferredDate: new Date('2024-02-18'),
                preferredTime: 'evening',
                status: 'pending',
                notes: 'Special event tomorrow - need elegant styling',
                userId: null
            },
            {
                firstName: 'David',
                lastName: 'Wilson',
                email: 'david.wilson@email.com',
                phone: '(555) 789-0123',
                service: 'Deep Conditioning Treatment',
                preferredDate: new Date('2024-02-12'),
                preferredTime: 'morning',
                status: 'completed',
                actualDateTime: new Date('2024-02-12 10:30:00'),
                notes: 'Damaged hair from over-processing - needs repair',
                userId: null
            },
            {
                firstName: 'Sarah',
                lastName: 'Miller',
                email: 'sarah.miller@email.com',
                phone: '(555) 890-1234',
                service: 'Wedding Updo',
                preferredDate: new Date('2024-02-25'),
                preferredTime: 'morning',
                status: 'pending',
                notes: 'Bridal trial - wedding is next month',
                userId: null
            },
            {
                firstName: 'James',
                lastName: 'Taylor',
                email: 'james.taylor@email.com',
                phone: '(555) 901-2345',
                service: 'Haircut & Style',
                preferredDate: new Date('2024-02-10'),
                preferredTime: 'afternoon',
                status: 'cancelled',
                notes: 'Regular trim - cancelled due to scheduling conflict',
                userId: null
            },
            {
                firstName: 'Lisa',
                lastName: 'Anderson',
                email: 'lisa.anderson@email.com',
                phone: '(555) 012-3456',
                service: 'Hair Coloring',
                preferredDate: new Date('2024-02-22'),
                preferredTime: 'morning',
                status: 'confirmed',
                actualDateTime: new Date('2024-02-22 09:00:00'),
                notes: 'Wanting to go from blonde to brunette',
                userId: null
            },
            {
                firstName: 'Robert',
                lastName: 'Johnson',
                email: 'robert.johnson@email.com',
                phone: '(555) 123-4567',
                service: 'Blowout',
                preferredDate: new Date('2024-02-16'),
                preferredTime: 'afternoon',
                status: 'pending',
                notes: 'Professional headshots tomorrow',
                userId: null
            }
        ];

        for (const appointment of appointmentsData) {
            await db.Appointment.findOrCreate({
                where: {
                    email: appointment.email,
                    preferredDate: appointment.preferredDate
                },
                defaults: appointment
            });
        }

        console.log('✅ Sample appointments created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log('   - 1 Salon record');
        console.log('   - 5 Services');
        console.log('   - 5 Products');
        console.log('   - 2 Staff members');
        console.log('   - 2 Customers');
        console.log('   - 8 Sample appointments');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };