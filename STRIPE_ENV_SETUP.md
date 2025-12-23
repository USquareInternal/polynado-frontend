# Stripe Integration - Environment Variables Setup

## Required Environment Variables

### For Testing/Development

Create a `.env.local` file in your project root with the following variables:

```env
# ============================================
# STRIPE CONFIGURATION (TEST MODE)
# ============================================

# Stripe Secret Key (Test Mode)
# Get from: https://dashboard.stripe.com/test/apikeys
# Format: sk_test_...
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE

# Stripe Publishable Key (Test Mode)
# Get from: https://dashboard.stripe.com/test/apikeys
# Format: pk_test_...
# This is exposed to the client, so it's safe to use in frontend code
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE

# Stripe Webhook Secret (Test Mode)
# Get from: https://dashboard.stripe.com/test/webhooks
# After creating a webhook endpoint, copy the "Signing secret"
# Format: whsec_...
STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET_HERE

# Your Application Base URL (for local development)
# This is used for Stripe checkout redirect URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend API URL (Optional - defaults to existing backend)
# The webhook will call this endpoint to activate subscriptions
BACKEND_API_URL=https://polynado-backend.onrender.com
```

### For Production

Update your production environment variables (e.g., Vercel, Netlify, or your hosting platform):

```env
# ============================================
# STRIPE CONFIGURATION (PRODUCTION MODE)
# ============================================

# Stripe Secret Key (Live Mode)
# Get from: https://dashboard.stripe.com/apikeys
# Format: sk_live_...
# ⚠️ IMPORTANT: Use LIVE keys only in production!
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE

# Stripe Publishable Key (Live Mode)
# Get from: https://dashboard.stripe.com/apikeys
# Format: pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE

# Stripe Webhook Secret (Live Mode)
# Get from: https://dashboard.stripe.com/webhooks
# After creating a webhook endpoint, copy the "Signing secret"
# Format: whsec_...
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE

# Your Production Application URL
# Replace with your actual production domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Backend API URL (Production)
BACKEND_API_URL=https://polynado-backend.onrender.com
```

## How to Get Stripe Keys

### 1. Test Mode Keys (for Development)

1. Go to [Stripe Dashboard - Test Mode](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Secret key** (starts with `sk_test_`)
3. Copy the **Publishable key** (starts with `pk_test_`)

### 2. Live Mode Keys (for Production)

1. **Switch to Live Mode** in Stripe Dashboard (toggle in top right)
2. Go to [Stripe Dashboard - API Keys](https://dashboard.stripe.com/apikeys)
3. Copy the **Secret key** (starts with `sk_live_`)
4. Copy the **Publishable key** (starts with `pk_live_`)

### 3. Webhook Secret

#### For Test Mode:
1. Go to [Stripe Dashboard - Test Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)

#### For Production:
1. **Switch to Live Mode** in Stripe Dashboard
2. Go to [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/webhooks)
3. Follow the same steps as test mode
4. Use your production domain for the webhook URL

## Environment Variable Summary

| Variable | Required | Test Mode | Production Mode | Notes |
|----------|----------|-----------|-----------------|-------|
| `STRIPE_SECRET_KEY` | ✅ Yes | `sk_test_...` | `sk_live_...` | Server-side only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | `pk_test_...` | `pk_live_...` | Exposed to client |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | `whsec_...` | `whsec_...` | For webhook verification |
| `NEXT_PUBLIC_BASE_URL` | ✅ Yes | `http://localhost:3000` | `https://yourdomain.com` | For redirect URLs |
| `BACKEND_API_URL` | ⚠️ Optional | Your backend URL | Your backend URL | Defaults to existing backend |

## Important Notes

1. **Never commit `.env.local` to git** - It's already in `.gitignore`
2. **Test vs Live Keys**: Always use test keys for development, live keys only in production
3. **Webhook URL**: Must be publicly accessible (use ngrok for local testing or deploy to staging)
4. **Restart Required**: After adding/updating environment variables, restart your dev server
5. **NEXT_PUBLIC_ prefix**: Variables with this prefix are exposed to the browser (safe for publishable keys)

## Local Testing with Webhooks

Since webhooks require a publicly accessible URL, you need to expose your localhost. Here are two methods:

### Method 1: Stripe CLI (Recommended - Easiest)

1. **Install Stripe CLI**:
   - Windows: Download from https://github.com/stripe/stripe-cli/releases
   - Or use: `winget install stripe.stripe-cli`
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Linux: See https://stripe.com/docs/stripe-cli

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```
   This will open your browser to authenticate.

3. **Start webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret**:
   The CLI will output something like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```
   Copy this `whsec_...` value.

5. **Add to your `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Keep the CLI running** while testing. It will forward webhooks from Stripe to your local server.

### Method 2: ngrok (Alternative)

1. **Install ngrok**:
   - Download from https://ngrok.com/download
   - Or use: `winget install ngrok.ngrok` (Windows)

2. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Create webhook in Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Enter: `https://abc123.ngrok.io/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Click "Add endpoint"

6. **Copy the webhook signing secret**:
   - Click on the webhook endpoint you just created
   - Click "Reveal" next to "Signing secret"
   - Copy the `whsec_...` value

7. **Add to your `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

8. **Keep ngrok running** while testing.

### Quick Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Stripe CLI** | ✅ Easiest setup<br>✅ No dashboard needed<br>✅ Auto-forwards | ⚠️ Requires Stripe CLI install |
| **ngrok** | ✅ Works with any service<br>✅ Visual dashboard | ⚠️ Need to create webhook in dashboard<br>⚠️ URL changes on free plan |

## Verification Checklist

- [ ] Test mode keys added to `.env.local`
- [ ] `NEXT_PUBLIC_BASE_URL` set correctly (no comments in the value)
- [ ] Dev server restarted after adding env vars
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret copied to `STRIPE_WEBHOOK_SECRET`
- [ ] Production keys ready (when deploying)
- [ ] Production webhook endpoint configured

