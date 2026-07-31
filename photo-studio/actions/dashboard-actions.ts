"use server";

import { prisma } from "@/lib/db";

export async function getDashboardSummary() {
  const [
    totalClients,
    totalAppointments,
    realizedAppointments,
    allAppointments,
    allExpenses,
    recentAppointments,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "REALIZADO" } }),
    prisma.appointment.findMany({
      select: { price: true, status: true, date: true },
    }),
    prisma.expense.findMany({
      select: { amount: true, date: true },
    }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { date: "asc" },
      include: { client: true },
    }),
  ]);

  const totalRevenue = allAppointments
    .filter((a) => a.status === "REALIZADO" || a.status === "ENTREGUE")
    .reduce((acc, a) => acc + Number(a.price), 0);

  const totalExpense = allExpenses.reduce(
    (acc, e) => acc + Number(e.amount),
    0
  );

  const netProfit = totalRevenue - totalExpense;

  return {
    totalClients,
    totalAppointments,
    realizedAppointments,
    totalRevenue,
    totalExpense,
    netProfit,
    recentAppointments: recentAppointments.map((a) => ({
      ...a,
      price: Number(a.price),
    })),
  };
}
