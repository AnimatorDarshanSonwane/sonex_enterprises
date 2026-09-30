# Sonex Enterprises — 360° Luxury Couture Client Platform

Welcome to the **Sonex Enterprises** luxury couture online showroom and customer ordering portal.

## 🌟 Highlights
- **Interactive 360° Turnaround Showroom**: Smooth interactive dress rotation and fitting inspection.
- **Curated Haute Couture Collection**: Gamthi embroidered lehengas, silk chaniya cholis, royal velvet evening gowns, and festive bridal collections.
- **Cart & Wishlist Engine**: Real-time shopping bag with item customizations (size, color, measurements).
- **Luxury Checkout & UTR Verification**: Direct bank transfer & UPI QR payments with instant UTR transaction number submission and order tracking.
- **Responsive Architecture**: Fully responsive across mobile, tablet, laptop, and ultra-wide screens.

---

## 📁 Repository Structure
```
├── frontend/             # React 19 + Vite + Three.js client application
│   ├── src/              # Components, styles, 3D viewport, store services
│   ├── public/           # Turnaround video & frame assets, brand logos
│   ├── package.json      # Frontend dependencies
│   └── vercel.json       # SPA route rewrites for Vercel
├── backend/              # Express API & Firebase Cloud Functions
│   ├── routes/           # Products, orders, settings, and users routes
│   └── firebaseAdmin.js  # Server-side Firebase Admin SDK initialization
├── store_settings.json   # Store settings & pricing configurations
├── firestore.rules       # Security rules for collections
├── vercel.json           # Root-level Vercel deployment configuration
└── README.md
```

---

## 🚀 Running Locally

### 1. Client Frontend
```bash
cd frontend
npm install
npm run dev
```
The client website will start on `http://localhost:5173`.

### 2. Client Backend
```bash
cd backend
npm install
npm run dev
```

---

## ⚡ Deploying to Vercel

1. Import this repository into **[Vercel](https://vercel.com/)**.
2. **Framework Preset**: Vite
3. **Root Directory**:
   - You can leave Root Directory as `.` (uses root `vercel.json` and builds `frontend`), OR
   - Set **Root Directory** to `frontend`.
4. Click **Deploy**.
