# Setting Up Stripe Webhooks for Localhost Development

## Quick Start: Stripe CLI (Recommended)

### Step 1: Install Stripe CLI

**Windows:**
```powershell
# Option 1: Using winget
winget install stripe.stripe-cli

# Option 2: Download from GitHub
# Visit: https://github.com/stripe/stripe-cli/releases
# Download the Windows .zip file and extract it
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# See: https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe

```bash
stripe login
```

This will:
- Open your browser
- Ask you to authorize the CLI
- Link it to your Stripe account

### Step 3: Start Webhook Forwarding

Make sure your Next.js dev server is running first:
```bash
npm run dev
```

Then in a **new terminal**, run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

### Step 4: Copy the Webhook Secret

Copy the `whsec_...` value that appears after "Your webhook signing secret is"

### Step 5: Add to .env.local

Open your `.env.local` file and add/update:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Restart Your Dev Server

Stop your dev server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 7: Test It!

1. Keep both terminals running:
   - Terminal 1: `npm run dev` (your Next.js server)
   - Terminal 2: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (webhook forwarder)

2. Try making a test subscription purchase

3. Watch Terminal 2 - you should see webhook events being forwarded!

---

## Alternative: Using ngrok

### Step 1: Install ngrok

**Windows:**
```powershell
winget install ngrok.ngrok
```

**Mac:**
```bash
brew install ngrok
```

Or download from: https://ngrok.com/download

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Start ngrok

In a **new terminal**:
```bash
ngrok http 3000
```

You'll get a public URL like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your ngrok URL: `https://abc123.ngrok.io/api/stripe/webhook`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **"Add endpoint"**

### Step 5: Get Webhook Secret

1. Click on the webhook endpoint you just created
2. Click **"Reveal"** next to "Signing secret"
3. Copy the `whsec_...` value

### Step 6: Add to .env.local

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 7: Restart Dev Server

```bash
npm run dev
```

### Important Notes for ngrok:

- ⚠️ **Free ngrok URLs change** every time you restart ngrok
- You'll need to update the webhook URL in Stripe Dashboard each time
- Consider using Stripe CLI instead for easier testing

---

## Testing Your Webhook

### Using Stripe CLI:

You can trigger test events:
```bash
stripe trigger checkout.session.completed
```

### Using Stripe Dashboard:

1. Go to your webhook endpoint
2. Click "Send test webhook"
3. Select an event type
4. Click "Send test webhook"

### Check Your Server Logs:

You should see logs in your Next.js terminal showing:
- Webhook received
- Event type
- Processing status

---

## Troubleshooting

### "Webhook signature verification failed"

- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or Dashboard
- Restart your dev server after updating `.env.local`

### "Connection refused" or "Cannot connect"

- Make sure your Next.js server is running on port 3000
- Check that the webhook URL is correct
- For ngrok: Make sure ngrok is still running

### Webhooks not being received

- Check that Stripe CLI or ngrok is still running
- Verify the webhook URL in Stripe Dashboard matches your setup
- Check your server logs for errors

---

## Quick Reference

### Stripe CLI Commands:
```bash
# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed

# View webhook events
stripe events list
```

### ngrok Commands:
```bash
# Start tunnel
ngrok http 3000

# View dashboard
# Open http://localhost:4040 in browser
```

