/**
 * Main JavaScript for Salon Website
 * Handles UI interactions, animations, and dynamic content
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref && linkHref.includes(currentPage)) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'btn btn-primary btn-back-to-top position-fixed';
    backToTopButton.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000; border-radius: 50%; width: 50px; height: 50px; display: none;';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // Add animation to service cards on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .team-member, .testimonial');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('fade-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load

    // Initialize appointment booking functionality
    initializeAppointmentBooking();
    
    // Set minimum date for appointment booking
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
    
    // Initialize global functions
    window.updateUIVisibility = updateUIVisibility;
});

// Global function to update UI visibility based on user role
function updateUIVisibility(user) {
    console.log('🔧 Updating UI visibility for user:', user ? user.email : 'guest', 'Role:', user ? user.role : 'none');
    
    const publicNav = document.getElementById('public-ul');
    const adminNav = document.getElementById('admin-ul');
    const customerDashboardLink = document.getElementById('customer-dashboard-link');
    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    
    if (!user) {
        // Guest user
        if (publicNav) publicNav.classList.remove('d-none');
        if (adminNav) adminNav.classList.add('d-none');
        if (customerDashboardLink) customerDashboardLink.style.display = 'block';
        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
        console.log('✅ UI configured for guest user');
        return;
    }
    
    // Show appropriate navigation based on role
    if (user.role === 'admin' || user.role === 'staff') {
        console.log('🔧 Configuring admin/staff UI...');
        // Show admin navigation
        if (publicNav) {
            publicNav.classList.add('d-none');
            publicNav.style.display = 'none';
        }
        if (adminNav) {
            adminNav.classList.remove('d-none');
            adminNav.style.display = 'flex';
            adminNav.style.setProperty('display', 'flex', 'important');
        }
        if (customerDashboardLink) customerDashboardLink.style.display = 'none';
        if (adminDashboardLink) adminDashboardLink.style.display = 'block';
        console.log('✅ Admin/Staff UI configured');
    } else {
        console.log('🔧 Configuring customer UI...');
        // Show customer navigation
        if (publicNav) {
            publicNav.classList.remove('d-none');
            publicNav.style.display = 'flex';
        }
        if (adminNav) {
            adminNav.classList.add('d-none');
            adminNav.style.display = 'none';
        }
        if (customerDashboardLink) customerDashboardLink.style.display = 'block';
        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
        console.log('✅ Customer UI configured');
    }
}

// Appointment Booking Functionality
function initializeAppointmentBooking() {
    const appointmentForm = document.getElementById('appointmentForm');
    if (!appointmentForm) return;

    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        const formData = new FormData(this);
        const appointmentData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            preferredDate: formData.get('preferredDate'),
            preferredTime: formData.get('preferredTime'),
            notes: formData.get('notes')
        };

        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending Request...';

            // Send appointment request
            const response = await fetch('/appointment-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Include session cookies
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                // Success
                const result = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Appointment Request Sent!',
                    html: `
                        <p>We'll contact you within 24 hours to confirm your appointment.</p>
                        <div class="mt-3 p-3 bg-light rounded">
                            <strong>Confirmation Code:</strong><br>
                            <code class="fs-5">${result.confirmationCode}</code>
                        </div>
                        <p class="mt-2 text-muted">Save this code to check your appointment status</p>
                    `,
                    confirmButtonColor: '#6366f1',
                    confirmButtonText: 'Check Status',
                    showCancelButton: true,
                    cancelButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/appointment-lookup';
                    }
                });
                
                // Reset form and close modal
                this.reset();
                this.classList.remove('was-validated');
                const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
                modal.hide();
            } else {
                // Handle different types of errors
                const errorData = await response.json().catch(() => null);
                
                if (response.status === 401 && errorData?.requiresLogin) {
                    // Authentication required
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sign In Required',
                        text: 'Please sign in to book an appointment.',
                        confirmButtonColor: '#6366f1',
                        confirmButtonText: 'Sign In',
                        showCancelButton: true,
                        cancelButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Redirect to Google OAuth
                            window.location.href = '/auth/google';
                        }
                    });
                } else {
                    // Other errors
                    throw new Error(errorData?.message || 'Failed to send appointment request');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again or call us directly.',
                confirmButtonColor: '#8a4fff'
            });
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navbarCollapse = document.getElementById('navbarNav');
    navbarCollapse.classList.toggle('show');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (navbarCollapse && navbarToggler && 
        !navbarCollapse.contains(event.target) && 
        !navbarToggler.contains(event.target)) {
        navbarCollapse.classList.remove('show');
    }
});

// Service selection helper
function selectService(serviceName) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        const option = Array.from(serviceSelect.options).find(opt => 
            opt.text.toLowerCase().includes(serviceName.toLowerCase())
        );
        if (option) {
            serviceSelect.value = option.value;
        }
        
        // Switch to booking form tab
        const formTab = document.getElementById('form-tab');
        if (formTab) {
            formTab.click();
        }
        
        // Open modal
        const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        modal.show();
    }
}

// Enhanced contact form handling
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate required fields before submission
        const requiredFields = ['firstNameContact', 'lastNameContact', 'emailContact', 'reasonContact', 'addlContact'];
        const missingFields = requiredFields.filter(field => {
            const input = this.querySelector(`[name="${field}"]`);
            return !input || !input.value.trim();
        });
        
        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all required fields.',
                confirmButtonColor: '#8a4fff'
            });
            return;
        }
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            
            const response = await fetch('/leads', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: 'Thank you for contacting us. We\'ll get back to you soon!',
                    confirmButtonColor: '#8a4fff'
                });
                this.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to send message. Please try again.',
                confirmButtonColor: '#8a4fff'
            });
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', handleContactForm);

// Utility function to format phone numbers
function formatPhoneNumber(input) {
    const phoneNumber = input.value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) {
        input.value = phoneNumber;
    } else if (phoneNumberLength < 7) {
        input.value = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
        input.value = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
}

// Add phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

/**
 * Global function to update UI visibility based on user role
 * Called from nav.handlebars after authentication status changes
 * @param {Object|null} user - User object with role property, or null for guest
 */
