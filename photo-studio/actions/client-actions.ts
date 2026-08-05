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
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { whatsapp: { contains: search, mode: "insensitive" } },
          { instagram: { contains: search, mode: "insensitive" } },
          { notes: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
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
  try {
    // Prisma Cascade handles related Appointments and Expenses automatically
    await prisma.client.delete({ where: { id } });
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Erro ao excluir cliente. Verifique as dependências.");
  }
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/atendimentos");
  revalidatePath("/financeiro");
}
