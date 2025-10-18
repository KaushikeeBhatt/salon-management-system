var express = require("express");
var router = express.Router();
var db = require("../models");
const { requireAdmin, requireStaff } = require("../middleware/auth");
const { validateProductData, validateServiceData, validateStaffData, validateCustomerData, validateIdParam } = require("../middleware/validation");
const SALON_NAME = "Blvd6 Salon";

// Apply admin authentication to all routes
router.use(requireAdmin);

// Admin Dashboard
router.get("/", async (req, res) => {
    try {
        console.log('📊 Loading admin dashboard for:', req.session.user?.email);
        res.render("adminIndex");
    } catch (error) {
        console.error('❌ Error loading admin dashboard:', error);
        res.status(500).send('Error loading admin dashboard');
    }
});

// Show all products
router.get("/products", async (req, res) => {
    try {
        console.log('📦 Admin products route accessed by:', req.session?.user?.email || 'unknown');
        console.log('🔍 Admin user role:', req.session?.user?.role || 'none');
        
        const data = await db.Product.findAll({
            order: [["brand", "ASC"]]
        });
        
        console.log('\u2705 Products fetched from database:', data.length);
        
        // Convert Sequelize models to plain objects for template
        const plainProducts = data.map((product, index) => {
            const plain = product.toJSON();
            console.log(`🔍 Product ${index + 1} converted:`, {
                id: plain.id,
                brand: plain.brand,
                name: plain.name,
                price: plain.price,
                hasId: !!plain.id,
                idType: typeof plain.id
            });
            return plain;
        });
        
        console.log('📊 Total products processed:', plainProducts.length);
        console.log('📊 Products with IDs:', plainProducts.filter(p => p.id).length);
        
        res.render("adminProducts", { products: plainProducts });
    } catch (error) {
        console.error('❌ Error loading products:', error);
        console.error('❌ Stack trace:', error.stack);
        res.render("adminProducts", { products: [], error: 'Failed to load products' });
    }
});
// Add product in database
router.post("/products/new", validateProductData, async (req, res) => {
    try {
        await db.Product.create({
            brand: req.body.brand,
            name: req.body.name,
            description: req.body.description,
            size: req.body.size,
            price: req.body.price,
            stock_quantity: req.body.stock_quantity,
            cost: req.body.cost,
            vendor: req.body.vendor,
            photo: req.body.photo
        });
        console.log('✅ Product created successfully');
        res.redirect("/admin/products");
    } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ success: false, error: 'Failed to create product' });
    }
});

// Edit product - show update product
router.get("/products/:id/edit", validateIdParam, async (req, res) => {
    try {
        console.log('🔍 Loading product for edit:', req.params.id);
        const data = await db.Product.findOne({
            where: { id: req.params.id }
        });
        if (!data) {
            return res.status(404).send('Product not found');
        }
        
        // Convert to plain object for template
        const productData = data.toJSON();
        console.log('✅ Product data for edit:', {
            id: productData.id,
            brand: productData.brand,
            name: productData.name,
            price: productData.price,
            size: productData.size,
            stock_quantity: productData.stock_quantity,
            cost: productData.cost,
            vendor: productData.vendor,
            photo: productData.photo,
            description: productData.description
        });
        
        res.render("adminProductsEdit", { editproduct: productData });
    } catch (error) {
        console.error('❌ Error loading product for edit:', error);
        res.status(500).send('Error loading product');
    }
});

