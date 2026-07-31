"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getClients(search?: string) {
  return prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function createClient(data: {
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  notes?: string;
}) {
  const client = await prisma.client.create({ data });
  revalidatePath("/clientes");
  return client;
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
  const client = await prisma.client.update({ where: { id }, data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return client;
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
}
