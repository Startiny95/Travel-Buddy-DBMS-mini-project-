import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const [result] = await db.query("DELETE FROM trips WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Trip deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