// Update - update database
router.put("/products/:id", [validateIdParam, validateProductData], async (req, res) => {
    try {
        await db.Product.update(req.body, {
            where: { id: req.params.id }
        });
        console.log('✅ Product updated successfully');
        res.redirect("/admin/products");
    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
});

// Delete product in database
router.delete("/products/:id", async (req, res) => {
    try {
        await db.Product.destroy({
            where: { id: req.params.id }
        });
        console.log('✅ Product deleted successfully');
        res.redirect("/admin/products");
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
});

//service
router.get("/services", async (req, res) => {
    try {
        console.log('✂️ Admin services route accessed by:', req.session?.user?.email || 'unknown');
        console.log('🔍 Admin user role:', req.session?.user?.role || 'none');
        
        const data = await db.Service.findAll({
            order: [["name", "ASC"]]
        });
        
        console.log('\u2705 Services fetched from database:', data.length);
        
        // Convert Sequelize models to plain objects for template
        const plainServices = data.map(service => {
            const plain = service.toJSON();
            console.log(`\ud83d\udd0d Service ${plain.id}: Name="${plain.name}", Duration=${plain.duration}`);
            return plain;
        });
        
        res.render("adminServices", { services: plainServices });
    } catch (error) {
        console.error('❌ Error loading services:', error);
        console.error('❌ Stack trace:', error.stack);
        res.render("adminServices", { services: [], error: 'Failed to load services' });
    }
});
//add service in database
router.post("/services/new", validateServiceData, async (req, res) => {
    try {
        const data = await db.Service.create({
            name: req.body.name,
            duration: req.body.duration,
            member_price: req.body.member_price,
            nonmember_price: req.body.nonmember_price,
            cost: req.body.cost,
            photo: req.body.photo,
            comment: req.body.comment,
        });
        console.log('✅ Service created successfully:', data.id);
        res.redirect("/admin/services");
    } catch (error) {
        console.error('❌ Error creating service:', error);
        res.status(500).json({ success: false, error: 'Failed to create service' });
    }
});
//edit service - show update service
router.get("/services/:id/edit", async (req, res) => {
    try {
        const data = await db.Service.findOne({
            where: { id: req.params.id }
        });
        if (!data) {
            return res.status(404).send('Service not found');
        }
        console.log('✅ Service loaded for edit:', data.id);
        res.render("adminServicesEdit", { editservice: data });
    } catch (error) {
        console.error('❌ Error loading service for edit:', error);
        res.status(500).send('Error loading service');
    }
});
//update - update database
router.put("/services/:id", async (req, res) => {
    try {
        await db.Service.update(req.body, {
            where: { id: req.params.id }
        });
        console.log('✅ Service updated successfully:', req.params.id);
        res.redirect("/admin/services");
    } catch (error) {
        console.error('❌ Error updating service:', error);
        res.status(500).json({ success: false, error: 'Failed to update service' });
    }
})
//delete service in database
router.delete("/services/:id", async (req, res) => {
    try {
        await db.Service.destroy({
            where: { id: req.params.id }
        });
        console.log('✅ Service deleted successfully:', req.params.id);
        res.redirect("/admin/services");
    } catch (error) {
        console.error('❌ Error deleting service:', error);
        res.status(500).json({ success: false, error: 'Failed to delete service' });
    }
});

//saloninfo
//edit
router.get("/salon/edit", async (req, res) => {
    try {
        const data = await db.Salon.findOne({
            where: { name: SALON_NAME },
            include: [db.Address, db.Email, db.Phone]
        });
        if (!data) {
            return res.status(404).send('Salon not found');
        }
        
        // Convert to plain object for proper Handlebars access
        const salonData = data.toJSON();
        console.log('✅ Salon data loaded for edit:', {
            name: salonData.name,
            hasEmail: !!salonData.Email,
            hasPhone: !!salonData.Phone,
            hasAddress: !!salonData.Address
        });
        
        res.render("adminSalonEdit", { editSalon: salonData });
    } catch (error) {
        console.error('❌ Error loading salon for edit:', error);
        res.status(500).send('Error loading salon information');
    }
});
//update - update database
router.put("/salon/update", async (req, res) => {
    try {
        console.log('🔄 Updating salon information...');
        console.log('📊 Request data:', {
            name: req.body.name,
            emailId: req.body.emailId,
            addressId: req.body.addressId,
            phoneId: req.body.phoneId
        });

        // Update Email
        await db.Email.update({
            email: req.body.email
        }, {
            where: { id: req.body.emailId }
        });
        console.log('✅ Email updated');

        // Update Address
        await db.Address.update({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, {
            where: { id: req.body.addressId }
        });
        console.log('✅ Address updated');

        // Update Phone
        await db.Phone.update({
            mobile: req.body.mobile,
            home: req.body.home
        }, {
            where: { id: req.body.phoneId }
        });
        console.log('✅ Phone updated');

        // Update Salon
        await db.Salon.update({
            name: req.body.name,
            password: req.body.password,
            description: req.body.description,
            photo: req.body.photo
        }, {
            where: { name: SALON_NAME }
        });
        console.log('✅ Salon information updated successfully');

        res.redirect("/admin");
    } catch (error) {
        console.error('❌ Error updating salon:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).send('Error updating salon information: ' + error.message);
    }
});

//manage staff
// show all staff
router.get("/staff", async (req, res) => {
    try {
        const data = await db.Staff.findAll({
            order: [["name", "ASC"]],
            include: [db.Address, db.Email, db.Phone]
        });
        console.log('\u2705 Staff loaded:', data.length);
        
        // Convert Sequelize models to plain objects for template
        const plainStaff = data.map(person => {
            const plain = person.toJSON();
            console.log('\ud83d\udd0d Staff converted:', {
                id: plain.id,
                name: plain.name,
                lastname: plain.lastname,
                hasEmail: !!plain.Email,
                hasPhone: !!plain.Phone
            });
            return plain;
        });
        
        res.render("adminStaff", { staff: plainStaff });
    } catch (error) {
        console.error('❌ Error loading staff:', error);
        res.render("adminStaff", { staff: [], error: 'Failed to load staff' });
    }
});
//add staff in database
router.post("/staff/new", (req, res) => {
    var emailId;
    var addressId;
    var phoneId;
    db.Email.create({
        email: req.body.email
    }).then((newEmail) => {
        emailId = newEmail.id;
        return db.Address.create({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        });

    }).then((newAddress) => {
        addressId = newAddress.id;
        return db.Phone.create({
            mobile: req.body.mobile,
            home: req.body.home
        });
    }).then((newPhone) => {
        phoneId = newPhone.id;
        // console.log('adding new customer', 'email:', emailId,
        //     'address:', addressId,
        //     'phone:', phoneId)
        return db.Staff.create({
            name: req.body.name,
            lastname: req.body.lastname,
            bio: req.body.bio,
            station: req.body.station,
            day: req.body.day,
            hour: req.body.hour,
            emergency_contact_name: req.body.emergency_contact_name,
            emergency_contact_phone: req.body.emergency_contact_phone,
            comment: req.body.comment,
            EmailId: emailId,
            AddressId: addressId,
            PhoneId: phoneId
        }, {
                include: [db.Address
                    , db.Email, db.Phone
                ]
            });
    }).then(data => {
        res.redirect("/admin/staff")
        // console.log(data);
        // res.json(data)
    }).catch((error) => {
        res.json(error);
    });
});
//edit staff - show update product
router.get("/staff/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Staff.findOne({
        where: {
            id: req.params.id
        },
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        res.render("adminStaffEdit", { editStaff: data })
    });
});
//update - update database
router.put("/staff/:id", (req, res) => {
    db.Email.update({
        email: req.body.email
    }, {
            where: {
                id: req.body.emailId
            }
        }).then(db.Address.update({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, {
                where: {
                    id: req.body.addressId
                }
            })).then(db.Phone.update({
                mobile: req.body.mobile,
                home: req.body.home
            }, {
                    where: {
                        id: req.body.phoneId
                    }
                })).then(db.Staff.update({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    bio: req.body.bio,
                    station: req.body.station,
                    day: req.body.day,
                    hour: req.body.hour,
                    emergency_contact_name: req.body.emergency_contact_name,
                    emergency_contact_phone: req.body.emergency_contact_phone,
                    photo: req.body.photo,
                    comment: req.body.comment
                }, {
                        where: {
                            id: req.params.id
                        }
                    })).then(data => {
                        res.redirect("/admin/staff");
                    });
})
//delete staff in database
router.delete("/staff/:id", (req, res) => {
    // console.log(req.params.id);
    db.Staff.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/staff")
    });
});

