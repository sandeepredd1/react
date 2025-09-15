// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];

// DOM Elements
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authLinks = document.querySelector('.auth-links');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCartDisplay();
    updateAuthDisplay();
});

// Initialize Application
function initializeApp() {
    // Show home section by default
    showSection('home');
    
    // Update cart count
    updateCartCount();
    
    // Setup navigation
    setupNavigation();
}

// Setup Event Listeners
function setupEventListeners() {
    // Hamburger menu
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
    
    // CTA button
    document.querySelector('.cta-btn').addEventListener('click', () => {
        showSection('men');
    });
    
    // Auth forms
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletter);
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// Navigation Functions
function setupNavigation() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
    });
    
    // Handle initial hash
    const initialHash = window.location.hash.substring(1) || 'home';
    showSection(initialHash);
}

function handleNavigation(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        const sectionId = href.substring(1);
        
        // Check if user needs to be logged in for certain sections
        if ((sectionId === 'cart' || sectionId === 'checkout') && !currentUser) {
            showSection('login');
            showNotification('Please log in to access your cart', 'warning');
            return;
        }
        
        showSection(sectionId);
        window.location.hash = sectionId;
        
        // Close mobile menu if open
        navMenu.classList.remove('active');
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Cart Functions
function addToCart(e) {
    if (!currentUser) {
        showSection('login');
        showNotification('Please log in to add items to cart', 'warning');
        return;
    }
    
    const btn = e.target;
    const name = btn.getAttribute('data-name');
    const price = parseFloat(btn.getAttribute('data-price'));
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update displays
    updateCartCount();
    updateCartDisplay();
    
    // Show success message
    showNotification(`${name} added to cart!`, 'success');
    
    // Add animation to button
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '0.00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Simulate checkout process
    showNotification('Processing your order...', 'info');
    
    setTimeout(() => {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
        showNotification(`Order placed successfully! Total: $${total.toFixed(2)}`, 'success');
        showSection('home');
    }, 2000);
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthDisplay();
        showNotification(`Welcome back, ${user.name}!`, 'success');
        showSection('home');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAuthDisplay();
    showNotification(`Welcome, ${name}! Account created successfully.`, 'success');
    showSection('home');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    localStorage.removeItem('cart');
    updateAuthDisplay();
    updateCartCount();
    updateCartDisplay();
    showNotification('Logged out successfully', 'info');
    showSection('home');
}

function updateAuthDisplay() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.textContent = `Logout (${currentUser.name})`;
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Form Handlers
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    // Simulate form submission
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    e.target.reset();
}

function handleNewsletter(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification('Successfully subscribed to newsletter!', 'success');
        e.target.querySelector('input[type="email"]').value = '';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10ac84';
        case 'error': return '#ff4757';
        case 'warning': return '#ffa502';
        case 'info': return '#3742fa';
        default: return '#2f3542';
    }
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.7;
    }
`;
document.head.appendChild(notificationStyles);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
});

// Search functionality (bonus feature)
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search fruits...';
    searchInput.className = 'search-input';
    
    // Add search styles
    searchInput.style.cssText = `
        padding: 0.5rem 1rem;
        border: 2px solid white;
        border-radius: 25px;
        background: rgba(255,255,255,0.2);
        color: white;
        margin-left: 1rem;
    `;
    
    // Add to navbar
    const navContainer = document.querySelector('.nav-container');
    navContainer.appendChild(searchInput);
    
    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.description')?.textContent.toLowerCase() || '';
            
            if (title.includes(query) || description.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = query ? 'none' : 'block';
            }
        });
    });
}

// Initialize search on load
// initializeSearch();

// Performance optimization: Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
// initializeLazyLoading();
