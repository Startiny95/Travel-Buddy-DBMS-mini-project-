import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, age, gender, occupation, homeAddress } = body;

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ message: "Email already registered." }, { status: 400 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into DB
    await db.query(
      `INSERT INTO users (name, email, password, age, gender, occupation, home_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, age, gender, occupation, homeAddress]
    );

    return NextResponse.json({ message: "Account created successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }
}