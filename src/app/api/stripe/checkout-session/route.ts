/**
 * BACKEND STRIPE API ROUTE - Retrieve Checkout Session
 * 
 * This is a SERVER-SIDE route that:
 * - Uses secret key (sk_) - NEVER exposed to frontend
 * - Retrieves checkout session details for verification
 * - Used by frontend to verify payment status after redirect
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// BACKEND: Initialize Stripe with secret key (sk_)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // Use latest API version - Stripe will use your account's default if not specified
  // apiVersion: '2024-11-20.acacia', // Uncomment and set specific version if needed
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      session,
      subscriptionType: session.metadata?.subscriptionType,
      userId: session.metadata?.userId,
    });
  } catch (error: any) {
    console.error('Error retrieving Stripe checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}

