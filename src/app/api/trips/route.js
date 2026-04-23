import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const [rows] = await db.query("SELECT * FROM trips ORDER BY date DESC, id DESC");
    return NextResponse.json({ trips: rows });
  } catch (error) {
    console.error("GET /api/trips error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, start_place, end_place, date, distance_km, transport } = body;

    if (!title || !start_place || !end_place) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [result] = await db.query(
      "INSERT INTO trips (title, start_place, end_place, date, distance_km, transport, is_imported_from_google) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, start_place, end_place, date || null, distance_km ? parseFloat(distance_km) : null, transport || "car", false]
    );

    return NextResponse.json({ message: "Trip added successfully", id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips error:", error);
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}
