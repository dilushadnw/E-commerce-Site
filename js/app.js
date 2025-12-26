// Firebase Configuration
// Replace this with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Global state
let currentUser = null;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUIForAuth(user);
    updateCartCount();
});

// Update UI based on auth state
function updateUIForAuth(user) {
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        if (user) {
            accountLink.textContent = 'Profile';
            accountLink.href = '#';
            accountLink.onclick = (e) => {
                e.preventDefault();
                showProfile();
            };
        } else {
            accountLink.textContent = 'Account';
            accountLink.href = '#';
            accountLink.onclick = (e) => {
                e.preventDefault();
                openAuthModal();
            };
        }
    }
}

// Open auth modal
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize modal close buttons
document.addEventListener('DOMContentLoaded', () => {
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.onclick = function() {
            this.closest('.modal').classList.remove('active');
        };
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    };

    // Initialize mobile navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Initialize search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Initialize page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomePage();
    } else if (currentPage === 'products.html') {
        initProductsPage();
    } else if (currentPage === 'product-detail.html') {
        initProductDetailPage();
    } else if (currentPage === 'checkout.html') {
        initCheckoutPage();
    }
});

// Home Page Initialization
function initHomePage() {
    // Hero slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (slides.length > 0 && dotsContainer) {
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
            dot.onclick = () => goToSlide(index);
            dotsContainer.appendChild(dot);
        });

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            document.querySelectorAll('.slider-dot').forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            document.querySelectorAll('.slider-dot')[currentSlide].classList.add('active');
        }

        function goToSlide(n) {
            showSlide(n);
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        // Auto slide
        setInterval(nextSlide, 5000);

        // Navigation buttons
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        
        if (prevBtn) prevBtn.onclick = prevSlide;
        if (nextBtn) nextBtn.onclick = nextSlide;
    }

    // Load featured products
    loadFeaturedProducts();

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            const message = document.getElementById('newsletterMessage');

            try {
                await addDoc(collection(db, 'newsletter'), {
                    email: email,
                    subscribedAt: new Date()
                });

                message.textContent = 'Thank you for subscribing!';
                message.className = 'newsletter-message success';
                newsletterForm.reset();
            } catch (error) {
                console.error('Error subscribing:', error);
                message.textContent = 'Error subscribing. Please try again.';
                message.className = 'newsletter-message error';
            }
        });
    }
}

// Load featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="loading">No products available yet. Please add products from the admin panel.</p>';
            return;
        }

        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productCard = createProductCard(doc.id, product);
            container.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="loading">Error loading products. Please check Firebase configuration.</p>';
    }
}

// Create product card element
function createProductCard(id, product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => window.location.href = `product-detail.html?id=${id}`;

    const badge = product.onSale ? `<div class="product-badge">SALE</div>` : '';
    const priceHTML = product.onSale && product.salePrice
        ? `<div class="product-price sale">
               <span class="sale-price">$${product.salePrice.toFixed(2)}</span>
               <span class="original">$${product.price.toFixed(2)}</span>
           </div>`
        : `<div class="product-price">$${product.price.toFixed(2)}</div>`;

    card.innerHTML = `
        <div class="product-image">
            ${badge}
            <img src="${product.images[0] || 'https://via.placeholder.com/300'}" alt="${product.name}">
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            ${priceHTML}
        </div>
    `;

    return card;
}

// Products Page Initialization
function initProductsPage() {
    loadProducts();
    setupFilters();
}

// Load products with filters
async function loadProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading products...</div>';

    try {
        const urlParams = new URLSearchParams(window.location.search);
        let q = collection(db, 'products');

        // Apply filters from URL
        const category = urlParams.get('category');
        const sale = urlParams.get('sale');
        const search = urlParams.get('search');

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageTitle) {
            if (category) {
                pageTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + "'s Collection";
            } else if (sale) {
                pageTitle.textContent = 'Sale Items';
            } else if (search) {
                pageTitle.textContent = `Search Results for "${search}"`;
            }
        }

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="loading">No products available.</p>';
            return;
        }

        let products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        // Apply client-side filters
        if (category) {
            products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (sale === 'true') {
            products = products.filter(p => p.onSale === true);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) || 
                p.description.toLowerCase().includes(searchLower)
            );
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="loading">Error loading products.</p>';
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsCount) {
        resultsCount.textContent = products.length;
    }

    if (products.length === 0) {
        container.innerHTML = '<p class="loading">No products found matching your criteria.</p>';
        return;
    }

    container.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product.id, product);
        container.appendChild(productCard);
    });
}

