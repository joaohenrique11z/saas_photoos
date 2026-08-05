import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    await prisma.expense.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.client.deleteMany();

    revalidatePath("/");
    revalidatePath("/clientes");
    revalidatePath("/atendimentos");
    revalidatePath("/financeiro");

    return NextResponse.json({
      success: true,
      message: "Banco de dados limpo com sucesso (Clientes, Atendimentos e Despesas zerados).",
    });
  } catch (error: any) {
    console.error("Erro ao limpar banco de dados:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao limpar banco de dados." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Envie uma requisição POST para /api/reset-db para limpar todos os dados de teste (Clientes, Atendimentos e Despesas).",
  });
}
