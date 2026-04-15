// Cart Management
let cartCount = 0;
let cartItems = [];
const cartCountElement = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartIcon = document.getElementById('cartIcon');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Dynamic Price Updates
function updateItemTotal(card) {
    const priceElement = card.querySelector('.product-price');
    const quantityInput = card.querySelector('.quantity');
    const totalElement = card.querySelector('.item-total');
    
    const basePrice = parseFloat(priceElement.dataset.price);
    const quantity = parseInt(quantityInput.value);
    const total = (basePrice * quantity).toFixed(2);
    
    totalElement.textContent = total;
}

// Quantity Control Handlers
document.querySelectorAll('.product-card').forEach(card => {
    const quantityInput = card.querySelector('.quantity');
    const minusBtn = card.querySelector('.qty-btn.minus');
    const plusBtn = card.querySelector('.qty-btn.plus');
    
    // Initialize total on page load
    updateItemTotal(card);
    
    // Minus button
    minusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateItemTotal(card);
        }
    });
    
    // Plus button
    plusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
            updateItemTotal(card);
        }
    });
    
    // Direct input change
    quantityInput.addEventListener('input', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        } else if (value > 10) {
            quantityInput.value = 10;
        }
        updateItemTotal(card);
    });
    
    // Add to Cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        const productName = card.querySelector('.product-name').textContent;
        const total = card.querySelector('.item-total').textContent;
        const imageSrc = card.querySelector('img').src;
        
        addToCart(quantity, productName, total, imageSrc);
        
        // Visual feedback
        addToCartBtn.textContent = 'Added!';
        addToCartBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.style.backgroundColor = '';
        }, 1500);
    });
});

// Add to Cart Function
function addToCart(quantity, productName, total, imageSrc) {
    const price = parseFloat(total);
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.name === productName);
    
    if (existingItemIndex > -1) {
        // Update quantity and total for existing item
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].total = (cartItems[existingItemIndex].quantity * 
                                              (cartItems[existingItemIndex].total / 
                                               (cartItems[existingItemIndex].quantity - quantity))).toFixed(2);
    } else {
        // Add new item to cart
        cartItems.push({
            name: productName,
            quantity: quantity,
            total: price.toFixed(2),
            image: imageSrc,
            pricePerUnit: (price / quantity).toFixed(2)
        });
    }
    
    cartCount += quantity;
    updateCartCount();
    saveCartToLocalStorage();
    
    // Show notification
    showNotification(`${quantity} x ${productName} added to cart! Total: ₹${total}`);
}

// Update Cart Count Display
function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Add animation
        cartCountElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Display Cart Items in Modal
