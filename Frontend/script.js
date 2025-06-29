// API Configuration
const API_BASE_URL = 'https://la-concierge-backend.onrender.com';

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mainNav = document.querySelector('.main-nav');
const authButtons = document.querySelector('.auth-buttons');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('show');
    authButtons.classList.toggle('show');
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if(mainNav.classList.contains('show')) {
                mainNav.classList.remove('show');
                authButtons.classList.remove('show');
            }
        }
    });
});

// Service Category Filtering
const categoryBtns = document.querySelectorAll('.category-btn');
const serviceCards = document.querySelectorAll('.service-card');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter services
        const category = btn.dataset.category;
        serviceCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Dashboard Navigation
const dashboardLinks = document.querySelectorAll('.sidebar-links a');
const dashboardSections = document.querySelectorAll('.dashboard-section');

dashboardLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        if(this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        
        // Update active link
        dashboardLinks.forEach(a => a.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding section
        const targetSection = this.getAttribute('href').substring(1);
        dashboardSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetSection).classList.add('active');
    });
});

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('jwtToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }
    
    return response.json();
}

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if(token) {
        // Verify token with backend
        apiRequest('/profile')
            .then(data => {
        loginBtn.textContent = 'Dashboard';
        signupBtn.textContent = 'Logout';
        
        // Update dashboard info if on dashboard
        if (window.location.hash === '#dashboard') {
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('dashboard').style.display = 'block';
                    document.getElementById('dashboardUserName').textContent = data.user.name;
                    document.getElementById('dashboardUserEmail').textContent = data.user.email;
                }
            })
            .catch(error => {
                // Token is invalid, clear it
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userData');
                loginBtn.textContent = 'Login';
                signupBtn.textContent = 'Sign Up';
            });
    }
});

// DOM Elements for modals
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const consultationModal = document.getElementById('consultationModal');
const closeBtns = document.querySelectorAll('.close-modal');
const showSignup = document.getElementById('showSignup');
const consultationHeroBtn = document.getElementById('consultationHeroBtn');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const consultationForm = document.getElementById('consultationForm');

// Show login modal
loginBtn.addEventListener('click', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        // User is logged in, show dashboard
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        dashboard.style.display = 'block';
        window.scrollTo(0, 0);
    } else {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

// Show signup modal
signupBtn.addEventListener('click', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        // Logout
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
        window.location.reload();
    } else {
        signupModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});

// Show consultation modal
consultationHeroBtn.addEventListener('click', (e) => {
    e.preventDefault();
    consultationModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// Show consultation modal from services section
const consultationServicesBtn = document.getElementById('consultationServicesBtn');
if (consultationServicesBtn) {
    consultationServicesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        consultationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Show consultation modal from service cards
const consultationBtns = document.querySelectorAll('.consultation-btn');
consultationBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        consultationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

// Show signup from login modal
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    signupModal.style.display = 'flex';
});

// Close modals
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
        consultationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (e.target === signupModal) {
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (e.target === consultationModal) {
        consultationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store token and user data
        localStorage.setItem('jwtToken', response.access_token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // Close modal and show dashboard
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Update UI
        loginBtn.textContent = 'Dashboard';
        signupBtn.textContent = 'Logout';
        
        // Show dashboard
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        dashboard.style.display = 'block';
        document.getElementById('dashboardUserName').textContent = response.user.name;
        document.getElementById('dashboardUserEmail').textContent = response.user.email;
        
        window.scrollTo(0, 0);
        
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Signup Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, password })
        });
        
        // Store token and user data
        localStorage.setItem('jwtToken', response.access_token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // Close modal and show dashboard
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Update UI
        loginBtn.textContent = 'Dashboard';
        signupBtn.textContent = 'Logout';
        
        // Show dashboard
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        dashboard.style.display = 'block';
        document.getElementById('dashboardUserName').textContent = response.user.name;
        document.getElementById('dashboardUserEmail').textContent = response.user.email;
        
        window.scrollTo(0, 0);
        
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
});

