import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Photo Studio (Single-User)...');

  const username = process.env.AUTH_USERNAME || 'fotografa';
  const password = process.env.AUTH_PASSWORD || 'defina-uma-senha-forte-aqui';

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash: hashPassword(password),
    },
    create: {
      username,
      passwordHash: hashPassword(password),
    },
  });

  console.log(`✅ Usuário criado/verificado: ${user.username}`);

  // Criar clientes de demonstração se não existirem
  const countClients = await prisma.client.count();
  if (countClients === 0) {
    const cli1 = await prisma.client.create({
      data: {
        name: 'Ana Carolina Souza',
        phone: '(11) 98765-4321',
        whatsapp: '(11) 98765-4321',
        email: 'ana.souza@email.com',
        instagram: '@anacarolsouza',
        notes: 'Cliente prefere ensaios ao ar livre no fim da tarde.',
      },
    });

    const cli2 = await prisma.client.create({
      data: {
        name: 'Marcos & Fernanda (Casamento)',
        phone: '(11) 97777-8888',
        whatsapp: '(11) 97777-8888',
        email: 'marcosfer@email.com',
        instagram: '@fe_marcos',
        notes: 'Casamento agendado em dezembro na Fazenda Bela Vista.',
      },
    });

    const cli3 = await prisma.client.create({
      data: {
        name: 'Juliana Lima',
        phone: '(11) 96543-2100',
        whatsapp: '(11) 96543-2100',
        email: 'ju.lima@email.com',
        instagram: '@julianalima.foto',
        notes: 'Ensaio corporativo para LinkedIn e site pessoal.',
      },
    });

    console.log('✅ Clientes de demonstração gerados.');

    // Criar Atendimentos
    const app1 = await prisma.appointment.create({
      data: {
        clientId: cli1.id,
        serviceName: 'Ensaio Externo Família',
        date: new Date('2026-08-10T14:00:00.000Z'),
        time: '16:00',
        location: 'Parque Ibirapuera',
        price: '1200.00',
        status: 'AGENDADO',
        summaryNotes:
          'Ensaio com 2 crianças pequenas, levar mantas e adereços.',
      },
    });

    const _app2 = await prisma.appointment.create({
      data: {
        clientId: cli2.id,
        serviceName: 'Cobertura Casamento Civil + Recepção',
        date: new Date('2026-08-15T10:00:00.000Z'),
        time: '10:30',
        status: 'AGENDADO',
        price: 2500.0,
        location: 'Cartório Central & Restaurante',
        summaryNotes: 'Casamento apenas para íntimos. Foco em fotos espontâneas.',
      },
    });

    const _app3 = await prisma.appointment.create({
      data: {
        clientId: cli3.id,
        serviceName: 'Retrato Corporativo Executivo',
        date: new Date('2026-07-25T09:00:00.000Z'),
        time: '09:00',
        status: 'ENTREGUE',
        price: 600.0,
        location: 'Estúdio',
        summaryNotes: '3 looks diferentes. Fundo escuro e branco.',
      },
    });

    console.log('✅ Atendimentos de demonstração gerados.');

    // Criar Despesas
    await prisma.expense.create({
      data: {
        appointmentId: app1.id,
        description: 'Maquiador parceiro (Ensaio Família)',
        amount: '250.00',
        date: new Date('2026-08-10T00:00:00.000Z'),
      },
    });

    await prisma.expense.create({
      data: {
        appointmentId: null,
        description: 'Assinatura Adobe Creative Cloud',
        amount: '175.00',
        date: new Date('2026-07-01T00:00:00.000Z'),
      },
    });

    await prisma.expense.create({
      data: {
        appointmentId: null,
        description: 'Manutenção Lente 50mm 1.4',
        amount: '380.00',
        date: new Date('2026-07-15T00:00:00.000Z'),
      },
    });

    console.log('✅ Despesas de demonstração geradas.');
  }

  console.log('🎉 Seed completo com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
