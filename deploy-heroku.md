# Heroku Deployment Guide

## Prerequisites
1. Verify your Heroku account at https://heroku.com/verify
2. Add payment method (free tier available)

## Deployment Steps

### 1. Create App and Database
```bash
# Create your app (choose a unique name)
heroku create your-salon-app-name

# Add MySQL database
heroku addons:create cleardb:ignite

# Get database connection string
heroku config:get CLEARDB_DATABASE_URL
# Example output: mysql://username:password@hostname:port/database_name
```

### 2. Configure Environment Variables
```bash
# Set Node.js environment
heroku config:set NODE_ENV=production

# Database configuration (extract from CLEARDB_DATABASE_URL)
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=your-db-name
heroku config:set DB_PORT=3306
heroku config:set DB_DIALECT=mysql

# Session configuration
heroku config:set SESSION_SECRET=your-super-secure-random-string-here

# Google OAuth (use your actual credentials)
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin configuration
heroku config:set ADMIN_EMAILS=your-admin-email@gmail.com
heroku config:set STAFF_EMAILS=staff@yourdomain.com

# Server configuration
heroku config:set PORT=3000

# Google OAuth redirect URI (replace with your app URL)
heroku config:set GOOGLE_REDIRECT_URI=https://your-app-name.herokuapp.com/auth/google/callback
```

### 3. Deploy Application
```bash
# Add Procfile to git if not already added
git add Procfile

# Commit changes
git commit -m "Add Procfile for Heroku deployment"

# Deploy to Heroku
git push heroku main

# Run database migrations/seeding (optional)
heroku run npm run seed

# Open your app
heroku open
```

### 4. Monitor and Debug
```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Access database (if needed)
heroku run bash
```

## Post-Deployment Setup

### Update Google OAuth
1. Go to Google Cloud Console
2. Navigate to OAuth 2.0 Client IDs
3. Add your Heroku URL to authorized redirect URIs:
   - `https://your-app-name.herokuapp.com/auth/google/callback`

### Database Setup
The app will automatically create tables on first run, but you may want to:
```bash
# Seed with initial data
heroku run npm run seed

# Or run admin test
heroku run npm run test-admin
```

## Troubleshooting

### Common Issues:
1. **Database connection errors**: Check DB environment variables
2. **Google OAuth errors**: Verify redirect URIs in Google Console
3. **Session errors**: Ensure SESSION_SECRET is set
4. **Admin access issues**: Verify ADMIN_EMAILS configuration

### View Configuration:
```bash
heroku config
```

### Restart App:
```bash
heroku restart
```

## App URL
Your app will be available at: `https://your-app-name.herokuapp.com`