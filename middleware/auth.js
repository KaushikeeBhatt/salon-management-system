// Authentication middleware for role-based access control

// Check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated && req.session.user) {
        next();
    } else {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // API request
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                redirectUrl: '/auth/google'
            });
        } else {
            // Web request
            return res.redirect('/auth/google');
        }
    }
}

// Check if user has admin role
function requireAdmin(req, res, next) {
    console.log('🔐 Admin middleware check:', {
        path: req.path,
        isAuthenticated: req.session?.isAuthenticated,
        hasUser: !!req.session?.user,
        userRole: req.session?.user?.role,
        userEmail: req.session?.user?.email
    });
    
    if (req.session.isAuthenticated && req.session.user) {
        if (req.session.user.role === 'admin') {
            console.log('✅ Admin access granted for:', req.session.user.email);
            next();
        } else {
            console.log('❌ Admin access denied - insufficient role:', req.session.user.role, 'for user:', req.session.user.email);
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                // API request
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required',
                    userRole: req.session.user.role,
                    message: `Your account role is '${req.session.user.role}'. Admin access is required for this resource.`
                });
            } else {
                // Web request - show error page or redirect
                return res.status(403).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Access Denied</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-5">
                            <div class="row justify-content-center">
                                <div class="col-md-6">
                                    <div class="alert alert-danger">
                                        <h4 class="alert-heading"><i class="fas fa-exclamation-triangle"></i> Access Denied</h4>
                                        <p>You don't have permission to access this admin resource.</p>
                                        <hr>
                                        <p class="mb-0">Your role: <strong>${req.session.user.role}</strong></p>
                                        <p class="mb-0">Required role: <strong>admin</strong></p>
                                        <div class="mt-3">
                                            <a href="/" class="btn btn-primary">Go to Home</a>
                                            <a href="/dashboard" class="btn btn-secondary">Go to Dashboard</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
            }
        }
    } else {
        console.log('❌ Admin access denied - not authenticated');
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // API request
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                redirectUrl: '/auth/google?admin=true',
                message: 'Please sign in with an admin account to access this resource.'
            });
        } else {
            // Web request - redirect to login
            return res.redirect('/auth/google?admin=true');
        }
    }
}

// Check if user has staff role (admin or staff)
function requireStaff(req, res, next) {
    if (req.session.isAuthenticated && req.session.user) {
        if (req.session.user.role === 'admin' || req.session.user.role === 'staff') {
            next();
        } else {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({
                    success: false,
                    error: 'Staff access required'
                });
            } else {
                return res.redirect('/auth/google?staff=true');
            }
        }
    } else {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                redirectUrl: '/auth/google?staff=true'
            });
        } else {
            return res.redirect('/auth/google?staff=true');
        }
    }
}

// Optional authentication - doesn't redirect if not authenticated
function optionalAuth(req, res, next) {
    // Just add user info to request if available
    req.isAuthenticated = req.session.isAuthenticated || false;
    req.user = req.session.user || null;
    next();
}

// Check if user owns the resource or is admin
function requireOwnershipOrAdmin(req, res, next) {
    if (!req.session.isAuthenticated || !req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    const userId = req.params.userId || req.body.userId;
    const currentUser = req.session.user;
    
    if (currentUser.role === 'admin' || currentUser.id === userId) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }
}

// Middleware to set user context for views
function setUserContext(req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
    res.locals.isStaff = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff');
    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireStaff,
    optionalAuth,
    requireOwnershipOrAdmin,
    setUserContext
};
