"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  await requireAuth();
  await prisma.expense.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();

  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/atendimentos");
  revalidatePath("/financeiro");

  return { success: true, message: "Todos os dados de teste foram removidos." };
}