//manage customer
// show all customer
router.get("/customers", async (req, res) => {
    try {
        // Get both legacy customers and OAuth users with customer role
        const [legacyCustomers, oauthUsers] = await Promise.all([
            // Legacy customers from Customer table
            db.Customer.findAll({
                order: [["name", "ASC"]],
                include: [db.Address, db.Email, db.Phone]
            }),
            // OAuth users with customer role from Users table
            db.User.findAll({
                where: { role: 'customer' },
                order: [["name", "ASC"]]
            })
        ]);
        
        console.log('✅ Legacy customers loaded:', legacyCustomers.length);
        console.log('✅ OAuth customers loaded:', oauthUsers.length);
        
        // Convert legacy customers to consistent format
        const plainLegacyCustomers = legacyCustomers.map(customer => {
            const plain = customer.toJSON();
            return {
                id: plain.id,
                name: plain.name,
                lastname: plain.lastname,
                gender: plain.gender,
                lastvisit: plain.lastvisit,
                email: plain.Email ? plain.Email.email : null,
                mobile: plain.Phone ? plain.Phone.mobile : null,
                comment: plain.comment,
                photo: plain.photo,
                type: 'legacy', // Mark as legacy customer
                Address: plain.Address,
                Email: plain.Email,
                Phone: plain.Phone
            };
        });
        
        // Convert OAuth users to consistent format
        const plainOAuthUsers = oauthUsers.map(user => {
            const plain = user.toJSON();
            return {
                id: `oauth_${plain.id}`, // Prefix to distinguish from legacy customers
                name: plain.firstName || plain.name.split(' ')[0] || 'Unknown',
                lastname: plain.lastName || plain.name.split(' ').slice(1).join(' ') || '',
                gender: null, // OAuth users don't have gender
                lastvisit: plain.lastLogin,
                email: plain.email,
                mobile: null, // OAuth users don't have phone by default
                comment: `OAuth User - Registered: ${plain.createdAt}`,
                photo: plain.picture,
                type: 'oauth', // Mark as OAuth user
                originalId: plain.id, // Keep original ID for reference
                Address: null,
                Email: { email: plain.email },
                Phone: null
            };
        });
        
        // Combine both datasets
        const allCustomers = [...plainLegacyCustomers, ...plainOAuthUsers];
        
        console.log('📊 Total customers shown:', allCustomers.length);
        
        res.render("adminCustomers", { 
            customers: allCustomers,
            stats: {
                legacy: plainLegacyCustomers.length,
                oauth: plainOAuthUsers.length,
                total: allCustomers.length
            }
        });
    } catch (error) {
        console.error('❌ Error loading customers:', error);
        res.render("adminCustomers", { customers: [], error: 'Failed to load customers' });
    }
});
//add customer in database
router.post("/customers/new", (req, res) => {
    var emailId;
    var addressId;
    var phoneId;
    db.Email.create({
        email: req.body.email
    }).then((newEmail) => {
        emailId = newEmail.id;
        return db.Address.create({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        });

    }).then((newAddress) => {
        addressId = newAddress.id;
        return db.Phone.create({
            mobile: req.body.mobile,
            home: req.body.home
        });
    }).then((newPhone) => {
        phoneId = newPhone.id;

        // console.log('adding new customer', 'email:', emailId,
        //     'address:', addressId,
        //     'phone:', phoneId)
        return db.Customer.create({
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password,
            gender: req.body.gender,
            lastvisit: req.body.lastvisit,
            photo: req.body.photo,
            comment: req.body.comment,
            EmailId: emailId,
            AddressId: addressId,
            PhoneId: phoneId
        }, {
                include: [db.Address
                    , db.Email, db.Phone
                ]
            });
    }).then(data => {
        res.redirect("/admin/customers")
        // console.log(data);
        // res.json(data)
    }).catch((error) => {
        res.json(error);
    });
});
//edit customers - show update product
router.get("/customers/:id/edit", validateIdParam, async (req, res) => {
    try {
        console.log('🔍 Loading customer for edit:', req.params.id);
        const data = await db.Customer.findOne({
            where: {
                id: req.params.id
            },
            include: [db.Address, db.Email, db.Phone]
        });
        
        if (!data) {
            return res.status(404).send('Customer not found');
        }
        
        // Convert to plain object for template
        const customerData = data.toJSON();
        console.log('✅ Customer loaded for edit:', {
            id: customerData.id,
            name: customerData.name,
            lastname: customerData.lastname,
            email: customerData.Email ? customerData.Email.email : 'No email',
            phone: customerData.Phone ? customerData.Phone.mobile : 'No phone',
            address: customerData.Address ? customerData.Address.address1 : 'No address',
            hasAddress: !!customerData.Address,
            hasEmail: !!customerData.Email,
            hasPhone: !!customerData.Phone,
            addressId: customerData.Address ? customerData.Address.id : null,
            emailId: customerData.Email ? customerData.Email.id : null,
            phoneId: customerData.Phone ? customerData.Phone.id : null
        });
        
        res.render("adminCustomersEdit", { editCustomer: customerData });
    } catch (error) {
        console.error('❌ Error loading customer for edit:', error);
        res.status(500).send('Error loading customer');
    }
});
//update - update database
router.put("/customers/:id", [validateIdParam, validateCustomerData], async (req, res) => {
    try {
        console.log('🔄 Updating customer:', req.params.id);
        
        // Update related tables first
        if (req.body.emailId) {
            await db.Email.update({
                email: req.body.email
            }, {
                where: { id: req.body.emailId }
            });
        }
        
        if (req.body.addressId) {
            await db.Address.update({
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip
            }, {
                where: { id: req.body.addressId }
            });
        }
        
        if (req.body.phoneId) {
            await db.Phone.update({
                mobile: req.body.mobile,
                home: req.body.home
            }, {
                where: { id: req.body.phoneId }
            });
        }
        
        // Update customer
        await db.Customer.update({
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password,
            gender: req.body.gender,
            lastvisit: req.body.lastvisit,
            photo: req.body.photo,
            comment: req.body.comment
        }, {
            where: { id: req.params.id }
        });
        
        console.log('✅ Customer updated successfully');
        res.redirect("/admin/customers");
    } catch (error) {
        console.error('❌ Error updating customer:', error);
        res.status(500).json({ success: false, error: 'Failed to update customer' });
    }
})
//delete staff in database
router.delete("/customers/:id", (req, res) => {
    // console.log(req.params.id);
    db.Customer.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/customers")
    });
});

