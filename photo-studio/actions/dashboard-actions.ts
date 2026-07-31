"use server";

import { prisma } from "@/lib/db";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export async function getDashboardSummary() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  const [
    totalClients,
    totalAppointments,
    realizedAppointments,
    allAppointments,
    allExpenses,
    recentAppointments,
    recentClients,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "REALIZADO" } }),
    prisma.appointment.findMany({
      select: {
        id: true,
        price: true,
        status: true,
        date: true,
        time: true,
        serviceName: true,
        clientId: true,
        client: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.expense.findMany({
      select: { amount: true, date: true },
    }),
    prisma.appointment.findMany({
      take: 6,
      orderBy: { date: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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

  // Today's appointments
  const todayAppointments = allAppointments
    .filter((a) => {
      const aDateStr = new Date(a.date).toISOString().split("T")[0];
      return aDateStr === todayStr;
    })
    .map((a) => ({
      ...a,
      price: Number(a.price),
    }));

  // Upcoming appointments (future dates)
  const upcomingAppointments = allAppointments
    .filter((a) => {
      const aDate = new Date(a.date);
      return (
        aDate >= new Date(todayStr) &&
        (a.status === "AGENDADO" || a.status === "ORCAMENTO")
      );
    })
    .slice(0, 5)
    .map((a) => ({
      ...a,
      price: Number(a.price),
    }));

  // Pending payments (appointments scheduled or budgeting)
  const pendingPayments = allAppointments
    .filter((a) => a.status === "AGENDADO" || a.status === "ORCAMENTO")
    .reduce((acc, a) => acc + Number(a.price), 0);

  // Daily revenue (realized today)
  const dailyRevenue = allAppointments
    .filter((a) => {
      const aDateStr = new Date(a.date).toISOString().split("T")[0];
      return (
        aDateStr === todayStr &&
        (a.status === "REALIZADO" || a.status === "ENTREGUE")
      );
    })
    .reduce((acc, a) => acc + Number(a.price), 0);

  // Monthly revenue (current month)
  const monthlyRevenue = allAppointments
    .filter((a) => {
      const d = new Date(a.date);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        (a.status === "REALIZADO" || a.status === "ENTREGUE")
      );
    })
    .reduce((acc, a) => acc + Number(a.price), 0);

  // Previous month revenue
  const prevMonthRevenue = allAppointments
    .filter((a) => {
      const d = new Date(a.date);
      return (
        d.getMonth() === prevMonth &&
        d.getFullYear() === prevYear &&
        (a.status === "REALIZADO" || a.status === "ENTREGUE")
      );
    })
    .reduce((acc, a) => acc + Number(a.price), 0);

  const monthlyGrowth =
    prevMonthRevenue > 0
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : monthlyRevenue > 0
      ? 100
      : 0;

  return {
    totalClients,
    totalAppointments,
    realizedAppointments,
    totalRevenue,
    totalExpense,
    netProfit,
    todayAppointments,
    upcomingAppointments,
    recentClients,
    pendingPayments,
    dailyRevenue,
    monthlyRevenue,
    monthlyGrowth,
    recentAppointments: recentAppointments.map((a) => ({
      ...a,
      price: Number(a.price),
    })),
  };
}

export async function getFinancialMonthlyReport() {
  const [allAppointments, allExpenses, allClients] = await Promise.all([
    prisma.appointment.findMany({
      include: { client: true },
      orderBy: { date: "asc" },
    }),
    prisma.expense.findMany({
      orderBy: { date: "asc" },
    }),
    prisma.client.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Determine months to display (e.g. all 12 months of 2026 or grouped by existing years)
  // We will build a report for each month that has data or default 12 months of current year
  const currentYear = new Date().getFullYear();
  const yearToReport =
    allAppointments.length > 0
      ? new Date(allAppointments[allAppointments.length - 1].date).getFullYear()
      : currentYear;

  const monthlyData = MONTH_NAMES.map((monthName, idx) => {
    const appsInMonth = allAppointments.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() === idx && d.getFullYear() === yearToReport;
    });

    const expensesInMonth = allExpenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === idx && d.getFullYear() === yearToReport;
    });

    const newClientsInMonth = allClients.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === idx && d.getFullYear() === yearToReport;
    });

    const revenue = appsInMonth
      .filter((a) => a.status === "REALIZADO" || a.status === "ENTREGUE")
      .reduce((acc, a) => acc + Number(a.price), 0);

    const expenseTotal = expensesInMonth.reduce(
      (acc, e) => acc + Number(e.amount),
      0
    );

    const uniqueClientIds = new Set(appsInMonth.map((a) => a.clientId));

    return {
      monthIndex: idx,
      monthName,
      year: yearToReport,
      appointmentsCount: appsInMonth.length,
      clientsCount: uniqueClientIds.size,
      revenue,
      expenses: expenseTotal,
      profit: revenue - expenseTotal,
      newClientsCount: newClientsInMonth.length,
      appointmentsList: appsInMonth.map((a) => ({
        id: a.id,
        serviceName: a.serviceName,
        clientName: a.client?.name || "Cliente",
        date: a.date,
        price: Number(a.price),
        status: a.status,
      })),
      expensesList: expensesInMonth.map((e) => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        date: e.date,
      })),
    };
  });

  // Calculate charts data
  const revenueChart = monthlyData.map((m) => ({
    label: m.monthName.slice(0, 3),
    receita: m.revenue,
    despesa: m.expenses,
    lucro: m.profit,
  }));

  const growthChart = monthlyData.map((m, idx) => {
    const prevRevenue = idx > 0 ? monthlyData[idx - 1].revenue : 0;
    const growth =
      prevRevenue > 0
        ? ((m.revenue - prevRevenue) / prevRevenue) * 100
        : m.revenue > 0
        ? 100
        : 0;
    return {
      label: m.monthName.slice(0, 3),
      crescimento: Math.round(growth),
    };
  });

  const appointmentsChart = monthlyData.map((m) => ({
    label: m.monthName.slice(0, 3),
    atendimentos: m.appointmentsCount,
    novosClientes: m.newClientsCount,
  }));

  // Payment methods / Service category distribution (using serviceName as category)
  const categoryMap: Record<string, number> = {};
  allAppointments
    .filter((a) => a.status === "REALIZADO" || a.status === "ENTREGUE")
    .forEach((a) => {
      const cat = a.serviceName || "Serviço Geral";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(a.price);
    });

  const paymentMethodsChart = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const realizedApps = allAppointments.filter(
    (a) => a.status === "REALIZADO" || a.status === "ENTREGUE"
  );
  const totalRev = realizedApps.reduce((acc, a) => acc + Number(a.price), 0);
  const averageTicket =
    realizedApps.length > 0 ? totalRev / realizedApps.length : 0;

  const totalNewClients = allClients.length;

  return {
    year: yearToReport,
    monthlyData,
    revenueChart,
    growthChart,
    appointmentsChart,
    paymentMethodsChart,
    averageTicket,
    totalNewClients,
  };
}
