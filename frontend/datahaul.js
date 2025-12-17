const API_BASE = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000/api' : 'https://smartfarm-api.onrender.com/api';

let currentUser = null;
let cart = [];
let products = [];

// Auth Functions
async function sendOTP() {
    const phone = document.getElementById('phoneInput').value;
    if (phone.length !== 10) {
        alert('Please enter valid 10-digit phone number');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/send-otp/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({phone_number: phone})
        });
        
        if (response.ok) {
            document.getElementById('phoneForm').classList.add('hidden');
            document.getElementById('otpForm').classList.remove('hidden');
            localStorage.setItem('tempPhone', phone);
        }
    } catch (error) {
        alert('Error sending OTP. Please try again.');
    }
}

async function verifyOTP() {
    const phone = localStorage.getItem('tempPhone');
    const otp = document.getElementById('otpInput').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/verify-otp/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({phone_number: phone, otp: otp})
        });
        
        const data = await response.json();
        if (data.success) {
            currentUser = data.data.user;
            localStorage.setItem('token', data.data.tokens.access);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            if (currentUser.role === 'supplier') {
                showSupplierDashboard();
            } else if (!currentUser.location) {
                showScreen('onboardingScreen');
            } else {
                loadHome();
            }
        }
    } catch (error) {
        alert('Invalid OTP. Please try again.');
    }
}

function resendOTP() {
    sendOTP();
}

// Onboarding
document.getElementById('onboardingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const farmSize = document.getElementById('farmSize').value;
    const crops = Array.from(document.querySelectorAll('input[name="crop"]:checked')).map(c => c.value);
    
    try {
        const response = await fetch(`${API_BASE}/auth/me/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({location, farm_size: farmSize, crops})
        });
        
        if (response.ok) {
            loadHome();
        }
    } catch (error) {
        alert('Error saving profile');
    }
});

// Home
async function loadHome() {
    showScreen('homeScreen');
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userName').textContent = `👨🌾 ${user.first_name || 'Farmer'}`;
    document.getElementById('userLocation').textContent = `📍 ${user.location || 'Ghana'}`;
    
    await loadProducts();
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/suppliers/products/`);
        const data = await response.json();
        products = data.success ? data.data.results : [];
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products');
    }
}

function displayProducts(items) {
    const container = document.getElementById('productList');
    container.innerHTML = items.map(p => `
        <div class="product-card" onclick="showProduct(${p.id})">
            <div class="product-header">
                <div class="product-name">${p.name}</div>
                ${p.supplier.is_verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
            </div>
            <div class="supplier-name">${p.supplier.name}</div>
            <div class="price-row">
                <div class="price">GHS ${p.price}</div>
                ${p.market_average_price ? `<div class="price-compare">GHS ${(p.price - p.market_average_price).toFixed(2)} vs market</div>` : ''}
            </div>
            <button class="add-to-cart" onclick="addToCart(${p.id}, event)">Add to Cart</button>
        </div>
    `).join('');
}

function filterCategory(cat) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    displayProducts(filtered);
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

function showProduct(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('productDetail').innerHTML = `
        <div class="product-card">
            <h2>${product.name}</h2>
            <p class="supplier-name">${product.supplier.name}</p>
            <div class="price">GHS ${product.price}</div>
            ${product.market_average_price ? `<p>Market Average: GHS ${product.market_average_price}</p>` : ''}
            <p>${product.description || 'Quality farm input'}</p>
            <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;
    showScreen('productScreen');
}

// Cart
function addToCart(productId, event) {
    if (event) event.stopPropagation();
    const product = products.find(p => p.id === productId);
    const existing = cart.find(c => c.id === productId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    updateCartBadge();
    alert('Added to cart!');
}

function updateCartBadge() {
    document.getElementById('cartBadge').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function showCart() {
    const container = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <div>
                <div class="product-name">${item.name}</div>
                <div>GHS ${item.price} x ${item.quantity}</div>
            </div>
            <button onclick="removeFromCart(${idx})">🗑️</button>
        </div>
    `).join('');
    
    document.getElementById('cartTotal').textContent = `GHS ${total.toFixed(2)}`;
    showScreen('cartScreen');
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartBadge();
    showCart();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    showScreen('checkoutScreen');
}

document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderData = {
        items: cart.map(item => ({
            product: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        delivery_location: document.getElementById('deliveryLocation').value,
        phone_number: document.getElementById('deliveryPhone').value,
        payment_method: document.querySelector('input[name="payment"]:checked').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            cart = [];
            updateCartBadge();
            alert('Order placed successfully!');
            showOrders();
        }
    } catch (error) {
        alert('Error placing order');
    }
});

// Orders
async function showOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders/`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        const data = await response.json();
        const orders = data.success ? data.data.results : [];
        
        document.getElementById('ordersList').innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>Order #${order.id}</div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div>Total: GHS ${order.total_amount}</div>
                <div>${order.items.length} items</div>
                <div>${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
        `).join('');
        
        showScreen('ordersScreen');
    } catch (error) {
        console.error('Error loading orders');
    }
}

// Supplier Dashboard
async function showSupplierDashboard() {
    showScreen('supplierScreen');
    
    try {
        const ordersRes = await fetch(`${API_BASE}/orders/`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        const ordersData = await ordersRes.json();
        const orders = ordersData.success ? ordersData.data.results : [];
        
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
        
        document.getElementById('supplierOrders').innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>Order #${order.id} - ${order.farmer_name}</div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div>GHS ${order.total_amount}</div>
                ${order.status === 'pending' ? `<button class="btn-primary" onclick="confirmOrder(${order.id})">Confirm Order</button>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading dashboard');
    }
}

async function confirmOrder(orderId) {
    try {
        await fetch(`${API_BASE}/orders/${orderId}/confirm/`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        showSupplierDashboard();
    } catch (error) {
        alert('Error confirming order');
    }
}

// Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showHome() {
    loadHome();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[0].classList.add('active');
}

function showProfile() {
    alert('Profile settings coming soon!');
}

function logout() {
    localStorage.clear();
    location.reload();
}

// Initialize
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        if (currentUser.role === 'supplier') {
            showSupplierDashboard();
        } else {
            loadHome();
        }
    } else {
        showScreen('authScreen');
    }
});