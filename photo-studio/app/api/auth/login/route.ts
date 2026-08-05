import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Usuário e senha obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    console.log("[DEBUG LOGIN] Received username:", username);
    console.log("[DEBUG LOGIN] AUTH_USERNAME exists:", !!process.env.AUTH_USERNAME);
    console.log("[DEBUG LOGIN] AUTH_PASSWORD exists:", !!process.env.AUTH_PASSWORD);
    console.log("[DEBUG LOGIN] Username matches AUTH_USERNAME:", username === process.env.AUTH_USERNAME);
    console.log("[DEBUG LOGIN] Prisma user found:", !!user);
    if (user) {
      console.log("[DEBUG LOGIN] Prisma password match:", verifyPassword(password, user.passwordHash));
    }
    
    // Also check if they intended to match env vars
    const envPasswordMatch = password === process.env.AUTH_PASSWORD;
    console.log("[DEBUG LOGIN] Password matches AUTH_PASSWORD:", envPasswordMatch);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const token = signToken(user.username);
    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Erro interno ao realizar login." },
      { status: 500 }
    );
  }
}
