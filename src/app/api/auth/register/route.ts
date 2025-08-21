// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
// You might want to create this utility file if you haven't already
// lib/prisma.ts
// import { PrismaClient } from '@prisma/client'
// const prisma = global.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
// export default prisma;

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // 1. Basic input validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Missing username, email, or password" },
        { status: 400 },
      );
    }

    // 2. Check if a user with that email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with that email or username already exists" },
        { status: 409 }, // Conflict
      );
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        hashedPassword,
      },
      select: {
        // Select only what you need to return, never the hashedPassword!
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // 5. Return success response
    return NextResponse.json(
      { message: "User registered successfully!", user: newUser },
      { status: 201 }, // Created
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