window.updateUIVisibility = function(user) {
    console.log('🔄 Updating UI visibility for user:', user);
    
    const publicNav = document.getElementById('public-ul');
    const adminNav = document.getElementById('admin-ul');
    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    const customerDashboardLink = document.getElementById('customer-dashboard-link');
    
    if (user && (user.role === 'admin' || user.role === 'staff')) {
        // Show admin navigation
        if (adminNav) {
            adminNav.classList.remove('d-none');
            adminNav.style.display = 'flex';
            adminNav.style.setProperty('display', 'flex', 'important');
            console.log('✅ Admin navigation shown');
        }
        if (publicNav) {
            publicNav.classList.add('d-none');
            publicNav.style.display = 'none';
            console.log('✅ Public navigation hidden');
        }
        
        // Show admin dashboard link in dropdown
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'block';
        }
        if (customerDashboardLink) {
            customerDashboardLink.style.display = 'none';
        }
        
        console.log('✅ Admin UI mode activated');
    } else {
        // Show public navigation
        if (publicNav) {
            publicNav.classList.remove('d-none');
            console.log('✅ Public navigation shown');
        }
        if (adminNav) {
            adminNav.classList.add('d-none');
            console.log('✅ Admin navigation hidden');
        }
        
        // Show customer dashboard link in dropdown
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'none';
        }
        if (customerDashboardLink) {
            customerDashboardLink.style.display = user ? 'block' : 'none';
        }
        
        console.log('✅ Public UI mode activated');
    }
    
    // Update any admin-only elements on the page
    const adminOnlyElements = document.querySelectorAll('[data-admin-only]');
    adminOnlyElements.forEach(element => {
        if (user && (user.role === 'admin' || user.role === 'staff')) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Update any authenticated-only elements
    const authOnlyElements = document.querySelectorAll('[data-auth-only]');
    authOnlyElements.forEach(element => {
        element.style.display = user ? '' : 'none';
    });
};
