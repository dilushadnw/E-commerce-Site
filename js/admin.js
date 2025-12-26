// Admin Panel Module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc,
    doc, 
    addDoc, 
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase Configuration (same as app.js)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let currentUser = null;
let editingProductId = null;

// Check admin access
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (!user) {
        showAccessDenied();
        return;
    }

    // In a real app, check if user has admin role in Firestore
    // For now, allow any logged-in user to access admin panel
    const isAdmin = await checkAdminStatus(user);
    
    if (isAdmin) {
        showAdminPanel();
        loadProducts();
        loadOrders();
    } else {
        showAccessDenied();
    }
});

// Check if user is admin
async function checkAdminStatus(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            return userDoc.data().role === 'admin';
        }
        // For development: allow any logged-in user
        return true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return true; // For development
    }
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('adminAccess').style.display = 'block';
    document.getElementById('accessDenied').style.display = 'none';
}

// Show access denied
function showAccessDenied() {
    document.getElementById('adminAccess').style.display = 'none';
    document.getElementById('accessDenied').style.display = 'block';
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active states
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Logout
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out');
            }
        });
    }

    // Product form
    setupProductForm();
});

// Load products
async function loadProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading products...</td></tr>';

    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No products found. Add your first product!</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const row = createProductRow(doc.id, product);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading products.</td></tr>';
    }
}

// Create product table row
function createProductRow(id, product) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><img src="${product.images[0] || 'https://via.placeholder.com/60'}" alt="${product.name}"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stock || 0}</td>
        <td>
            <button class="btn btn-secondary btn-sm" onclick="editProduct('${id}')">Edit</button>
            <button class="btn btn-primary btn-sm" onclick="deleteProduct('${id}')">Delete</button>
        </td>
    `;
    return row;
}

// Load orders
async function loadOrders() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading orders...</td></tr>';

    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No orders found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const order = doc.data();
            const row = createOrderRow(doc.id, order);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading orders.</td></tr>';
    }
}

// Create order table row
function createOrderRow(id, order) {
    const row = document.createElement('tr');
    const date = order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A';
    
    row.innerHTML = `
        <td>${id.substring(0, 8)}...</td>
        <td>${order.userEmail}</td>
        <td>${date}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td><span class="badge">${order.status}</span></td>
        <td>
            <button class="btn btn-secondary btn-sm" onclick="viewOrder('${id}')">View</button>
        </td>
    `;
    return row;
}

// Setup product form
function setupProductForm() {
    const form = document.getElementById('productForm');
    const onSaleCheckbox = document.getElementById('productOnSale');
    const saleFields = document.getElementById('saleFields');
    const cancelBtn = document.getElementById('cancelBtn');
    const imageInput = document.getElementById('productImages');

    if (onSaleCheckbox) {
        onSaleCheckbox.addEventListener('change', () => {
            saleFields.style.display = onSaleCheckbox.checked ? 'block' : 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            resetProductForm();
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            previewImages(e.target.files);
        });
    }

    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
}

// Preview images
function previewImages(files) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// Handle product form submit
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    formMessage.textContent = '';

    try {
        // Get form data
        const name = document.getElementById('productName').value;
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const description = document.getElementById('productDescription').value;
        const sizes = document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s);
        const colors = document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c);
        const onSale = document.getElementById('productOnSale').checked;
        const salePrice = onSale ? parseFloat(document.getElementById('productSalePrice').value) : null;

        // Upload images
        const imageFiles = document.getElementById('productImages').files;
        const imageUrls = [];

        if (imageFiles.length > 0) {
            for (let file of imageFiles) {
                const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                await uploadBytes(imageRef, file);
                const url = await getDownloadURL(imageRef);
                imageUrls.push(url);
            }
        }

        // Prepare product data
        const productData = {
            name,
            category,
            price,
            stock,
            description,
            sizes,
            colors,
            onSale,
            salePrice,
            images: imageUrls.length > 0 ? imageUrls : (editingProductId ? undefined : ['https://via.placeholder.com/300']),
            updatedAt: new Date()
        };

        // Add or update product
        if (editingProductId) {
            // Update existing product
            await updateDoc(doc(db, 'products', editingProductId), productData);
            formMessage.textContent = 'Product updated successfully!';
        } else {
            // Add new product
            productData.createdAt = new Date();
            await addDoc(collection(db, 'products'), productData);
            formMessage.textContent = 'Product added successfully!';
        }

        formMessage.className = 'form-message success';
        
        // Reset form and reload products
        setTimeout(() => {
            resetProductForm();
            loadProducts();
            // Switch to products tab
            document.querySelector('[data-tab="products"]').click();
        }, 1500);

    } catch (error) {
        console.error('Error saving product:', error);
        formMessage.textContent = 'Error saving product: ' + error.message;
        formMessage.className = 'form-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingProductId ? 'Update Product' : 'Add Product';
    }
}

// Reset product form
function resetProductForm() {
    const form = document.getElementById('productForm');
    form.reset();
    editingProductId = null;
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('saleFields').style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('formMessage').textContent = '';
}

// Edit product
window.editProduct = async function(id) {
    editingProductId = id;
    
    try {
        const docSnap = await getDoc(doc(db, 'products', id));
        
        if (!docSnap.exists()) {
            alert('Product not found');
            return;
        }

        const product = docSnap.data();

        // Fill form
        document.getElementById('productId').value = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productSizes').value = product.sizes ? product.sizes.join(', ') : '';
        document.getElementById('productColors').value = product.colors ? product.colors.join(', ') : '';
        document.getElementById('productOnSale').checked = product.onSale || false;
        
        if (product.onSale && product.salePrice) {
            document.getElementById('saleFields').style.display = 'block';
            document.getElementById('productSalePrice').value = product.salePrice;
        }

        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('submitBtn').textContent = 'Update Product';

        // Switch to add-product tab
        document.querySelector('[data-tab="add-product"]').click();
        
        // Scroll to form
        document.getElementById('add-product-tab').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product');
    }
};

// Delete product
window.deleteProduct = async function(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, 'products', id));
        alert('Product deleted successfully');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
};

// View order
window.viewOrder = async function(id) {
    try {
        const docSnap = await getDoc(doc(db, 'orders', id));
        
        if (!docSnap.exists()) {
            alert('Order not found');
            return;
        }

        const order = docSnap.data();
        const modal = document.getElementById('orderModal');
        const details = document.getElementById('orderDetails');

        let itemsHTML = '<h3>Items:</h3><ul>';
        order.items.forEach(item => {
            itemsHTML += `<li>${item.name} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</li>`;
        });
        itemsHTML += '</ul>';

        details.innerHTML = `
            <p><strong>Order ID:</strong> ${id}</p>
            <p><strong>Customer:</strong> ${order.userEmail}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt.toDate()).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            ${itemsHTML}
            <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <h3>Shipping Address:</h3>
            <p>
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}
            </p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        `;

        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading order:', error);
        alert('Error loading order');
    }
};

// Close order modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('orderModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }
    }
});
