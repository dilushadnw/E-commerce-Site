# Quick Start Guide

## 🚀 Get Your E-Commerce Site Running in 5 Minutes

### Step 1: Set Up Firebase (3 minutes)

1. **Create a Firebase project:**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it (e.g., "trendy-threads")
   - Disable Google Analytics (optional, for faster setup)

2. **Enable required services:**
   - **Authentication:** Click "Authentication" → "Get started" → Enable "Email/Password" and "Google"
   - **Firestore:** Click "Firestore Database" → "Create database" → Start in "test mode"
   - **Storage:** Click "Storage" → "Get started" → Start in "test mode"

3. **Get your config:**
   - Click the gear icon ⚙️ → "Project settings"
   - Scroll to "Your apps" → Click Web icon `</>`
   - Copy the `firebaseConfig` object

### Step 2: Configure the Code (1 minute)

1. **Update Firebase config** in TWO files:
   - Open `js/app.js` (line 3-10)
   - Open `js/admin.js` (line 23-30)
   
2. **Replace the placeholder config** with your actual config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
   };
   ```

### Step 3: Test Locally (1 minute)

**Option A: Using VS Code**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

**Option B: Using Python**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Option C: Using npm**
```bash
npx http-server -p 8000
```

### Step 4: Create Admin User

1. Open your site in browser
2. Click "Account" → "Register"
3. Create an account
4. Go to Firebase Console → Firestore Database
5. Click on `users` collection → Find your user
6. Add field: `role` = `"admin"`

### Step 5: Add Products

1. Navigate to `/admin.html`
2. Click "Add Product" tab
3. Fill in product details:
   - Name, category, price, description
   - Upload product images
   - Set sizes and colors
4. Click "Add Product"

## ✅ You're Done!

Your e-commerce site is now running with:
- ✅ User authentication (Email + Google)
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Checkout system
- ✅ Admin panel

## 🚀 Deploy to Production

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (one time)
firebase init hosting

# Deploy
firebase deploy
```

Your site will be at: `https://your-project.firebaseapp.com`

### Option 2: GitHub Pages

1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch and root folder
4. Save

Your site will be at: `https://username.github.io/repo-name/`

## 🔒 Production Security (Important!)

Before going live, update Firestore rules:

1. Go to Firebase Console → Firestore → Rules
2. Replace with production rules from README.md
3. Similarly, update Storage rules

## 📱 Test on Mobile

1. Deploy to Firebase or GitHub Pages
2. Open on your phone
3. Test responsive design and functionality

## 🎨 Customize

- **Business Name:** Search/replace "Trendy Threads"
- **Colors:** Edit CSS variables in `css/style.css`
- **Images:** Upload via admin panel or replace Unsplash URLs

## ❓ Troubleshooting

**Products not loading?**
- Check Firebase config is correct
- Verify Firestore is enabled
- Check browser console for errors

**Can't login?**
- Verify Authentication is enabled
- Check authorized domains in Firebase Console

**Images not uploading?**
- Verify Storage is enabled
- Check storage rules

## 📚 Next Steps

1. Add more products via admin panel
2. Customize colors and branding
3. Update production security rules
4. Configure custom domain (Firebase Hosting)
5. Set up analytics (optional)

## 🆘 Need Help?

Check the main README.md for:
- Detailed documentation
- Firestore data structure
- Security rules
- Advanced configuration

---

**Happy Selling! 🛍️**
