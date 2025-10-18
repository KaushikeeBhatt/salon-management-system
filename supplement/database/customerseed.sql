USE salon_db;

-- Insert email if it doesn't exist
INSERT IGNORE INTO emails (email, createdAt, updatedAt) 
VALUES ("emmy@gmail.com", NOW(), NOW());

-- Insert address if it doesn't exist
INSERT IGNORE INTO addresses (address1, address2, city, state, zip, createdAt, updatedAt) 
SELECT "123 test ave", "Suite 6, 222", "Sherman Oaks", "CA", 91403, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM addresses 
    WHERE address1 = "123 test ave" 
    AND city = "Sherman Oaks" 
    AND zip = "91403"
    LIMIT 1
);

-- Insert phone if it doesn't exist
INSERT IGNORE INTO phones (mobile, home, createdAt, updatedAt) 
SELECT "e777777777", "", NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM phones 
    WHERE mobile = "e777777777" 
    LIMIT 1
);

-- Get the IDs
SET @email_id = (SELECT id FROM emails WHERE email = "emmy@gmail.com" LIMIT 1);
SET @address_id = (SELECT id FROM addresses WHERE address1 = "123 test ave" AND city = "Sherman Oaks" LIMIT 1);
SET @phone_id = (SELECT id FROM phones WHERE mobile = "e777777777" LIMIT 1);

-- Insert customer if not exists
INSERT IGNORE INTO customers (
    name, 
    lastname, 
    password, 
    AddressId, 
    EmailId, 
    PhoneId, 
    createdAt, 
    updatedAt
) 
SELECT 
    "Emmy", 
    "Jarzembinski", 
    "password123", 
    @address_id, 
    @email_id, 
    @phone_id, 
    NOW(), 
    NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM customers 
    WHERE EmailId = @email_id 
    LIMIT 1
);

-- View the data
SELECT * FROM customers;
SELECT * FROM addresses;
SELECT * FROM phones;
SELECT * FROM emails;