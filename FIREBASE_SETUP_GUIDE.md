# DMF Music Platform - Full Stack Setup

## 🚀 Firebase + MongoDB Backend & Frontend Scaffold

This is a complete production-ready setup with:
- **Frontend**: React + Tailwind CSS (Lovable-ready) with pricing & admin pages
- **Backend**: Firebase Functions (Node.js Express) with MongoDB Atlas
- **Database**: MongoDB Atlas for persistent data storage
- **Auth**: JWT tokens for admin API protection

---

## 📦 Project Structure

```
dmf-music-platform/
├─ frontend/
│   ├─ pages/
│   │   ├─ PricingPlansPage.jsx      # Public pricing page
│   │   └─ AdminPricingPlans.jsx     # Admin CRUD interface
│   ├─ components/
│   │   └─ Toast.jsx                 # Toast notification system
│   ├─ App.jsx                       # Main router
│   └─ .env.local                    # Frontend config
├─ backend/
│   ├─ functions/
│   │   ├─ index.js                  # Express app entry
│   │   ├─ pricingPublic.js          # Public endpoints
│   │   └─ pricingAdmin.js           # Admin endpoints (JWT-protected)
│   ├─ package.json
│   └─ .env.local                    # Backend config
└─ firebase.json                     # Firebase config
```

---

## 🔧 Setup Instructions

### **Step 1: Install Dependencies**

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### **Step 2: Configure Environment Variables**

#### Backend (`backend/.env.local`)
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/dmf_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-please
```

Get your MongoDB URI from:
1. MongoDB Atlas → Your Cluster → Connect → Copy connection string
2. Replace `<username>` and `<password>` with actual credentials

#### Frontend (`frontend/.env.local`)
```
REACT_APP_API_BASE=https://us-central1-YOUR_FIREBASE_PROJECT.cloudfunctions.net/api
```

After deploying Firebase Functions, replace `YOUR_FIREBASE_PROJECT` with your actual Firebase project ID.

### **Step 3: Local Development (Optional)**

#### Run Firebase Emulator
```bash
firebase emulators:start --only functions
```

Then update `frontend/.env.local`:
```
REACT_APP_API_BASE=http://localhost:5001/YOUR_FIREBASE_PROJECT/us-central1/api
```

#### Run Frontend Dev Server
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

---

## 🚀 Deployment to Firebase

### **Prerequisites**
- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated: `firebase login`
- Project initialized: `firebase init`

### **Deploy Steps**

#### 1. Set Firebase Functions Config
```bash
firebase functions:config:set \
  mongo.uri="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/dmf_db?retryWrites=true&w=majority" \
  jwt.secret="your-super-secret-jwt-key-min-32-chars-long-please"
```

#### 2. Deploy Functions & Hosting
```bash
firebase deploy --only functions,hosting
```

#### 3. Get Your API Base URL
After deployment, your API will be at:
```
https://us-central1-YOUR_FIREBASE_PROJECT.cloudfunctions.net/api
```

Update `frontend/.env.local` with this URL and redeploy hosting.

---

## 📊 API Endpoints

### **Public Endpoints** (No auth required)
```
GET  /api/pricing/public/plans
```

### **Admin Endpoints** (JWT auth required)
```
GET    /api/pricing/admin/plans              # List all plans
POST   /api/pricing/admin/plans              # Create plan
PUT    /api/pricing/admin/plans/:id          # Update plan
DELETE /api/pricing/admin/plans/:id          # Delete plan
PATCH  /api/pricing/admin/plans/:id/toggle   # Toggle active status
```

### **Authentication**
Include JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

To generate a token, use `jsonwebtoken`:
```javascript
const jwt = require("jsonwebtoken");
const token = jwt.sign({ userId: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
```

---

## 🧪 Testing

### **Public Endpoint**
```bash
curl https://your-functions-url/api/pricing/public/plans
```

### **Admin Endpoint with Token**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-functions-url/api/pricing/admin/plans
```

### **Create a Plan**
```bash
curl -X POST https://your-functions-url/api/pricing/admin/plans \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Pro Plan",
       "description": "For professionals",
       "price": 99.99,
       "features": ["Feature 1", "Feature 2"],
       "active": true
     }'
```

---

## 📝 Frontend Features

### **PricingPlansPage.jsx**
- Displays active pricing plans from the public API
- Beautiful card-based UI with Tailwind CSS
- Responsive grid layout

### **AdminPricingPlans.jsx**
- JWT token input for authentication
- Create new pricing plans with form
- Edit/update existing plans
- Toggle plan active status
- Delete plans
- Real-time list refresh
- Toast notifications for success/error

### **Toast.jsx**
- Context-based notification system
- Auto-dismiss after 4 seconds
- Success (green) and error (red) variants

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** — Add to `.gitignore`
2. **Use strong JWT_SECRET** — 32+ characters, random
3. **Enable JWT expiration** — Set `expiresIn` in token generation
4. **Validate MongoDB URI** — Keep credentials private
5. **Use Firebase Security Rules** — Restrict access by user role
6. **Enable CORS carefully** — Currently allows all origins (update in production)

---

## 🐛 Troubleshooting

### **MongoDB Connection Error**
- Check `MONGO_URI` format is correct
- Verify username/password
- Whitelist your IP in MongoDB Atlas (if not using VPC)

### **JWT Verification Failed**
- Ensure `JWT_SECRET` matches between token generation and verification
- Check token expiration time
- Verify `Authorization` header format: `Bearer <TOKEN>`

### **CORS Error**
- Frontend and backend must be accessible from each other
- Update CORS origin in `backend/functions/index.js` if needed

### **Firebase Functions Not Deploying**
- Check Firebase CLI is authenticated: `firebase login`
- Ensure project ID is correct in `firebase.json`
- Check `functions/package.json` has correct dependencies

---

## 📚 Next Steps

1. **Deploy to Firebase** following the deployment steps above
2. **Update Firebase config** in `.firebaserc` if needed
3. **Test all CRUD operations** via the admin interface
4. **Generate JWT tokens** for your admin users
5. **Monitor logs** with `firebase functions:log`
6. **Scale MongoDB** as needed for production traffic

---

## 🎯 Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] JWT_SECRET is 32+ characters and secure
- [ ] Firebase project created and initialized
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Hosting deployed: `firebase deploy --only hosting`
- [ ] CORS configured for your domain
- [ ] Admin user JWT tokens generated
- [ ] Email notifications set up (optional)
- [ ] Monitoring and logging enabled
- [ ] Backup strategy for MongoDB in place

---

Good luck! You're ready to go live. 🚀
