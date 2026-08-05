"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function getClients(search?: string) {
  await requireAuth();
  return prisma.client.findMany({
    where: search
      ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { whatsapp: { contains: search } },
          { instagram: { contains: search } },
          { notes: { contains: search } },
          { address: { contains: search } },
        ],
      }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getClientById(id: string) {
  await requireAuth();
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!client) return null;

  return {
    ...client,
    appointments: client.appointments.map((a: any) => ({
      ...a,
      price: typeof (a.price as any)?.toNumber === "function"
        ? (a.price as any).toNumber()
        : Number(a.price),
    })),
  };
}

import { clientSchema } from "@/lib/validations";

export async function createClient(data: {
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  notes?: string;
}) {
  await requireAuth();

  const parsedData = clientSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.issues[0].message);
  }

  try {
    const client = await prisma.client.create({ data: parsedData.data });
    revalidatePath("/clientes");
    return client;
  } catch (error) {
    throw new Error("Erro ao criar cliente.");
  }
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    instagram?: string;
    notes?: string;
  }
) {
  await requireAuth();

  // Create a partial schema for updates
  const parsedData = clientSchema.partial().safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.issues[0].message);
  }

  try {
    const client = await prisma.client.update({ where: { id }, data: parsedData.data });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return client;
  } catch (error) {
    throw new Error("Erro ao atualizar cliente.");
  }
}

export async function deleteClient(id: string) {
  await requireAuth();
  await prisma.$transaction(async (tx: any) => {
    const appointments = await tx.appointment.findMany({
      where: { clientId: id },
      select: { id: true },
    });
    const appointmentIds = appointments.map((a: any) => a.id);
    if (appointmentIds.length > 0) {
      await tx.expense.deleteMany({
        where: { appointmentId: { in: appointmentIds } },
      });
      await tx.appointment.deleteMany({
        where: { clientId: id },
      });
    }
    await tx.client.delete({ where: { id } });
  });
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/atendimentos");
  revalidatePath("/financeiro");
}
