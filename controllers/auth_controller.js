const express = require('express');
const router = express.Router();
const { getAuthUrl, getUserFromCode, verifyGoogleToken } = require('../config/google-auth');
const db = require('../models');

// Google Auth Routes

// Initiate Google OAuth
router.get('/google', (req, res) => {
    try {
        console.log('🔄 Initiating Google OAuth...');
        const authUrl = getAuthUrl();
        
        // Store admin request in session
        if (req.query.admin === 'true') {
            req.session.requestingAdmin = true;
        }
        if (req.query.staff === 'true') {
            req.session.requestingStaff = true;
        }
        
        console.log('✅ Redirecting to Google OAuth URL');
        res.redirect(authUrl);
    } catch (error) {
        console.error('❌ Error initiating Google OAuth:', error);
        res.redirect('/dashboard?error=oauth_init_failed');
    }
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
    const { code, error } = req.query;
    
    console.log('🔄 Google OAuth callback received');
    console.log('Code present:', !!code);
    console.log('Error:', error);
    
    if (error) {
        console.error('❌ Google OAuth error:', error);
        return res.redirect('/dashboard?error=auth_failed');
    }
    
    if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect('/dashboard?error=no_code');
    }
    
    try {
        console.log('🔄 Processing authorization code...');
        const result = await getUserFromCode(code);
        
        if (result.success) {
            console.log('✅ Successfully got user from Google:', result.user.email);
            
            // Find or create user in database
            const userData = await findOrCreateUser(result.user);
            
            if (!userData) {
                console.error('❌ Failed to create/find user in database');
                return res.redirect('/dashboard?error=user_creation_failed');
            }
            
            // Check if user was requesting admin access
            const requestingAdmin = req.session.requestingAdmin;
            const requestingStaff = req.session.requestingStaff;
            
            // Clear request flags
            delete req.session.requestingAdmin;
            delete req.session.requestingStaff;
            
            // Regenerate session to ensure a clean state
            req.session.regenerate((regenerateErr) => {
                if (regenerateErr) {
                    console.error('❌ Error regenerating session:', regenerateErr);
                    return res.redirect('/dashboard?error=session_regenerate_failed');
                }
                
                console.log('✅ Session regenerated successfully');
                
                // Store user info in session
                req.session.user = userData;
                req.session.isAuthenticated = true;
                
                console.log('🔍 Before session save - Session data:', {
                    sessionId: req.sessionID,
                    isAuthenticated: req.session.isAuthenticated,
                    userId: req.session.user?.id,
                    userEmail: req.session.user?.email,
                    sessionKeys: Object.keys(req.session)
                });
                
                // Explicitly save session before redirect to ensure it's persisted
                req.session.save((err) => {
                    if (err) {
                        console.error('❌ Error saving session:', err);
                        return res.redirect('/dashboard?error=session_save_failed');
                    }
                    
                    console.log('✅ Session saved successfully for user:', userData.email);
                    console.log('🔍 Session ID:', req.sessionID);
                    console.log('🔍 Session data after save:', {
                        isAuthenticated: req.session.isAuthenticated,
                        userId: req.session.user?.id,
                        userEmail: req.session.user?.email,
                        sessionKeys: Object.keys(req.session),
                        cookie: req.session.cookie
                    });
                    
                    // Update last login
                    db.User.update(
                        { lastLogin: new Date() },
                        { where: { id: userData.id } }
                    ).then(() => {
                        console.log('✅ User authenticated successfully:', userData.email, 'Role:', userData.role);
                        
                        // Add a small delay to ensure session is fully persisted across all processes
                        setTimeout(() => {
                            // Redirect based on role and request
                            if (requestingAdmin) {
                                if (userData.role === 'admin') {
                                    res.redirect('/admin?auth=success');
                                } else {
                                    res.redirect('/dashboard?error=admin_access_denied');
                                }
                            } else if (requestingStaff) {
                                if (userData.role === 'admin' || userData.role === 'staff') {
                                    res.redirect('/admin?auth=success');
                                } else {
                                    res.redirect('/dashboard?error=staff_access_denied');
                                }
                            } else {
                                // Regular user login
                                res.redirect('/dashboard?auth=success');
                            }
                        }, 300); // Small delay to ensure session persistence
                    }).catch(updateError => {
                        console.error('⚠️ Error updating last login (non-critical):', updateError);
                        // Still redirect even if last login update fails, but with delay
                        setTimeout(() => {
                            if (requestingAdmin) {
                                if (userData.role === 'admin') {
                                    res.redirect('/admin?auth=success');
                                } else {
                                    res.redirect('/dashboard?error=admin_access_denied');
                                }
                            } else if (requestingStaff) {
                                if (userData.role === 'admin' || userData.role === 'staff') {
                                    res.redirect('/admin?auth=success');
                                } else {
                                    res.redirect('/dashboard?error=staff_access_denied');
                                }
                            } else {
                                // Regular user login
                                res.redirect('/dashboard?auth=success');
                            }
                        }, 300); // Small delay to ensure session persistence
                    });
                });
            });
        } else {
            console.error('❌ Failed to get user info from Google:', result.error);
            res.redirect('/dashboard?error=auth_failed&details=' + encodeURIComponent(result.error));
        }
    } catch (error) {
        console.error('❌ Error in Google callback:', error);
        res.redirect('/dashboard?error=server_error&details=' + encodeURIComponent(error.message));
    }
});

