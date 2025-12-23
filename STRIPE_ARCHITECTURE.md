# Stripe Integration Architecture

## Frontend vs Backend Separation

This document explains how Stripe is integrated with clear separation between frontend and backend responsibilities.

---

## 📱 FRONTEND (Client-Side)

**Location:** `src/app/subscription/page.tsx`

### Responsibilities:

| Feature | Implementation | Why? |
|---------|---------------|------|
| **API Keys** | Uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_) | Safe to expose in browser - it's public |
| **Price Display** | Shows prices in UI ($10/$20) | For user information only - actual calculation is backend |
| **Credit Card Form** | Redirects to Stripe Checkout | PCI compliant - Stripe handles all card data, we never see it |
| **Redirecting User** | Redirects to Stripe Checkout URL | Takes user from our site to secure Stripe payment page |

### Code Example:

```typescript
// FRONTEND: Initialize with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// FRONTEND: Display prices (UI only)
const standardPrice = 10; // $10/month
const proPrice = 20; // $20/month

// FRONTEND: Redirect to Stripe Checkout
window.location.href = checkoutUrl; // Stripe handles payment securely
```

### What Frontend Does:
1. ✅ Displays subscription options and prices
2. ✅ Calls backend API to create checkout session
3. ✅ Redirects user to Stripe Checkout (secure payment page)
4. ✅ Handles success/cancel redirects from Stripe
5. ✅ Shows success/error messages to user

### What Frontend Does NOT Do:
- ❌ Never uses secret key (sk_)
- ❌ Never calculates prices (backend does this)
- ❌ Never touches credit card data (Stripe handles this)
- ❌ Never updates database (webhooks do this)

---

## 🔒 BACKEND (Server-Side)

**Location:** `src/app/api/stripe/*`

### Responsibilities:

| Feature | Implementation | Why? |
|---------|---------------|------|
| **API Keys** | Uses `STRIPE_SECRET_KEY` (sk_) | Server-side only - never exposed to browser |
| **Price Calculation** | Calculates prices in cents (1000, 2000) | Prevents user from tampering with prices |
| **Database Updates** | Webhook handler updates database | Securely marks orders as paid after payment confirmation |

### Routes:

#### 1. `/api/stripe/create-checkout` (POST)
**Purpose:** Create Stripe checkout session

**What it does:**
- ✅ Validates subscription type
- ✅ Calculates price securely (server-side)
- ✅ Creates Stripe checkout session using secret key
- ✅ Returns checkout URL to frontend

**Code Example:**
```typescript
// BACKEND: Price calculation (prevents tampering)
const prices = {
  standard: 1000, // $10.00 in cents
  pro: 2000, // $20.00 in cents
};

// BACKEND: Create session with secret key
const session = await stripe.checkout.sessions.create({...});
```

#### 2. `/api/stripe/webhook` (POST)
**Purpose:** Handle Stripe webhook events

**What it does:**
- ✅ Verifies webhook signature (ensures request is from Stripe)
- ✅ Handles `checkout.session.completed` event
- ✅ Updates database via backend API
- ✅ Handles subscription updates/cancellations

**Important:** This route is called by **Stripe's servers**, not by your frontend!

#### 3. `/api/stripe/checkout-session` (GET)
**Purpose:** Verify payment status after redirect

**What it does:**
- ✅ Retrieves checkout session details
- ✅ Verifies payment status
- ✅ Returns session info to frontend

---

## 🔄 Payment Flow

```
1. User clicks "Subscribe" (Frontend)
   ↓
2. Frontend calls /api/stripe/create-checkout (Backend)
   ↓
3. Backend calculates price, creates session (Backend)
   ↓
4. Backend returns checkout URL (Backend → Frontend)
   ↓
5. Frontend redirects user to Stripe Checkout (Frontend)
   ↓
6. User enters card details on Stripe's secure page (Stripe)
   ↓
7. Stripe processes payment (Stripe)
   ↓
8. Stripe redirects back to success/cancel URL (Stripe → Frontend)
   ↓
9. Stripe sends webhook to /api/stripe/webhook (Stripe → Backend)
   ↓
10. Backend updates database (Backend)
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Use publishable key (pk_) in frontend
- Use secret key (sk_) only in backend
- Calculate prices on backend
- Verify webhook signatures
- Never expose secret keys to browser

### ❌ DON'T:
- Never put secret key in frontend code
- Never calculate prices in frontend
- Never trust frontend price values
- Never skip webhook signature verification

---

## 📁 File Structure

```
src/
├── app/
│   ├── subscription/
│   │   └── page.tsx              # FRONTEND: UI, redirects, display
│   └── api/
│       └── stripe/
│           ├── create-checkout/   # BACKEND: Create session, calculate price
│           ├── webhook/           # BACKEND: Handle payment confirmations
│           └── checkout-session/  # BACKEND: Verify payment status
```

---

## 🔑 Environment Variables

### Frontend (Public):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Safe for browser
NEXT_PUBLIC_BASE_URL=http://localhost:3000      # For redirects
```

### Backend (Secret):
```env
STRIPE_SECRET_KEY=sk_test_...                   # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook verification
BACKEND_API_URL=https://...                      # Your backend API
```

---

## 📝 Summary

| Component | Location | Key Type | Main Purpose |
|-----------|----------|----------|--------------|
| **Frontend** | `subscription/page.tsx` | `pk_` (public) | Display UI, redirect to Stripe |
| **Backend API** | `api/stripe/create-checkout` | `sk_` (secret) | Calculate prices, create sessions |
| **Backend Webhook** | `api/stripe/webhook` | `sk_` (secret) | Update database after payment |

This architecture ensures:
- ✅ PCI compliance (we never touch card data)
- ✅ Security (secret keys never exposed)
- ✅ Price integrity (backend calculates prices)
- ✅ Reliable updates (webhooks handle database)

