/**
 * BACKEND STRIPE API ROUTE - Create Checkout Session
 * 
 * This is a SERVER-SIDE route that handles:
 * - Uses secret key (sk_) - NEVER exposed to frontend
 * - Calculates prices securely (prevents user tampering)
 * - Creates Stripe checkout sessions
 * 
 * FRONTEND responsibilities (in subscription/page.tsx):
 * - Uses publishable key (pk_) - safe for browser
 * - Displays prices (UI only)
 * - Redirects user to Stripe Checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe - will be validated in the route handler
let stripe: Stripe | null = null;

/**
 * BACKEND: Initialize Stripe with secret key (sk_)
 * This key is NEVER sent to the frontend - it's server-side only
 */
function getStripeInstance(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(secretKey, {
      // Use latest API version - Stripe will use your account's default if not specified
      // apiVersion: '2024-11-20.acacia', // Uncomment and set specific version if needed
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    // Get Stripe instance (will throw if not configured)
    let stripeInstance: Stripe;
    try {
      stripeInstance = getStripeInstance();
    } catch (error: any) {
      console.error('Stripe configuration error:', error.message);
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { subscriptionType, userId } = body;

    if (!subscriptionType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionType and userId' },
        { status: 400 }
      );
    }

    // Validate subscription type
    if (subscriptionType !== 'standard' && subscriptionType !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid subscription type. Must be "standard" or "pro"' },
        { status: 400 }
      );
    }

    /**
     * BACKEND: Price calculation happens here (server-side)
     * This prevents users from tampering with prices in the browser
     * Prices are in cents: $10.00 = 1000 cents, $20.00 = 2000 cents
     */
    const prices = {
      standard: 1000, // $10.00 in cents
      pro: 2000, // $20.00 in cents
    };

    const priceInCents = prices[subscriptionType as 'standard' | 'pro'];

    // Get base URL and validate it
    // Clean the URL - remove any comments or extra text after the URL
    let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim();
    
    // Remove any comments or extra text (everything after space or parenthesis)
    const urlMatch = baseUrl.match(/^(https?:\/\/[^\s\(\)]+)/);
    if (urlMatch) {
      baseUrl = urlMatch[1];
    }
    
    // Ensure it ends with a valid URL format
    if (!baseUrl || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
      console.error('Invalid NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
      return NextResponse.json(
        { error: 'Invalid base URL configuration. NEXT_PUBLIC_BASE_URL must be a valid HTTP/HTTPS URL (e.g., http://localhost:3000).' },
        { status: 500 }
      );
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('Using base URL for Stripe:', baseUrl);

    // Create Stripe Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${subscriptionType === 'standard' ? 'Standard' : 'Pro'} Subscription`,
              description: `Monthly ${subscriptionType === 'standard' ? 'Standard' : 'Pro'} subscription access`,
            },
            unit_amount: priceInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: {
        userId,
        subscriptionType,
      },
      customer_email: body.email || undefined, // Optional: if you want to collect email
    });

    // Validate that we got a valid URL from Stripe
    if (!session.url) {
      console.error('Stripe session created but no URL returned. Session ID:', session.id);
      return NextResponse.json(
        { error: 'Failed to create checkout session. No URL returned from Stripe.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    console.error('Error details:', {
      type: error.type,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = error.message || 'Invalid Stripe request. Please check your Stripe configuration.';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your STRIPE_SECRET_KEY.';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Stripe API error: ${error.message || 'Unknown error'}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