router.get("/staffservice", async (req, res) => {
    try {
        const allStaff = await db.Staff.findAll();
        const allServices = await db.Service.findAll();
        
        const data = {
            aStaff: allStaff,
            aServices: allServices
        };
        
        res.render("adminStaffService", { data: data });
    } catch (error) {
        console.error('Error loading staff service data:', error);
        res.render("adminStaffService", { data: { aStaff: [], aServices: [] } });
    }
});

// API Routes for Dashboard Stats
router.get("/api/stats/appointments", async (req, res) => {
    try {
        console.log('=== FETCHING APPOINTMENTS COUNT ===');
        
        // Check if Appointment model exists
        if (!db.Appointment) {
            console.log('Appointment model not found, returning 0');
            return res.json({ success: true, count: 0 });
        }
        
        const count = await db.Appointment.count();
        console.log('Appointments count:', count);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting appointment count:', error);
        res.json({ success: false, count: 0, error: error.message });
    }
});

router.get("/api/stats/customers", async (req, res) => {
    try {
        console.log('=== FETCHING CUSTOMERS COUNT ===');
        
        // Check if Customer model exists
        if (!db.Customer) {
            console.log('Customer model not found, returning 0');
            return res.json({ success: true, count: 0 });
        }
        
        const count = await db.Customer.count();
        console.log('Customers count:', count);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting customer count:', error);
        res.json({ success: false, count: 0, error: error.message });
    }
});