// Consultation Form Submission (stored in localStorage)
consultationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    try {
        // Show loading state
        const submitBtn = consultationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Store in localStorage for demo
        const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
        consultations.push({
            name,
            email,
            phone,
            message,
            date: new Date().toISOString()
        });
        localStorage.setItem('consultations', JSON.stringify(consultations));
        
        // Send to backend
        const response = await apiRequest('/consultation', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, requirements: message })
        });
        
        alert('Consultation booked successfully! We will contact you within 24 hours.');
        consultationForm.reset();
        consultationModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
    } catch (error) {
        alert('Failed to submit consultation request: ' + error.message);
    } finally {
        // Reset button
        const submitBtn = consultationForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Consultation Payment Form
const consultationPaymentForm = document.getElementById('consultationPaymentForm');
if (consultationPaymentForm) {
    consultationPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('consultName').value;
        const email = document.getElementById('consultEmail').value;
        const phone = document.getElementById('consultPhone').value;
        
        try {
            // Show loading state
            const submitBtn = consultationPaymentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Check if payment is completed first
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            const completedPayment = payments.find(p => p.status === 'completed');
            
            if (!completedPayment) {
                alert('Please complete payment first before booking consultation. Click the PayPal button to make payment.');
                return;
            }
            
            // Create consultation with payment confirmation
            const consultationResponse = await apiRequest('/consultation', {
                method: 'POST',
                body: JSON.stringify({ 
                    name, 
                    email, 
                    phone,
                    requirements: 'Consultation booking',
                    consultation_id: completedPayment.consultationId
                })
            });
            
            // Show success message
            alert('Consultation booked successfully! We will contact you within 24 hours.');
            
            // Store consultation in localStorage
            const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
            consultations.push({
                consultationId: consultationResponse.consultation_id,
                name,
                email,
                phone,
                amount: '80.00',
                status: 'completed',
                date: new Date().toISOString()
            });
            localStorage.setItem('consultations', JSON.stringify(consultations));
            
            // Remove the used payment
            const updatedPayments = payments.filter(p => p.consultationId !== completedPayment.consultationId);
            localStorage.setItem('payments', JSON.stringify(updatedPayments));
            
            // Close modal and reset form
            consultationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            consultationPaymentForm.reset();
            
        } catch (error) {
            alert('Failed to book consultation: ' + error.message);
        } finally {
            // Reset button
            const submitBtn = consultationPaymentForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Book Consultation';
            submitBtn.disabled = false;
        }
    });
}

// PayPal Integration
console.log('PayPal SDK loaded:', typeof paypal !== 'undefined');
console.log('PayPal button container exists:', document.getElementById('paypal-button-container'));

