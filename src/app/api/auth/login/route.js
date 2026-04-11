import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user by email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "No account found with this email." }, { status: 404 });
    }

    const user = rows[0];

    // Compare entered password with hashed password in DB
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful!",
      user: {
        name: user.name,
        email: user.email,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }
}