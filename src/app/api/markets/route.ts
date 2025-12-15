// src/app/api/markets/route.ts

// This file creates a server-side endpoint at /api/markets that fetches
// data from the external API, bypassing CORS restrictions.

export async function GET() {
    const EXTERNAL_API_URL = 'https://gamma-api.polymarket.com/markets';

    try {
        // 1. Fetch data from the external API (Server-to-Server request)
        const response = await fetch(EXTERNAL_API_URL, {
            // Disable caching for real-time data
            cache: 'no-store',
        });

        if (!response.ok) {
            // Forward the non-200 status code from the external API
            return new Response(await response.text(), {
                status: response.status,
                statusText: response.statusText,
            });
        }

        // 2. Return the data to the client component
        return new Response(response.body, {
            headers: {
                'Content-Type': 'application/json',
                // Important: Next.js handles the necessary CORS headers for your local environment
            },
        });
    } catch (error) {
        console.error("Proxy error fetching markets:", error);
        return new Response(JSON.stringify({ message: "Internal server error connecting to external API." }), {
            status: 500,
        });
    }
}