"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
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

  return expenses.map((e) => ({
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

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath("/");
}