router.get("/api/stats/products", async (req, res) => {
    try {
        console.log('=== FETCHING PRODUCTS COUNT ===');
        
        // Check if Product model exists
        if (!db.Product) {
            console.log('Product model not found, returning 0');
            return res.json({ success: true, count: 0 });
        }
        
        const count = await db.Product.count();
        console.log('Products count:', count);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting product count:', error);
        res.json({ success: false, count: 0, error: error.message });
    }
});

router.get("/api/stats/staff", async (req, res) => {
    try {
        console.log('=== FETCHING STAFF COUNT ===');
        
        // Check if Staff model exists
        if (!db.Staff) {
            console.log('Staff model not found, returning 0');
            return res.json({ success: true, count: 0 });
        }
        
        const count = await db.Staff.count();
        console.log('Staff count:', count);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting staff count:', error);
        res.json({ success: false, count: 0, error: error.message });
    }
});

router.get("/api/debug/models", async (req, res) => {
    try {
        const modelInfo = {
            availableModels: Object.keys(db),
            counts: {}
        };
        
        // Try to get counts for each model
        for (const modelName of Object.keys(db)) {
            if (db[modelName] && typeof db[modelName].count === 'function') {
                try {
                    const count = await db[modelName].count();
                    modelInfo.counts[modelName] = count;
                } catch (error) {
                    modelInfo.counts[modelName] = `Error: ${error.message}`;
                }
            }
        }
        
        res.json({ success: true, modelInfo });
    } catch (error) {
        console.error('Error in debug models:', error);
        res.json({ success: false, error: error.message });
    }
});