function displayCartItems() {
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    checkoutBtn.disabled = false;
    let cartHTML = '';
    let total = 0;
    
    cartItems.forEach((item, index) => {
        total += parseFloat(item.total);
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-top">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.pricePerUnit} each</div>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="decreaseCartQuantity(${index})" title="Decrease quantity">−</button>
                        <span class="cart-qty-display">Qty: ${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="increaseCartQuantity(${index})" title="Increase quantity">+</button>
                    </div>
                    <div>
                        <div class="cart-item-price" style="font-size: 1.1rem; font-weight: bold;">₹${item.total}</div>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = total.toFixed(2);
}

// Remove Item from Cart
function removeFromCart(index) {
    const item = cartItems[index];
    cartCount -= item.quantity;
    cartItems.splice(index, 1);
    
    updateCartCount();
    displayCartItems();
    saveCartToLocalStorage();
    
    showNotification(`${item.name} removed from cart`);
}

// Increase Cart Item Quantity
function increaseCartQuantity(index) {
    const item = cartItems[index];
    const pricePerUnit = parseFloat(item.pricePerUnit);
    
    item.quantity += 1;
    item.total = (pricePerUnit * item.quantity).toFixed(2);
    cartCount += 1;
    
    updateCartCount();
    displayCartItems();
    saveCartToLocalStorage();
}

// Decrease Cart Item Quantity
function decreaseCartQuantity(index) {
    const item = cartItems[index];
    
    if (item.quantity > 1) {
        const pricePerUnit = parseFloat(item.pricePerUnit);
        
        item.quantity -= 1;
        item.total = (pricePerUnit * item.quantity).toFixed(2);
        cartCount -= 1;
        
        updateCartCount();
        displayCartItems();
        saveCartToLocalStorage();
    } else {
        // If quantity is 1, remove the item
        removeFromCart(index);
    }
}

// Clear Cart
function clearCart() {
    if (cartItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cartItems = [];
        cartCount = 0;
        updateCartCount();
        displayCartItems();
        saveCartToLocalStorage();
        showNotification('Cart cleared successfully');
    }
}

// Open Cart Modal
function openCart() {
    displayCartItems();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Cart Modal
function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Open Checkout Modal
function openCheckout() {
    if (cartItems.length === 0) return;
    
    closeCart();
    displayOrderSummary();
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Checkout Modal
function closeCheckout() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Display Order Summary in Checkout
function displayOrderSummary() {
    const orderSummaryContainer = document.getElementById('orderSummary');
    const checkoutTotalElement = document.getElementById('checkoutTotal');
    
    if (!orderSummaryContainer) return;
    
    let summaryHTML = '';
    let total = 0;
    
    cartItems.forEach(item => {
        total += parseFloat(item.total);
        summaryHTML += `
            <div class="order-item">
                <div>
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">Quantity: ${item.quantity}</div>
                </div>
                <div class="order-item-price">₹${item.total}</div>
            </div>
        `;
    });
    
    orderSummaryContainer.innerHTML = summaryHTML;
    checkoutTotalElement.textContent = total.toFixed(2);
}

// Handle Checkout Form Submission
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('emailCheckout').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            items: cartItems,
            total: cartTotalElement.textContent
        };
        
        // Simulate order processing
        showNotification('Processing your order...');
        
        setTimeout(() => {
            showNotification('Order placed successfully! Thank you for your purchase! 🎉');
            
            // Clear cart and close modal
            cartItems = [];
            cartCount = 0;
            updateCartCount();
            saveCartToLocalStorage();
            closeCheckout();
            
            // Reset form
            checkoutForm.reset();
            
            // Log order details (in real app, this would be sent to server)
            console.log('Order Details:', formData);
        }, 2000);
    });
}

// Cart Icon Click Handler
if (cartIcon) {
    cartIcon.addEventListener('click', openCart);
}

// Close Cart Button
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCart);
}

// Clear Cart Button
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
}

// Checkout Button
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
}

// Close Checkout Button
if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', closeCheckout);
}

// Close modals when clicking outside
cartModal?.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeCart();
    }
});

checkoutModal?.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        closeCheckout();
    }
});

// Save Cart to LocalStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartCount', cartCount);
}

// Load Cart from LocalStorage
function loadCartFromLocalStorage() {
    const savedItems = localStorage.getItem('cartItems');
    const savedCount = localStorage.getItem('cartCount');
    
    if (savedItems) {
        cartItems = JSON.parse(savedItems);
    }
    
    if (savedCount) {
        cartCount = parseInt(savedCount);
        updateCartCount();
    }
}

// Notification System
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Login Form Handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate inputs
        if (!email || !password) {
            showLoginNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showLoginNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Password validation (minimum 6 characters)
        if (password.length < 6) {
            showLoginNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Store user info if remember is checked
        if (remember) {
            localStorage.setItem('userEmail', email);
        }
        
        // Simulate login
        showLoginNotification('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
    
    // Pre-fill email if remembered
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('remember').checked = true;
    }
}

// Login Notification System
function showLoginNotification(message, type) {
    const existingNotification = document.querySelector('.login-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sign up link handler
const signupLink = document.getElementById('signupLink');
if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginNotification('Sign up feature coming soon!', 'success');
    });
}

// Social login handlers
const socialButtons = document.querySelectorAll('.social-login');
socialButtons.forEach(button => {
    button.addEventListener('click', () => {
        const provider = button.textContent.includes('Google') ? 'Google' : 'Facebook';
        showLoginNotification(`${provider} login coming soon!`, 'success');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

// Hero CTA button
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Initialize cart from localStorage on page load
loadCartFromLocalStorage();

console.log('TechStore E-commerce site loaded successfully! 🚀');