if (typeof paypal !== 'undefined') {
    console.log('Initializing PayPal buttons...');
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
        console.log('PayPal container found, rendering button...');
        paypal.Buttons({
            createOrder: async function(data, actions) {
                try {
                    const name = document.getElementById('consultName').value;
                    const email = document.getElementById('consultEmail').value;
                    const phone = document.getElementById('consultPhone').value;
                    
                    if (!name || !email || !phone) {
                        alert('Please fill in all required fields before proceeding with payment.');
                        throw new Error('Missing required fields');
                    }
                    
                    // Create consultation placeholder first
                    const consultationResponse = await apiRequest('/consultation/placeholder', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            name,
                            email,
                            phone,
                            requirements: 'Consultation booking via PayPal'
                        })
                    });
                    
                    // Create PayPal order
                    const paypalResponse = await apiRequest('/paypal/create-order', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            consultation_id: consultationResponse.consultation_id,
                            amount: 80.00,
                            description: 'Le Concierge Consultation Fee'
                        })
                    });
                    
                    // Store consultation data
                    localStorage.setItem('pendingConsultation', JSON.stringify({
                        consultation_id: consultationResponse.consultation_id,
                        name,
                        email,
                        phone
                    }));
                    
                    return paypalResponse.order_id;
                } catch (error) {
                    console.error('Error creating PayPal order:', error);
                    alert('Failed to create payment: ' + error.message);
                    throw error;
                }
            },
            onApprove: async function(data, actions) {
                try {
                    // Capture the payment
                    const captureResponse = await apiRequest('/paypal/capture-payment', {
                        method: 'POST',
                        body: JSON.stringify({ 
                            order_id: data.orderID,
                            consultation_id: JSON.parse(localStorage.getItem('pendingConsultation') || '{}').consultation_id
                        })
                    });
                    
                    // Payment completed successfully
                    alert('Payment completed successfully! You can now book your consultation.');
                    
                    // Store payment in localStorage
                    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
                    payments.push({
                        paymentId: data.orderID,
                        consultationId: captureResponse.consultation_id,
                        amount: '80.00',
                        status: 'completed',
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('payments', JSON.stringify(payments));
                    
                    // Clear pending consultation
                    localStorage.removeItem('pendingConsultation');
                        
                    // Close modal
                    consultationModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                        
                    // Reset form
                    if (consultationPaymentForm) {
                        consultationPaymentForm.reset();
                    }
                    
                } catch (error) {
                    console.error('Error capturing payment:', error);
                    alert('Payment failed: ' + error.message);
                }
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                alert('PayPal payment failed. Please try again.');
            }
        }).render('#paypal-button-container').then(function() {
            console.log('PayPal button rendered successfully');
        }).catch(function(error) {
            console.error('Error rendering PayPal button:', error);
        });
    } else {
        console.error('PayPal button container not found');
    }
} else {
    console.error('PayPal SDK not loaded');
    // Add a fallback button if PayPal doesn't load
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
        paypalContainer.innerHTML = '<button class="btn btn-outline" onclick="alert(\'PayPal is not available. Please try again later.\')">PayPal (Not Available)</button>';
    }
}

// Handle PayPal return from redirect
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const token = urlParams.get('token');
    const payerId = urlParams.get('PayerID');
    
    if (paymentId && token && payerId) {
        // User returned from PayPal
        handlePayPalReturn(paymentId, token, payerId);
    }
});

async function handlePayPalReturn(paymentId, token, payerId) {
    try {
        const pendingConsultation = JSON.parse(localStorage.getItem('pendingConsultation') || '{}');
        
        if (!pendingConsultation.consultation_id) {
            alert('No pending consultation found. Please try booking again.');
            return;
        }
        
        // Capture the payment
        const captureResponse = await apiRequest('/paypal/capture-payment', {
            method: 'POST',
            body: JSON.stringify({ 
                order_id: paymentId,
                consultation_id: pendingConsultation.consultation_id
            })
        });
        
        // Payment completed successfully
        alert('Payment completed successfully! You can now book your consultation.');
        
        // Store payment in localStorage
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push({
            paymentId: paymentId,
            consultationId: captureResponse.consultation_id,
            amount: '80.00',
            status: 'completed',
            date: new Date().toISOString()
        });
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // Clear pending consultation
        localStorage.removeItem('pendingConsultation');
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error('Error handling PayPal return:', error);
        alert('Payment verification failed: ' + error.message);
    }
}

// Account Settings Form
const accountSettingsForm = document.getElementById('accountSettingsForm');
if (accountSettingsForm) {
    accountSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('accountName').value;
        const email = document.getElementById('accountEmail').value;
        const phone = document.getElementById('accountPhone').value;
        const password = document.getElementById('accountPassword').value;
        const confirmPassword = document.getElementById('accountConfirm').value;
        
        if (password && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const updateData = { name, email, phone };
            if (password) {
                updateData.password = password;
            }
            
            const response = await apiRequest('/profile', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            // Update localStorage
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            // Update dashboard display
            document.getElementById('dashboardUserName').textContent = response.user.name;
            document.getElementById('dashboardUserEmail').textContent = response.user.email;
            
            alert('Profile updated successfully!');
            
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    });
}

// Load user data into account settings form
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) {
        document.getElementById('accountName').value = userData.name;
        document.getElementById('accountEmail').value = userData.email;
        document.getElementById('accountPhone').value = userData.phone;
    }
}

// Load user data when dashboard is shown
document.addEventListener('DOMContentLoaded', loadUserData);
