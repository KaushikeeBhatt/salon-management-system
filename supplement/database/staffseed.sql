USE salon_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate tables in the correct order
TRUNCATE TABLE staff_services;
TRUNCATE TABLE staffs;
TRUNCATE TABLE emails;
TRUNCATE TABLE addresses;
TRUNCATE TABLE phones;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Seed for Marianne
INSERT IGNORE INTO emails (email, createdAt, updatedAt) 
VALUES ("marianne@test.com", NOW(), NOW());

INSERT IGNORE INTO addresses (address1, city, state, zip, createdAt, updatedAt) 
VALUES ("marianne test address", "Sherman Oaks", "CA", "91403", NOW(), NOW());

INSERT IGNORE INTO phones (mobile, createdAt, updatedAt) 
VALUES ("m777777777", NOW(), NOW());

-- Get IDs
SET @marianne_email_id = (SELECT id FROM emails WHERE email = "marianne@test.com" LIMIT 1);
SET @marianne_address_id = (SELECT id FROM addresses WHERE address1 = "marianne test address" AND city = "Sherman Oaks" LIMIT 1);
SET @marianne_phone_id = (SELECT id FROM phones WHERE mobile = "m777777777" LIMIT 1);

-- Insert Marianne's staff record
INSERT IGNORE INTO staffs (
    name, lastname, bio, station, day, hour, 
    emergency_contact_name, emergency_contact_phone,
    photo, comment, createdAt, updatedAt,
    AddressId, EmailId, PhoneId
) VALUES (
    "Marianne", "Rimawi", 
    "Marianne has been a hairstylist for over 20 years...", 
    "Station 1", "Mon-Fri", "9am-5pm",
    "Emergency Contact", "8005551212",
    "", "", NOW(), NOW(),
    @marianne_address_id, @marianne_email_id, @marianne_phone_id
);

-- Seed for Christopher Rey
INSERT IGNORE INTO emails (email, createdAt, updatedAt) 
VALUES ("chris@test.com", NOW(), NOW());

INSERT IGNORE INTO addresses (address1, city, state, zip, createdAt, updatedAt) 
VALUES ("chris test address", "Sherman Oaks", "CA", "91403", NOW(), NOW());

INSERT IGNORE INTO phones (mobile, createdAt, updatedAt) 
VALUES ("c777777777", NOW(), NOW());

-- Get IDs
SET @chris_email_id = (SELECT id FROM emails WHERE email = "chris@test.com" LIMIT 1);
SET @chris_address_id = (SELECT id FROM addresses WHERE address1 = "chris test address" AND city = "Sherman Oaks" LIMIT 1);
SET @chris_phone_id = (SELECT id FROM phones WHERE mobile = "c777777777" LIMIT 1);

-- Insert Christopher's staff record
INSERT IGNORE INTO staffs (
    name, lastname, bio, station, day, hour, 
    emergency_contact_name, emergency_contact_phone,
    photo, comment, createdAt, updatedAt,
    AddressId, EmailId, PhoneId
) VALUES (
    "Christopher", "Rey", 
    "Christopher Rey has over 15 years experience in the hair industry...", 
    "Station 2", "Mon-Sat", "10am-6pm",
    "Emergency Contact", "8005551213",
    "", "", NOW(), NOW(),
    @chris_address_id, @chris_email_id, @chris_phone_id
);

-- View the data
SELECT * FROM staffs;
SELECT * FROM addresses;
SELECT * FROM phones;
SELECT * FROM emails;