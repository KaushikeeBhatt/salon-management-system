const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'salon_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixPhotoColumn() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');

    console.log('🔄 Modifying photo column from VARCHAR(255) to TEXT...');
    
    // Execute the ALTER TABLE command
    await sequelize.query('ALTER TABLE Products MODIFY COLUMN photo TEXT');
    
    console.log('✅ Photo column modified successfully');
    
    // Verify the change
    console.log('🔍 Verifying column structure...');
    const [results] = await sequelize.query('DESCRIBE Products');
    
    const photoColumn = results.find(col => col.Field === 'photo');
    console.log('📋 Photo column info:', photoColumn);
    
    if (photoColumn && photoColumn.Type.toLowerCase().includes('text')) {
      console.log('✅ Photo column is now TEXT type - can store long URLs');
    } else {
      console.log('❌ Photo column type may not have changed properly');
    }
    
  } catch (error) {
    console.error('❌ Error fixing photo column:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the fix
fixPhotoColumn();