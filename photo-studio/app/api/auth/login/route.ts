import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

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

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    await setSessionCookie(user.username);

    return NextResponse.json({ success: true, username: user.username });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Erro interno ao realizar login." },
      { status: 500 }
    );
  }
}
