// src/app/api/auth/signin/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Find the user by their email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Check if the user exists
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 3. Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    // 4. Check if the password is correct
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 5. If everything is correct, return a success response
    // Be sure to omit sensitive information like the password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      { message: "Sign-in successful", user: userWithoutPassword },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
