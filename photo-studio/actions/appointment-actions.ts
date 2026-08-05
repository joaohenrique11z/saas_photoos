"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { appointmentSchema, updateAppointmentSchema } from "@/lib/validations";

export async function getAppointments(statusFilter?: string, search?: string) {
  await requireAuth();
  const whereClause: any = {};
  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }
  if (search && search.trim() !== "") {
    const s = search.trim();
    whereClause.OR = [
      { serviceName: { contains: s } },
      { location: { contains: s } },
      { summaryNotes: { contains: s } },
      { client: { name: { contains: s } } },
      { client: { email: { contains: s } } },
      { client: { phone: { contains: s } } },
      { client: { notes: { contains: s } } },
      { client: { address: { contains: s } } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { date: "asc" },
    include: {
      client: true,
    },
  });

  return appointments.map((a: any) => ({
    ...a,
    price: typeof (a.price as any)?.toNumber === "function"
      ? (a.price as any).toNumber()
      : Number(a.price),
  }));
}

export async function getAppointmentById(id: string) {
  await requireAuth();
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
    price: typeof (appointment.price as any)?.toNumber === "function"
      ? (appointment.price as any).toNumber()
      : Number(appointment.price),
    expenses: appointment.expenses.map((e) => ({
      ...e,
      amount: typeof (e.amount as any)?.toNumber === "function"
        ? (e.amount as any).toNumber()
        : Number(e.amount),
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
  await requireAuth();

  const parsedData = appointmentSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.issues[0].message);
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientId: parsedData.data.clientId,
        serviceName: parsedData.data.serviceName,
        date: parsedData.data.date,
        time: parsedData.data.time,
        location: parsedData.data.location,
        price: parsedData.data.price,
        status: parsedData.data.status || "ORCAMENTO",
        summaryNotes: parsedData.data.summaryNotes,
      },
    });
    revalidatePath("/atendimentos");
    revalidatePath("/");
    return appointment;
  } catch (error) {
    throw new Error("Erro ao criar atendimento.");
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: "ORCAMENTO" | "AGENDADO" | "REALIZADO" | "ENTREGUE" | "CANCELADO"
) {
  await requireAuth();
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/atendimentos");
  revalidatePath("/");
  return appointment;
}

export async function updateAppointment(
  id: string,
  data: {
    serviceName?: string;
    date?: Date;
    time?: string;
    location?: string;
    price?: number;
    status?: any;
    summaryNotes?: string;
  }
) {
  await requireAuth();

  const parsedData = updateAppointmentSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.issues[0].message);
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: parsedData.data,
    });
    revalidatePath("/atendimentos");
    revalidatePath(`/atendimentos/${id}`);
    revalidatePath("/");
    return appointment;
  } catch (error) {
    throw new Error("Erro ao atualizar atendimento.");
  }
}

export async function deleteAppointment(id: string) {
  await requireAuth();
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/atendimentos");
  revalidatePath("/");
}