// Test database connection
router.get("/api/test/db", async (req, res) => {
    try {
        console.log('=== DATABASE CONNECTION TEST ===');
        
        // Test database connection
        await db.sequelize.authenticate();
        console.log('Database connection: OK');
        
        // Test each model
        const results = {};
        
        if (db.Appointment) {
            try {
                const appointmentCount = await db.Appointment.count();
                results.appointments = appointmentCount;
                console.log('Appointments table: OK, count:', appointmentCount);
            } catch (error) {
                results.appointments = `Error: ${error.message}`;
                console.log('Appointments table error:', error.message);
            }
        } else {
            results.appointments = 'Model not found';
        }
        
        if (db.Customer) {
            try {
                const customerCount = await db.Customer.count();
                results.customers = customerCount;
                console.log('Customers table: OK, count:', customerCount);
            } catch (error) {
                results.customers = `Error: ${error.message}`;
                console.log('Customers table error:', error.message);
            }
        } else {
            results.customers = 'Model not found';
        }
        
        if (db.Product) {
            try {
                const productCount = await db.Product.count();
                results.products = productCount;
                console.log('Products table: OK, count:', productCount);
            } catch (error) {
                results.products = `Error: ${error.message}`;
                console.log('Products table error:', error.message);
            }
        } else {
            results.products = 'Model not found';
        }
        
        if (db.Staff) {
            try {
                const staffCount = await db.Staff.count();
                results.staff = staffCount;
                console.log('Staff table: OK, count:', staffCount);
            } catch (error) {
                results.staff = `Error: ${error.message}`;
                console.log('Staff table error:', error.message);
            }
        } else {
            results.staff = 'Model not found';
        }
        
        console.log('===============================');
        
        res.json({
            success: true,
            message: 'Database connection successful',
            results: results,
            availableModels: Object.keys(db).filter(key => 
                key !== 'sequelize' && key !== 'Sequelize'
            )
        });
        
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.json({
            success: false,
            error: error.message,
            message: 'Database connection failed'
        });
    }
});

// Appointments Management Routes
router.get("/appointments", async (req, res) => {
    try {
        console.log('🔍 Admin: Fetching all appointments...');
        const allAppointments = await db.Appointment.findAll({
            order: [['createdAt', 'DESC']],
            raw: true
        });
        
        const pendingAppointments = allAppointments.filter(apt => apt.status === 'pending');
        
        console.log(`📊 Admin: Found ${allAppointments.length} total appointments (${pendingAppointments.length} pending)`);
        
        // Prepare sample data for debugging
        const sampleData = allAppointments.length > 0 ? allAppointments[0] : {};
        
        res.render("adminAppointments", {
            appointments: allAppointments,
            allAppointments,
            pendingAppointments: pendingAppointments.length,
            totalAppointments: allAppointments.length,
            sampleData,
            pendingOnly: pendingAppointments
        });
    } catch (error) {
        console.error('❌ Error loading appointments:', error);
        console.error('Error stack:', error.stack);
        res.render("adminAppointments", { 
            appointments: [],
            allAppointments: [],
            pendingAppointments: 0,
            totalAppointments: 0,
            pendingOnly: []
        });
    }
});