// Find or create user in database
async function findOrCreateUser(googleUser) {
    try {
        let user = await db.User.findOne({
            where: { googleId: googleUser.id }
        });
        
        if (!user) {
            // Check if user exists by email
            user = await db.User.findOne({
                where: { email: googleUser.email }
            });
            
            if (user) {
                // Link Google account to existing user
                await user.update({
                    googleId: googleUser.id,
                    picture: googleUser.picture,
                    emailVerified: googleUser.verified
                });
            } else {
                // Create new user
                user = await db.User.create({
                    googleId: googleUser.id,
                    email: googleUser.email,
                    name: googleUser.name,
                    firstName: googleUser.name.split(' ')[0],
                    lastName: googleUser.name.split(' ').slice(1).join(' '),
                    picture: googleUser.picture,
                    role: determineUserRole(googleUser.email),
                    emailVerified: googleUser.verified,
                    isActive: true
                });
            }
        } else {
            // Update existing user info
            await user.update({
                name: googleUser.name,
                picture: googleUser.picture,
                emailVerified: googleUser.verified,
                role: determineUserRole(googleUser.email) // Always update the role on login
            });
        }
        
        return user.toJSON();
    } catch (error) {
        console.error('Error finding/creating user:', error);
        return null;
    }
}

// Determine user role based on email or other criteria
function determineUserRole(email) {
    // Get admin and staff emails from environment variables
    const adminEmails = process.env.ADMIN_EMAILS ? 
        process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
        ['admin@blvd6salon.com', 'owner@blvd6salon.com', 'kaushikeebhatt4@gmail.com'];
    
    const staffEmails = process.env.STAFF_EMAILS ? 
        process.env.STAFF_EMAILS.split(',').map(e => e.trim().toLowerCase()) : 
        ['staff@blvd6salon.com', 'stylist@blvd6salon.com'];
    
    const userEmail = email.toLowerCase();
    
    if (adminEmails.includes(userEmail)) {
        return 'admin';
    } else if (staffEmails.includes(userEmail)) {
        return 'staff';
    } else {
        return 'customer';
    }
}

// Verify token (for AJAX requests)
router.post('/verify-token', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'No token provided'
        });
    }
    
    try {
        const result = await verifyGoogleToken(token);
        
        if (result.success) {
            const userData = await findOrCreateUser(result.user);
            
            if (userData) {
                // Store user info in session
                req.session.user = userData;
                req.session.isAuthenticated = true;
                
                res.json({
                    success: true,
                    user: userData
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to create user'
                });
            }
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Get current user
router.get('/user', (req, res) => {
    const sessionExists = !!req.session;
    const sessionId = req.sessionID;
    const isAuthenticated = req.session?.isAuthenticated;
    const hasUser = !!req.session?.user;
    
    console.log('🔍 /auth/user endpoint called');
    console.log('🔍 Session exists:', sessionExists);
    console.log('🔍 Session ID:', sessionId);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 Has user:', hasUser);
    
    if (hasUser) {
        console.log('🔍 User email:', req.session.user.email);
        console.log('🔍 User role:', req.session.user.role);
    }
    
    if (req.session.isAuthenticated && req.session.user) {
        console.log('✅ Returning authenticated user:', req.session.user.email);
        res.json({
            success: true,
            user: req.session.user,
            isAuthenticated: true,
            sessionID: req.sessionID,
            debug: {
                sessionExists: sessionExists,
                sessionId: sessionId,
                isAuthenticated: isAuthenticated,
                hasUser: hasUser,
                userEmail: req.session.user.email,
                timestamp: new Date().toISOString()
            }
        });
    } else {
        console.log('❌ User not authenticated or session missing');
        res.json({
            success: false,
            isAuthenticated: false,
            debug: {
                sessionExists: sessionExists,
                sessionId: sessionId,
                isAuthenticated: isAuthenticated,
                hasUser: hasUser,
                sessionData: req.session ? {
                    keys: Object.keys(req.session),
                    cookie: req.session.cookie
                } : null,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    console.log('🔄 Logout request received for user:', req.session?.user?.email || 'unknown');
    
    if (!req.session) {
        console.log('⚠️ No session found during logout');
        return res.json({
            success: true,
            message: 'Already logged out'
        });
    }
    
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Error destroying session during logout:', err);
            return res.status(500).json({
                success: false,
                error: 'Failed to logout: ' + err.message
            });
        }
        
        console.log('✅ Session destroyed successfully');
        
        // Clear session cookie with proper options
        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        console.log('✅ Session cookie cleared');
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Admin role management routes
router.post('/admin/promote-user', async (req, res) => {
    // Only allow admins to promote users
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    const { userId, role } = req.body;
    
    if (!['customer', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid role'
        });
    }
    
    try {
        await db.User.update(
            { role: role },
            { where: { id: userId } }
        );
        
        res.json({
            success: true,
            message: `User role updated to ${role}`
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user role'
        });
    }
});

module.exports = {
    router
};
