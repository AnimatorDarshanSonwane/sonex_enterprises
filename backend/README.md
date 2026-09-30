# Sonex Enterprises — Client Atelier API Backend & Cloud Functions

Decoupled enterprise REST API backend and Firebase Cloud Functions service powering the Sonex Enterprises luxury client atelier platform.

---

## 🎯 Architecture Overview

- **Decoupled API Routing**: 100% of client catalog browsing, 360° variant video/angle resolution, secure order placement, UTR reference submission, and user-isolated profile/wishlist operations route through REST API endpoints.
- **Dual Runtime Support**:
  - **Local Development**: Fast standalone Node.js / Express HTTP server running on port `5001`.
  - **Production Deployment**: Cloud Functions for Firebase v2 HTTPS endpoint (`clientApi` with region `us-central1` and CORS enabled).
- **Graceful Fallback**: The client frontend connects to this API first. In the event of an unreachable network or offline development state, the frontend seamlessly falls back to direct client-side Firestore SDK and local offline cache with zero downtime.

---

## 🚀 Getting Started

### 1. Installation
```bash
cd sonex_enterprices/client/backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=5001
FIREBASE_PROJECT_ID=sonex-enterprices
```

### 3. Run Locally
```bash
# Production runner
npm start

# Development auto-restart watcher
npm run dev
```

The API will be available at:
`http://localhost:5001`

---

## 📡 API Specification

### Health Check
- `GET /health`
  - Returns backend service status, runtime name, and server timestamp.

### Products Catalog
- `GET /api/products`
  - Returns all active visible dresses.
  - Query parameters:
    - `category`: Filter by dress category (e.g. `Bridal`, `Evening`, `Couture`).
    - `search`: Search by dress title or description.
- `GET /api/products/:id`
  - Returns a specific dress model by ID.
- `GET /api/products/:id/360-preview?color=...&size=...`
  - Resolves dynamic 360° turnaround video and angle assets matching the requested colorway and sizing variant.

### Orders & Checkout
- `POST /api/orders`
  - Places a bespoke dress order. Automatically checks and updates remaining product stock and associates the order strictly with the user's `userId`.
- `POST /api/orders/:id/utr`
  - Submits a 12-digit UPI UTR reference number and payment application (Google Pay, PhonePe, Paytm) for manual banking verification.
- `GET /api/orders/user/:userId`
  - Securely fetches order history isolated strictly to the requesting user ID. Zero cross-user data leakage.
- `GET /api/orders/:id`
  - Fetches real-time status and tracking details for a specific order.

### User Profile & Wishlist
- `GET /api/users/:uid/profile`
  - Fetches the user's private profile information and contact details.
- `PUT /api/users/:uid/profile`
  - Updates private profile data.
- `GET /api/users/:uid/wishlist`
  - Fetches the user's saved favorites list.
- `POST /api/users/:uid/wishlist`
  - Updates the user's wishlist favorites.

---

## ☁️ Deployment to Firebase Cloud Functions

Deploy to the `sonex-enterprices` Firebase project:
```bash
# From workspace root:
firebase deploy --only functions:client-api
```