router.get("/appointments/pending", async (req, res) => {
    try {
        const allAppointments = await db.Appointment.findAll({
            order: [['createdAt', 'DESC']],
            raw: true
        });
        
        const pendingAppointments = allAppointments.filter(apt => apt.status === 'pending');
        const sampleData = pendingAppointments.length > 0 ? pendingAppointments[0] : {};
        
        res.render("adminAppointments", { 
            appointments: pendingAppointments,
            allAppointments,
            pendingAppointments: pendingAppointments.length,
            totalAppointments: allAppointments.length,
            sampleData,
            pendingOnly: pendingAppointments,
            filter: 'pending' 
        });
    } catch (error) {
        console.error('❌ Error loading pending appointments:', error);
        res.render("adminAppointments", { 
            appointments: [],
            allAppointments: [],
            pendingAppointments: 0,
            totalAppointments: 0,
            pendingOnly: [],
            filter: 'pending' 
        });
    }
});

router.get("/appointments/:id", async (req, res) => {
    try {
        const appointment = await db.Appointment.findOne({
            where: { id: req.params.id }
        });
        
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        
        res.json({ success: true, appointment });
    } catch (error) {
        console.error('Error loading appointment details:', error);
        res.status(500).json({ success: false, error: 'Failed to load appointment' });
    }
});

router.put("/appointments/:id/status", async (req, res) => {
    try {
        const { status, actualDateTime } = req.body;
        const updateData = { status };
        
        // If confirming appointment, set the actual date/time
        if (status === 'confirmed' && actualDateTime) {
            updateData.actualDateTime = actualDateTime;
        }
        
        await db.Appointment.update(updateData, {
            where: { id: req.params.id }
        });
        
        // Send appropriate message based on status
        let message = 'Appointment status updated';
        if (status === 'confirmed') {
            message = 'Appointment confirmed and booked successfully';
        } else if (status === 'cancelled') {
            message = 'Appointment cancelled';
        } else if (status === 'completed') {
            message = 'Appointment marked as completed';
        }
        
        res.json({ success: true, message });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, message: 'Failed to update appointment' });
    }
});

router.delete("/appointments/:id", async (req, res) => {
    try {
        const result = await db.Appointment.destroy({
            where: { id: req.params.id }
        });
        
        if (result === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        
        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete appointment' });
    }
});

// Duplicate service routes removed - using synchronous versions above

// API endpoint for recent activity
router.get("/api/recent-activity", async (req, res) => {
    try {
        // Get recent appointments (last 10)
        const recentAppointments = await db.Appointment.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        
        // Format activities
        const activities = recentAppointments.map(apt => ({
            icon: apt.status === 'confirmed' ? 'check-circle' : apt.status === 'cancelled' ? 'times-circle' : 'calendar',
            type: apt.status === 'confirmed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'warning',
            message: `${apt.firstName} ${apt.lastName} ${apt.status === 'confirmed' ? 'confirmed' : apt.status === 'cancelled' ? 'cancelled' : 'requested'} appointment for ${apt.service}`,
            createdAt: apt.createdAt
        }));
        
        res.json({ success: true, activities });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.json({ success: false, activities: [] });
    }
});

// Simple test route for appointment functionality
router.get("/test-appointment", (req, res) => {
    res.json({
        message: "Admin access test successful",
        user: req.session.user,
        isAuthenticated: req.session.isAuthenticated,
        timestamp: new Date().toISOString()
    });
});

// Admin test page route
router.get("/test", (req, res) => {
    res.render("adminTest");
});

// Debug route to check current authentication status
router.get("/debug-current", (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated || false,
        user: req.session.user || null,
        sessionID: req.sessionID,
        adminEmails: process.env.ADMIN_EMAILS || 'not set',
        staffEmails: process.env.STAFF_EMAILS || 'not set',
        message: "This shows your current authentication status"
    });
});

