/**
 * BACKEND STRIPE WEBHOOK HANDLER
 * 
 * This is a SERVER-SIDE route that handles:
 * - Webhook events from Stripe (payment confirmations, subscription updates)
 * - Uses secret key (sk_) for verification
 * - Updates database securely (marks orders as paid)
 * 
 * This route is called by Stripe's servers, not by the frontend.
 * Frontend never directly calls this - Stripe calls it after payment events.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// BACKEND: Initialize Stripe with secret key (sk_)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // Use latest API version - Stripe will use your account's default if not specified
  // apiVersion: '2024-11-20.acacia', // Uncomment and set specific version if needed
});

// BACKEND: Webhook secret for verifying requests are from Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);
      
      // Here you would typically:
      // 1. Update the user's subscription in your database
      // 2. Call your backend API to activate the subscription
      // 3. Send confirmation email, etc.
      
      /**
       * BACKEND: Database Updates
       * After payment is confirmed, update your database to mark subscription as active
       * This is called by Stripe's servers, not by the frontend
       */
      // Call backend API to activate subscription
      // NOTE: Backend team should provide the endpoint URL and update BACKEND_API_URL env variable if needed
      if (session.metadata?.userId && session.metadata?.subscriptionType) {
        try {
          const backendUrl = process.env.BACKEND_API_URL;
          const backendEndpoint = `${backendUrl}/api/subscriptions/activate`; // Backend team: update this endpoint if different
          
          const response = await fetch(backendEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.metadata.userId,
              subscriptionType: session.metadata.subscriptionType, // 'standard' or 'pro'
              stripeSessionId: session.id,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            }),
          });

          if (!response.ok) {
            console.error('Backend API returned error:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error calling backend API:', error);
          // Note: Webhook will still return success to Stripe to prevent retries
          // Backend team should handle idempotency for failed webhook calls
        }
      }
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id);
      // Handle subscription updates (e.g., plan changes, renewals)
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted:', deletedSubscription.id);
      // Handle subscription cancellation
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

