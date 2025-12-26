# Trendy Threads - E-Commerce Website

A modern, responsive e-commerce website for a clothing business built with HTML, CSS, vanilla JavaScript, and Firebase.

## Features

### Customer Features
- 🏠 **Homepage** with hero slider, category cards, and featured products
- 🛍️ **Product Listing** with filters (category, size, color, price) and sorting
- 📱 **Responsive Design** - mobile-first approach, works on all devices
- 🔍 **Search Functionality** - search products by name and description
- 👤 **User Authentication** - Email/Password and Google Sign-In
- 🛒 **Shopping Cart** - persistent cart with localStorage
- 💳 **Checkout Process** - complete order placement with Firestore storage
- ⭐ **Product Reviews** - view and add reviews (authenticated users)
- 📧 **Newsletter Subscription** - email collection in Firestore

### Admin Features
- 📊 **Admin Dashboard** - protected admin panel
- ➕ **Product Management** - add, edit, delete products
- 📸 **Image Upload** - upload product images to Firebase Storage
- 📦 **Order Management** - view all customer orders
- 🔐 **Role-Based Access** - admin role verification

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Firebase
  - Authentication (Email/Password + Google)
  - Firestore Database
  - Storage (for images)
- **Hosting:** Firebase Hosting

## Project Structure

```
/
├── index.html              # Homepage
├── products.html           # Product listing page
├── product-detail.html     # Product detail page
├── cart.html              # Shopping cart
├── checkout.html          # Checkout page
├── admin.html             # Admin panel
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication module
│   ├── cart.js            # Cart functionality
│   └── admin.js           # Admin panel logic
├── images/                # Placeholder images
├── firebase.json          # Firebase hosting config
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

1. **Node.js and npm** (for Firebase CLI)
2. **Firebase Account** (free tier is sufficient)
3. **Code Editor** (VS Code recommended)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd E-commerce-Site
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "trendy-threads")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### Step 3: Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method

#### Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (change to production rules later)
4. Choose a location (closest to your users)

#### Enable Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode** (change to production rules later)

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) > Project settings
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Step 5: Configure the Application

Replace the Firebase configuration in **both** files:
- `js/app.js` (around line 3)
- `js/admin.js` (around line 23)

Replace this:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

With your actual Firebase config:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

### Step 6: Test Locally

You can test the site locally using:

**Option 1: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option 2: Python HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

**Option 3: Node.js HTTP Server**
```bash
npx http-server -p 8000
```

### Step 7: Add Sample Products (Admin Panel)

1. Create an admin user:
   - Open the site in browser
   - Click "Account" and register
   - Go to Firebase Console > Firestore Database
   - Find the `users` collection
   - Find your user document
   - Add/change the `role` field to `"admin"`

2. Access admin panel:
   - Navigate to `/admin.html`
   - Add sample products with images

## Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase in your project**
```bash
firebase init
```
- Select **Hosting**
- Choose your Firebase project
- Set public directory to `.` (current directory)
- Configure as single-page app: **No**
- Don't overwrite existing files

4. **Deploy**
```bash
firebase deploy
```

Your site will be live at: `https://your-project.firebaseapp.com`

### Deploy to GitHub Pages (Alternative)

**Note:** With GitHub Pages, Firebase features will work but you need to serve from a repository.

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Enable GitHub Pages**
- Go to repository Settings
- Scroll to "Pages" section
- Set Source to `main` branch
- Set folder to `/` (root)
- Click Save

3. Your site will be live at: `https://username.github.io/repository-name/`

## Firestore Data Structure

### Collections

#### products
```javascript
{
  name: "Classic T-Shirt",
  category: "men", // men, women, unisex, accessories
  price: 29.99,
  salePrice: 24.99,
  onSale: true,
  stock: 50,
  description: "Comfortable cotton t-shirt...",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black", "White", "Blue"],
  images: ["url1", "url2"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### users
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  role: "customer", // customer or admin
  createdAt: Timestamp
}
```

#### orders
```javascript
{
  userId: "user_id",
  userEmail: "user@example.com",
  items: [
    {
      id: "product_id",
      name: "Product Name",
      price: 29.99,
      quantity: 2,
      size: "M",
      color: "Black"
    }
  ],
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "US"
  },
  subtotal: 59.98,
  tax: 5.99,
  total: 65.97,
  status: "pending", // pending, processing, shipped, delivered
  paymentMethod: "card",
  createdAt: Timestamp
}
```

#### reviews
```javascript
{
  productId: "product_id",
  userId: "user_id",
  userName: "John Doe",
  rating: 5,
  title: "Great product!",
  text: "I love this product...",
  createdAt: Timestamp
}
```

#### newsletter
```javascript
{
  email: "user@example.com",
  subscribedAt: Timestamp
}
```

## Security Rules

### Firestore Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - read by all, write by admin only
    match /products/{product} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders - users can read their own orders, admins can read all
    match /orders/{order} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reviews - authenticated users can create, read all
    match /reviews/{review} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Newsletter - anyone can subscribe
    match /newsletter/{email} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if true;
    }
  }
}
```

### Storage Rules (Production)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Customization

### Change Business Name
Search and replace "Trendy Threads" in all HTML files.

### Color Scheme
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #00b894;  /* Change this */
    --dark-gray: #2d3436;      /* Change this */
    --light-gray: #dfe6e9;     /* Change this */
}
```

### Product Images
Replace placeholder Unsplash URLs with your own images or use the admin panel to upload custom images.

## Troubleshooting

### Firebase not loading
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure Firebase services are enabled in console

### Authentication not working
- Check that Email/Password and Google providers are enabled
- Verify authorized domains in Firebase Console

### Images not uploading
- Check Storage rules
- Verify Storage is enabled
- Check file size limits

### Products not displaying
- Check Firestore rules
- Verify products collection exists
- Check browser console for errors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Open an issue on GitHub

## Credits

- Built with Firebase
- Images from Unsplash (placeholders)
- Icons: Unicode emojis

---

**Happy Selling! 🛍️**
