import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  instagram: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "O cliente é obrigatório."),
  serviceName: z.string().min(2, "O nome do serviço deve ter pelo menos 2 caracteres."),
  date: z.date(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido."),
  location: z.string().optional(),
  price: z.number().min(0, "O preço deve ser maior ou igual a zero."),
  status: z.enum(["ORCAMENTO", "AGENDADO", "REALIZADO", "ENTREGUE", "CANCELADO"]).optional(),
  summaryNotes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  serviceName: z.string().min(2, "O nome do serviço deve ter pelo menos 2 caracteres.").optional(),
  date: z.date().optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido.").optional(),
  location: z.string().optional(),
  price: z.number().min(0, "O preço deve ser maior ou igual a zero.").optional(),
  status: z.enum(["ORCAMENTO", "AGENDADO", "REALIZADO", "ENTREGUE", "CANCELADO"]).optional(),
  summaryNotes: z.string().optional(),
});
