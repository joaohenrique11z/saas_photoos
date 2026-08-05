"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function wipeDatabase() {
  await requireAuth();

  try {
    await prisma.$transaction(async (tx) => {
      // With cascade delete, we might only need to delete clients
      // but to be safe we can delete in order:
      await tx.expense.deleteMany({});
      await tx.appointment.deleteMany({});
      await tx.client.deleteMany({});
      // Users are kept intact
    });

    revalidatePath("/");
    revalidatePath("/clientes");
    revalidatePath("/atendimentos");
    revalidatePath("/financeiro");

    return { success: true };
  } catch (error) {
    console.error("Error wiping database:", error);
    throw new Error("Erro ao limpar banco de dados.");
  }
}