// Debug route for admin role check
router.get("/debug-role", (req, res) => {
    const adminEmails = process.env.ADMIN_EMAILS ? 
        process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
        ['admin@blvd6salon.com', 'owner@blvd6salon.com', 'kaushikeebhatt4@gmail.com'];
    
    const staffEmails = process.env.STAFF_EMAILS ? 
        process.env.STAFF_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
        ['staff@blvd6salon.com', 'stylist@blvd6salon.com'];
    
    res.json({
        success: true,
        currentUser: req.session?.user || null,
        isAuthenticated: req.session?.isAuthenticated || false,
        adminEmails: adminEmails,
        staffEmails: staffEmails,
        userRole: req.session?.user?.role || 'none',
        userEmail: req.session?.user?.email || 'none',
        message: 'Role debugging information'
    });
});

// Debug route to check appointments in database
router.get("/debug-appointments", async (req, res) => {
    try {
        const allAppointments = await db.Appointment.findAll({
            order: [['createdAt', 'DESC']],
            raw: true  // Get raw data without Sequelize wrapper
        });
        
        const pendingAppointments = await db.Appointment.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'DESC']],
            raw: true
        });
        
        console.log('\n=== DEBUG APPOINTMENTS ===');
        console.log('Total appointments:', allAppointments.length);
        if (allAppointments.length > 0) {
            console.log('\nFirst appointment raw data:');
            console.log(JSON.stringify(allAppointments[0], null, 2));
        }
        console.log('========================\n');
        
        res.json({
            totalAppointments: allAppointments.length,
            pendingAppointments: pendingAppointments.length,
            allAppointments: allAppointments,
            pendingOnly: pendingAppointments,
            message: "This shows all appointments in the database",
            sampleData: allAppointments[0] || null
        });
    } catch (error) {
        console.error('Error debugging appointments:', error);
        res.status(500).json({ 
            error: 'Failed to debug appointments',
            details: error.message 
        });
    }
});

// Leads/Contact Messages Management
// Show all leads
router.get("/leads", async (req, res) => {
    try {
        const leads = await db.Lead.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        // Calculate stats
        const totalLeads = leads.length;
        const newLeads = leads.filter(lead => lead.status === 'new').length;
        const readLeads = leads.filter(lead => lead.status === 'read').length;
        const resolvedLeads = leads.filter(lead => lead.status === 'resolved').length;
        
        console.log('✅ Leads loaded for admin:', {
            total: totalLeads,
            new: newLeads,
            read: readLeads,
            resolved: resolvedLeads
        });
        
        res.render("adminLeads", { 
            leads: leads,
            totalLeads: totalLeads,
            newLeads: newLeads,
            readLeads: readLeads,
            resolvedLeads: resolvedLeads
        });
    } catch (error) {
        console.error('❌ Error loading leads:', error);
        res.render("adminLeads", { 
            leads: [],
            totalLeads: 0,
            newLeads: 0,
            readLeads: 0,
            resolvedLeads: 0,
            error: 'Failed to load messages'
        });
    }
});

// Mark lead as read
router.put("/leads/:id/read", async (req, res) => {
    try {
        await db.Lead.update(
            { status: 'read' },
            { where: { id: req.params.id } }
        );
        console.log('✅ Lead marked as read:', req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error marking lead as read:', error);
        res.status(500).json({ success: false, error: 'Failed to update message status' });
    }
});

// Mark lead as resolved
router.put("/leads/:id/resolve", async (req, res) => {
    try {
        await db.Lead.update(
            { status: 'resolved' },
            { where: { id: req.params.id } }
        );
        console.log('✅ Lead marked as resolved:', req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error marking lead as resolved:', error);
        res.status(500).json({ success: false, error: 'Failed to update message status' });
    }
});

// Delete lead
router.delete("/leads/:id", async (req, res) => {
    try {
        await db.Lead.destroy({
            where: { id: req.params.id }
        });
        console.log('✅ Lead deleted:', req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error deleting lead:', error);
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
});

module.exports = router;
