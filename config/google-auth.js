const { OAuth2Client } = require('google-auth-library');

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Determine redirect URI based on environment
const getRedirectUri = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.PRODUCTION_REDIRECT_URI || 'https://yourdomain.com/auth/google/callback';
    } else {
        // For local development, try different port configurations
        const port = process.env.PORT || 3000;
        return `http://localhost:${port}/auth/google/callback`;
    }
};

// Validate configuration
function validateConfig() {
    const issues = [];
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-client-id')) {
        issues.push('GOOGLE_CLIENT_ID is not properly configured');
    }
    
    if (!GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET.includes('your-client-secret')) {
        issues.push('GOOGLE_CLIENT_SECRET is not properly configured');
    }
    
    if (issues.length > 0) {
        console.error('❌ Google Auth Configuration Issues:');
        issues.forEach(issue => console.error(`  - ${issue}`));
        console.error('Please check your .env file or environment variables');
        return false;
    }
    
    console.log('✅ Google Auth Configuration Valid');
    return true;
}

// Create OAuth2 client
const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    getRedirectUri()
);

// Generate authentication URL
function getAuthUrl() {
    if (!validateConfig()) {
        throw new Error('Google Auth configuration is invalid');
    }
    
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        include_granted_scopes: true
    });

    console.log('🔗 Generated auth URL:', authUrl);
    console.log('📍 Redirect URI:', getRedirectUri());
    
    return authUrl;
}

// Verify Google token
async function verifyGoogleToken(token) {
    try {
        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        return {
            success: true,
            user: {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                verified: payload.email_verified
            }
        };
    } catch (error) {
        console.error('❌ Error verifying Google token:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get user info from authorization code
async function getUserFromCode(code) {
    try {
        console.log('🔄 Getting token from code...');
        console.log('📍 Using redirect URI:', getRedirectUri());
        
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        console.log('✅ User authenticated:', payload.email);
        
        return {
            success: true,
            user: {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                verified: payload.email_verified
            },
            tokens
        };
    } catch (error) {
        console.error('❌ Error getting user from code:', error);
        console.error('📋 Error details:', error.response?.data || error.message);
        
        // Provide more specific error messages
        let userFriendlyError = 'Authentication failed';
        if (error.message.includes('redirect_uri_mismatch')) {
            userFriendlyError = 'Redirect URI mismatch. Please check Google Console configuration.';
        } else if (error.message.includes('invalid_client')) {
            userFriendlyError = 'Invalid client credentials. Please check Google Client ID and Secret.';
        }
        
        return {
            success: false,
            error: userFriendlyError,
            details: error.message
        };
    }
}

// Test configuration function
function testConfiguration() {
    console.log('🧪 Testing Google Auth Configuration...');
    console.log('Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('Client Secret:', GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('Redirect URI:', getRedirectUri());
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    return validateConfig();
}

module.exports = {
    GOOGLE_CLIENT_ID,
    oauth2Client,
    getAuthUrl,
    verifyGoogleToken,
    getUserFromCode,
    getRedirectUri,
    validateConfig,
    testConfiguration
};
