import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 3) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const res = await fetch(
            `https://api.openrouteservice.org/geocode/autocomplete?api_key=${process.env.ORS_API_KEY}&text=${encodeURIComponent(q)}&boundary.country=IN&size=5`,
            { headers: { Accept: "application/json" } }
        );
        const data = await res.json();

        const suggestions = (data.features || []).map(
            (f) => f.properties.label
        );

        return NextResponse.json({ suggestions });
    } catch (err) {
        return NextResponse.json({ suggestions: [] });
    }
}