// Setup filters
function setupFilters() {
    // Category filters
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Size, color filters
    const checkboxFilters = document.querySelectorAll('input[type="checkbox"][name="size"], input[type="checkbox"][name="color"]');
    checkboxFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Price filter
    const applyPriceBtn = document.getElementById('applyPrice');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', applyFilters);
    }

    // Sale filter
    const saleFilter = document.getElementById('saleOnly');
    if (saleFilter) {
        saleFilter.addEventListener('change', applyFilters);
    }

    // Sort
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }

    // Clear filters
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
}

// Apply filters
function applyFilters() {
    // This is a simplified version - in production, you'd want more sophisticated filtering
    loadProducts();
}

// Product Detail Page Initialization
function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
        loadProductReviews(productId);
    } else {
        document.getElementById('productContent').innerHTML = '<p class="loading">Product not found.</p>';
    }
}

// Load product detail
async function loadProductDetail(productId) {
    const container = document.getElementById('productContent');
    if (!container) return;

    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            container.innerHTML = '<p class="loading">Product not found.</p>';
            return;
        }

        const product = docSnap.data();
        renderProductDetail(productId, product);
    } catch (error) {
        console.error('Error loading product:', error);
        container.innerHTML = '<p class="loading">Error loading product.</p>';
    }
}

// Render product detail
function renderProductDetail(productId, product) {
    const container = document.getElementById('productContent');
    const breadcrumb = document.getElementById('breadcrumbProduct');
    
    if (breadcrumb) {
        breadcrumb.textContent = product.name;
    }

    const sizes = product.sizes ? product.sizes.map(s => 
        `<div class="size-option" data-size="${s}">${s}</div>`
    ).join('') : '';

    const colors = product.colors ? product.colors.map(c => 
        `<div class="color-option" data-color="${c}">${c}</div>`
    ).join('') : '';

    const thumbnails = product.images ? product.images.map((img, idx) =>
        `<div class="thumbnail ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <img src="${img}" alt="${product.name}">
         </div>`
    ).join('') : '';

    const priceHTML = product.onSale && product.salePrice
        ? `<div class="product-price-detail">
               $${product.salePrice.toFixed(2)}
               <span class="original" style="text-decoration: line-through; color: #636e72; font-size: 1.5rem; margin-left: 1rem;">$${product.price.toFixed(2)}</span>
           </div>`
        : `<div class="product-price-detail">$${product.price.toFixed(2)}</div>`;

    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <img src="${product.images[0] || 'https://via.placeholder.com/500'}" alt="${product.name}" id="mainImage">
            </div>
            <div class="thumbnail-gallery">
                ${thumbnails}
            </div>
        </div>
        <div class="product-details">
            <h1>${product.name}</h1>
            <div class="product-rating">
                <div class="stars">★★★★★</div>
                <span>(0 reviews)</span>
            </div>
            ${priceHTML}
            <p class="product-description">${product.description}</p>
            
            <div class="product-options">
                ${sizes ? `
                <div class="option-group">
                    <h4>Size:</h4>
                    <div class="size-options">${sizes}</div>
                </div>` : ''}
                
                ${colors ? `
                <div class="option-group">
                    <h4>Color:</h4>
                    <div class="color-options">${colors}</div>
                </div>` : ''}
            </div>
            
            <div class="quantity-selector">
                <h4>Quantity:</h4>
                <div class="quantity-controls">
                    <button type="button" id="decreaseQty">-</button>
                    <input type="number" id="quantity" value="1" min="1" max="${product.stock || 10}">
                    <button type="button" id="increaseQty">+</button>
                </div>
            </div>
            
            <button class="btn btn-primary btn-block" id="addToCartBtn">Add to Cart</button>
        </div>
    `;

    // Setup thumbnail click handlers
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = thumb.dataset.index;
            document.getElementById('mainImage').src = product.images[index];
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Setup size/color selection
    document.querySelectorAll('.size-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // Quantity controls
    const qtyInput = document.getElementById('quantity');
    document.getElementById('decreaseQty')?.addEventListener('click', () => {
        if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    });
    document.getElementById('increaseQty')?.addEventListener('click', () => {
        if (qtyInput.value < qtyInput.max) qtyInput.value = parseInt(qtyInput.value) + 1;
    });

    // Add to cart
    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
        const selectedSize = document.querySelector('.size-option.selected')?.dataset.size;
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
        const quantity = parseInt(qtyInput.value);

        addToCart(productId, product, quantity, selectedSize, selectedColor);
    });
}

// Add to cart
function addToCart(productId, product, quantity, size, color) {
    const cart = getCart();
    
    const cartItem = {
        id: productId,
        name: product.name,
        price: product.onSale && product.salePrice ? product.salePrice : product.price,
        image: product.images[0],
        quantity: quantity,
        size: size,
        color: color
    };

    // Check if item already exists
    const existingIndex = cart.findIndex(item => 
        item.id === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart(cart);
    updateCartCount();
    alert('Product added to cart!');
}

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

// Load product reviews
async function loadProductReviews(productId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;

    try {
        const q = query(collection(db, 'reviews'), where('productId', '==', productId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="loading">No reviews yet. Be the first to review!</p>';
            return;
        }

        container.innerHTML = '';
        let totalRating = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const review = doc.data();
            totalRating += review.rating;
            count++;

            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.userName}</span>
                    <span class="review-date">${new Date(review.createdAt.toDate()).toLocaleDateString()}</span>
                </div>
                <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <h4 class="review-title">${review.title}</h4>
                <p class="review-text">${review.text}</p>
            `;
            container.appendChild(reviewCard);
        });

        // Update average rating
        const avgRating = totalRating / count;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        document.getElementById('avgStars').innerHTML = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
        document.getElementById('reviewCount').textContent = count;
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<p class="loading">Error loading reviews.</p>';
    }

    // Show review form if user is logged in
    if (currentUser) {
        document.getElementById('addReviewSection').style.display = 'block';
        setupReviewForm(productId);
    }
}

