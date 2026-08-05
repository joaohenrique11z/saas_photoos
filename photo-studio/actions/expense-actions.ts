"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  await requireAuth();
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    include: {
      appointment: {
        select: {
          id: true,
          serviceName: true,
          client: { select: { name: true } },
        },
      },
    },
  });

  return expenses.map((e: any) => ({
    ...e,
    amount: Number(e.amount),
  }));
}

export async function createExpense(data: {
  description: string;
  amount: number;
  date: Date;
  appointmentId?: string | null;
}) {
  await requireAuth();
  const expense = await prisma.expense.create({
    data: {
      description: data.description,
      amount: data.amount,
      date: data.date,
      appointmentId: data.appointmentId || null,
    },
  });
  revalidatePath("/financeiro");
  revalidatePath("/");
  return expense;
}

export async function updateExpense(
  id: string,
  data: {
    description?: string;
    amount?: number;
    date?: Date;
  }
) {
  await requireAuth();
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.date !== undefined ? { date: data.date } : {}),
    },
  });
  revalidatePath("/financeiro");
  revalidatePath("/");
  return expense;
}

export async function deleteExpense(id: string) {
  await requireAuth();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath("/");
}
