"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAppointments(statusFilter?: string) {
  const appointments = await prisma.appointment.findMany({
    where:
      statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter as any }
        : undefined,
    orderBy: { date: "asc" },
    include: {
      client: true,
    },
  });

  return appointments.map((a) => ({
    ...a,
    price: Number(a.price),
  }));
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      client: true,
      expenses: true,
    },
  });

  if (!appointment) return null;

  return {
    ...appointment,
    price: Number(appointment.price),
    expenses: appointment.expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    })),
  };
}

export async function createAppointment(data: {
  clientId: string;
  serviceName: string;
  date: Date;
  time: string;
  location?: string;
  price: number;
  status?: any;
  summaryNotes?: string;
}) {
  const appointment = await prisma.appointment.create({
    data: {
      clientId: data.clientId,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
      location: data.location,
      price: data.price,
      status: data.status || "ORCAMENTO",
      summaryNotes: data.summaryNotes,
    },
  });
  revalidatePath("/atendimentos");
  revalidatePath("/");
  return appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: "ORCAMENTO" | "AGENDADO" | "REALIZADO" | "ENTREGUE" | "CANCELADO"
) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/atendimentos");
  revalidatePath("/");
  return appointment;
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/atendimentos");
  revalidatePath("/");
}