// Setup review form
function setupReviewForm(productId) {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rating = parseInt(document.querySelector('input[name="rating"]:checked').value);
        const title = document.getElementById('reviewTitle').value;
        const text = document.getElementById('reviewText').value;

        try {
            await addDoc(collection(db, 'reviews'), {
                productId: productId,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                rating: rating,
                title: title,
                text: text,
                createdAt: new Date()
            });

            alert('Review submitted successfully!');
            form.reset();
            loadProductReviews(productId);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        }
    });
}

// Checkout Page Initialization
function initCheckoutPage() {
    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to proceed to checkout.');
        window.location.href = 'index.html';
        return;
    }

    loadCheckoutItems();
    setupCheckoutForm();
}

// Load checkout items
function loadCheckoutItems() {
    const cart = getCart();
    const container = document.getElementById('orderItems');
    
    if (!container) return;

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let subtotal = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <div class="order-item-meta">
                    ${item.size ? `Size: ${item.size}` : ''} 
                    ${item.color ? `| Color: ${item.color}` : ''}
                    | Qty: ${item.quantity}
                </div>
                <div>$${itemTotal.toFixed(2)}</div>
            </div>
        `;
        container.appendChild(orderItem);
    });

    // Update totals
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

// Setup checkout form
function setupCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    // Pre-fill email if user is logged in
    if (currentUser) {
        document.getElementById('email').value = currentUser.email;
    }

    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            const cardDetails = document.getElementById('cardDetails');
            if (method.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await placeOrder();
    });
}

// Place order
async function placeOrder() {
    const cart = getCart();
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: cart,
        shippingAddress: {
            firstName: formData.get('firstName') || document.getElementById('firstName').value,
            lastName: formData.get('lastName') || document.getElementById('lastName').value,
            email: formData.get('email') || document.getElementById('email').value,
            phone: formData.get('phone') || document.getElementById('phone').value,
            address: formData.get('address') || document.getElementById('address').value,
            city: formData.get('city') || document.getElementById('city').value,
            state: formData.get('state') || document.getElementById('state').value,
            zipCode: formData.get('zipCode') || document.getElementById('zipCode').value,
            country: formData.get('country') || document.getElementById('country').value
        },
        paymentMethod: formData.get('payment') || document.querySelector('input[name="payment"]:checked').value,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'pending',
        createdAt: new Date(),
        notes: document.getElementById('orderNotes').value
    };

    try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();

        // Show confirmation
        showOrderConfirmation(docRef.id, total);
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
}

// Show order confirmation
function showOrderConfirmation(orderId, total) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('confirmOrderId').textContent = orderId;
    document.getElementById('confirmTotal').textContent = `$${total.toFixed(2)}`;
    
    modal.classList.add('active');
    
    document.getElementById('viewOrderBtn').href = '#'; // In production, link to order details page
}

// Show profile (simplified)
function showProfile() {
    alert('Profile page coming soon! User: ' + (currentUser.displayName || currentUser.email));
}

// Export for use in other modules
export { app, db, auth, currentUser, getCart, saveCart, updateCartCount, createProductCard };
