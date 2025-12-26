// Cart Module
import { getCart, saveCart, updateCartCount } from './app.js';

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'cart.html') {
        loadCartPage();
    }
});

// Load cart page
function loadCartPage() {
    const cart = getCart();
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cart.length === 0) {
        cartItems.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }

    cartItems.style.display = 'block';
    emptyCart.style.display = 'none';
    renderCartItems(cart);
    updateCartSummary(cart);

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

// Render cart items
function renderCartItems(cart) {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-meta">
                    ${item.size ? `Size: ${item.size}` : ''}
                    ${item.color ? ` | Color: ${item.color}` : ''}
                </div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="quantity-selector">
                    <div class="quantity-controls">
                        <button type="button" onclick="updateQuantity(${index}, -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" readonly>
                        <button type="button" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price" style="font-size: 1.25rem;">$${itemTotal.toFixed(2)}</div>
                <span class="remove-item" onclick="removeFromCart(${index})">Remove</span>
            </div>
        `;
        
        container.appendChild(cartItem);
    });
}

// Update cart summary
function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.getElementById('summaryItemCount').textContent = itemCount;
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
}

// Update quantity
window.updateQuantity = function(index, change) {
    const cart = getCart();
    
    if (!cart[index]) return;
    
    cart[index].quantity += change;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    saveCart(cart);
    loadCartPage();
    updateCartCount();
};

// Remove from cart
window.removeFromCart = function(index) {
    const cart = getCart();
    
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        cart.splice(index, 1);
        saveCart(cart);
        loadCartPage();
        updateCartCount();
    }
};
