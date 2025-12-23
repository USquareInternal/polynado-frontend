# Setting Up Stripe Webhooks with ngrok (Localhost)

## Complete Step-by-Step Guide

### Prerequisites
- Your Next.js app running on `localhost:3000`
- A Stripe account (test mode)

---

## Step 1: Install ngrok

### Windows:
```powershell
# Using winget (recommended)
winget install ngrok.ngrok

# Or download from: https://ngrok.com/download
# Extract and add to PATH
```

### Mac:
```bash
brew install ngrok
```

### Linux:
```bash
# Download from: https://ngrok.com/download
# Or use snap:
snap install ngrok
```

### Verify Installation:
```bash
ngrok version
```

---

## Step 2: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Create a free account
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### Authenticate ngrok:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

---

## Step 3: Start Your Next.js Dev Server

Make sure your app is running:
```bash
npm run dev
```

Your app should be accessible at: `http://localhost:3000`

---

## Step 4: Start ngrok Tunnel

Open a **new terminal** and run:
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important:** Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

---

## Step 5: Create Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard (Test Mode):**
   - https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL:**
   ```
   https://abc123.ngrok-free.app/api/stripe/webhook
   ```
   *(Replace `abc123.ngrok-free.app` with your actual ngrok URL)*

4. **Select events to listen to:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

5. **Click "Add endpoint"**

---

## Step 6: Get Webhook Signing Secret

1. **Click on the webhook endpoint** you just created

2. **Click "Reveal"** next to "Signing secret"

3. **Copy the secret** (starts with `whsec_...`)

   Example: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 7: Add to Your .env.local

Open your `.env.local` file and add/update:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important:** Use the `whsec_...` value you copied from Stripe Dashboard.

---

## Step 8: Restart Your Dev Server

Stop your Next.js server (Ctrl+C) and restart:
```bash
npm run dev
```

---

## Step 9: Test Your Setup

### Keep Both Terminals Running:

- **Terminal 1:** `npm run dev` (Next.js server)
- **Terminal 2:** `ngrok http 3000` (ngrok tunnel)

### Test the Webhook:

1. **Go to your subscription page:** `http://localhost:3000/subscription`
2. **Click a subscription button** (Standard or Pro)
3. **Complete a test payment** using Stripe test card: `4242 4242 4242 4242`
4. **Check Terminal 1** - You should see webhook logs
5. **Check ngrok dashboard:** Open `http://localhost:4040` to see requests

---

## ngrok Dashboard

While ngrok is running, you can view:
- **Request logs:** http://localhost:4040
- **Replay requests**
- **Inspect webhook payloads**

---

## Important Notes

### ⚠️ Free ngrok URLs Change

**Problem:** Every time you restart ngrok, you get a new URL.

**Solution Options:**

1. **Use ngrok's static domain (paid):**
   ```bash
   ngrok http 3000 --domain=your-static-domain.ngrok-free.app
   ```

2. **Update webhook URL in Stripe each time:**
   - Go to Stripe Dashboard → Webhooks
   - Click your endpoint
   - Click "Update endpoint"
   - Change the URL to your new ngrok URL

3. **Use Stripe CLI instead** (easier for local testing)

### 🔒 Security

- ngrok URLs are public - anyone with the URL can access your localhost
- Only use for development/testing
- Never commit ngrok URLs to git

### 🚀 Production

For production, you don't need ngrok. Just:
1. Deploy your app
2. Create webhook in Stripe Dashboard pointing to: `https://yourdomain.com/api/stripe/webhook`
3. Use the production webhook secret

---

## Troubleshooting

### "ngrok: command not found"
- Make sure ngrok is installed and in your PATH
- Restart your terminal after installation

### "Webhook signature verification failed"
- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- Restart your dev server after updating `.env.local`
- Check that you're using the correct webhook secret (test vs live)

### "Connection refused" or "Cannot connect"
- Make sure your Next.js server is running on port 3000
- Check that ngrok is still running
- Verify the webhook URL in Stripe Dashboard matches your ngrok URL

### "ngrok URL changed"
- Update the webhook URL in Stripe Dashboard
- Or use ngrok's static domain feature (paid)

### Webhooks not being received
- Check that ngrok is still running
- Verify the webhook URL in Stripe Dashboard
- Check your server logs for errors
- Open ngrok dashboard (http://localhost:4040) to see if requests are coming through

---

## Quick Reference Commands

```bash
# Start ngrok tunnel
ngrok http 3000

# Start with custom domain (paid)
ngrok http 3000 --domain=your-domain.ngrok-free.app

# View ngrok dashboard
# Open: http://localhost:4040

# Check ngrok status
ngrok status
```

---

## Alternative: Stripe CLI (Easier for Local Testing)

If you find ngrok cumbersome, consider using **Stripe CLI** instead:

```bash
# Install Stripe CLI
winget install stripe.stripe-cli  # Windows
brew install stripe/stripe-cli/stripe  # Mac

# Login
stripe login

# Forward webhooks (no dashboard setup needed!)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The Stripe CLI automatically provides a webhook secret and forwards events - no need to create webhooks in the dashboard!

---

## Summary Checklist

- [ ] ngrok installed and authenticated
- [ ] Next.js dev server running on port 3000
- [ ] ngrok tunnel started (`ngrok http 3000`)
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL set to: `https://your-ngrok-url.ngrok-free.app/api/stripe/webhook`
- [ ] Webhook secret copied from Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` added to `.env.local`
- [ ] Dev server restarted
- [ ] Tested with a subscription purchase

---

## Need Help?

- **ngrok Docs:** https://ngrok.com/docs
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **ngrok Dashboard:** http://localhost:4040 (while ngrok is running)

