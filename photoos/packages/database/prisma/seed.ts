import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hash bcrypt válido para senha "123456" ($2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfI542)
const DEFAULT_PASSWORD_HASH =
  '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfI542';

async function main() {
  console.log('🌱 Iniciando Seed Completo do PhotoOS...');

  // 1. Criar Tenant "Lumière Studio"
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'lumiere-studio' },
    update: {},
    create: {
      nome: 'Lumière Studio Fotografia',
      slug: 'lumiere-studio',
      plano: 'pro',
      corPrimaria: '#6366f1',
    },
  });
  console.log(`✅ Tenant criado/verificado: ${tenant.nome} (${tenant.slug})`);

  // 2. Criar Usuários (Admin e Fotógrafo)
  const admin = await prisma.usuario.upsert({
    where: {
      tenantId_email: {
        email: 'admin@lumiere.com',
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Alexandre Lumière (Admin)',
      email: 'admin@lumiere.com',
      senhaHash: DEFAULT_PASSWORD_HASH,
      papel: 'ADMIN',
      ativo: true,
    },
  });

  const fotografo = await prisma.usuario.upsert({
    where: {
      tenantId_email: {
        email: 'camila@lumiere.com',
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Camila Santos (Fotógrafa)',
      email: 'camila@lumiere.com',
      senhaHash: DEFAULT_PASSWORD_HASH,
      papel: 'FOTOGRAFO',
      ativo: true,
    },
  });
  console.log(`✅ Usuários criados: ${admin.email} (ADMIN), ${fotografo.email} (FOTÓGRAFA) [Senha: 123456]`);

  // 3. Criar Clientes com Timeline
  const cliente1 = await prisma.cliente.create({
    data: {
      tenantId: tenant.id,
      nomeCompleto: 'Marina e Ricardo',
      email: 'marina@casamento.com',
      whatsapp: '+55 11 99999-1111',
      cpf: '111.222.333-44',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      tenantId: tenant.id,
      nomeCompleto: 'Juliana Paes (Gestante)',
      email: 'juliana@gestante.com',
      whatsapp: '+55 11 98888-2222',
      cpf: '222.333.444-55',
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      tenantId: tenant.id,
      nomeCompleto: 'TechSolutions SA',
      email: 'contato@techsolutions.com',
      whatsapp: '+55 11 97777-3333',
      cpf: '12.345.678/0001-90',
    },
  });

  await prisma.interacaoTimeline.createMany({
    data: [
      {
        tenantId: tenant.id,
        clienteId: cliente1.id,
        tipo: 'cadastro',
        descricao: 'Cliente cadastrado via indicação para Casamento Completo.',
      },
      {
        tenantId: tenant.id,
        clienteId: cliente1.id,
        tipo: 'orcamento_enviado',
        descricao: 'Orçamento com pacote completo e 2 fotógrafos enviado por e-mail.',
      },
      {
        tenantId: tenant.id,
        clienteId: cliente2.id,
        tipo: 'reuniao_agendada',
        descricao: 'Reunião de alinhamento para figurino e estúdio agendada.',
      },
    ],
  });
  console.log('✅ 3 Clientes criados com interações históricas na timeline');

  // 4. Criar 3 Serviços
  const servicoCasamento = await prisma.servico.create({
    data: {
      tenantId: tenant.id,
      nome: 'Casamento Completo (Making Of + Cerimônia + Festa)',
      descricao: 'Cobertura fotográfica com 2 fotógrafos, álbum impresso e galeria digital com 150 fotos inclusas.',
      tempoMedioMin: 480,
      valorPadrao: 6500.0,
      qtdFotosInclusas: 150,
      valorFotoExtra: 25.0,
    },
  });

  const servicoGestante = await prisma.servico.create({
    data: {
      tenantId: tenant.id,
      nome: 'Ensaio Gestante em Estúdio',
      descricao: 'Sessão com 3 figurinos em estúdio climatizado. 25 fotos em alta resolução editadas.',
      tempoMedioMin: 90,
      valorPadrao: 1200.0,
      qtdFotosInclusas: 25,
      valorFotoExtra: 35.0,
    },
  });

  const servicoCorporativo = await prisma.servico.create({
    data: {
      tenantId: tenant.id,
      nome: 'Retratos Corporativos Executivos',
      descricao: 'Sessão em escritório ou fundo infinito para LinkedIn e imprensa. 5 fotos editadas por pessoa.',
      tempoMedioMin: 60,
      valorPadrao: 800.0,
      qtdFotosInclusas: 5,
      valorFotoExtra: 45.0,
    },
  });
  console.log('✅ 3 Serviços cadastrados (Casamento, Gestante, Corporativo)');

  // 5. Criar 3 Ensaios em diferentes status
  const ensaio1 = await prisma.ensaio.create({
    data: {
      tenantId: tenant.id,
      clienteId: cliente1.id,
      servicoId: servicoCasamento.id,
      status: 'EDICAO',
      dataHora: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 dias atrás
      local: 'Espaço Jardim da Luz - São Paulo',
      valorTotal: 6500.0,
    },
  });

  const ensaio2 = await prisma.ensaio.create({
    data: {
      tenantId: tenant.id,
      clienteId: cliente2.id,
      servicoId: servicoGestante.id,
      status: 'AGENDADO',
      dataHora: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 dias à frente
      local: 'Lumière Studio Principal',
      valorTotal: 1200.0,
    },
  });

  const ensaio3 = await prisma.ensaio.create({
    data: {
      tenantId: tenant.id,
      clienteId: cliente3.id,
      servicoId: servicoCorporativo.id,
      status: 'ORCAMENTO_ENVIADO',
      dataHora: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      local: 'Sede da TechSolutions SA',
      valorTotal: 800.0,
    },
  });

  // Tarefas Workflow para Ensaio 1 e 2
  await prisma.tarefaWorkflow.createMany({
    data: [
      {
        tenantId: tenant.id,
        ensaioId: ensaio1.id,
        titulo: 'Backup dos cartões de memória (RAW) em 2 HDs',
        dataExecucao: new Date(),
        concluida: true,
      },
      {
        tenantId: tenant.id,
        ensaioId: ensaio1.id,
        titulo: 'Curadoria e seleção inicial (Lightroom)',
        dataExecucao: new Date(),
        concluida: true,
      },
      {
        tenantId: tenant.id,
        ensaioId: ensaio1.id,
        titulo: 'Tratamento de cores e retoque final',
        dataExecucao: new Date(Date.now() + 1000 * 60 * 60 * 24),
        concluida: false,
      },
      {
        tenantId: tenant.id,
        ensaioId: ensaio2.id,
        titulo: 'Confirmar figurinos e maquiador parceiro',
        dataExecucao: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        concluida: false,
      },
    ],
  });
  console.log('✅ 3 Ensaios e Tarefas de Workflow criados');

  // 6. Modelo e Contrato Assinado
  const modeloContrato = await prisma.contratoModelo.create({
    data: {
      tenantId: tenant.id,
      nome: 'Contrato Padrão de Fotografia de Casamento',
      conteudoHtml:
        'CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nESTÚDIO: {{TENANT_NOME}}\nCLIENTE: {{CLIENTE_NOME}}\nSERVIÇO: {{SERVICO_NOME}}\nVALOR: R$ {{ENSAIO_VALOR}}\n\nAs partes concordam com os termos e cessão de direitos de imagem para portfólio.',
    },
  });

  await prisma.contrato.create({
    data: {
      tenantId: tenant.id,
      ensaioId: ensaio1.id,
      conteudoFinal:
        'CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nESTÚDIO: Lumière Studio Fotografia\nCLIENTE: Marina e Ricardo\nSERVIÇO: Casamento Completo (Making Of + Cerimônia + Festa)\nVALOR: R$ 6500\n\nAs partes concordam com os termos e cessão de direitos de imagem para portfólio.',
      assinado: true,
      assinadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      ipAssinatura: '192.168.1.104',
      hashDocumento: 'a8f5f167f44f4964e6c998dee827110c73372c3d596443c683b544cc3505c6d0',
    },
  });
  console.log('✅ Modelo de contrato criado e 1 Contrato assinado com hash SHA-256');

  // 7. Galeria de Provas com 6 Fotos
  const galeria = await prisma.galeria.create({
    data: {
      tenantId: tenant.id,
      ensaioId: ensaio1.id,
      limiteSelecao: 4, // 4 inclusas, se escolher mais de 4 é extra
      linkPublico: 'demo-casamento-marina-2026',
      finalizada: false,
    },
  });

  const fotosDemo = [
    {
      ordem: 1,
      urlOriginal: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    },
    {
      ordem: 2,
      urlOriginal: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    },
    {
      ordem: 3,
      urlOriginal: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    },
    {
      ordem: 4,
      urlOriginal: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    },
    {
      ordem: 5,
      urlOriginal: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
    },
    {
      ordem: 6,
      urlOriginal: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      urlBaixaRes: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
    },
  ];

  for (const foto of fotosDemo) {
    await prisma.fotoGaleria.create({
      data: {
        tenantId: tenant.id,
        galeriaId: galeria.id,
        ordem: foto.ordem,
        urlOriginal: foto.urlOriginal,
        urlBaixaRes: foto.urlBaixaRes,
        selecionada: foto.ordem <= 2, // pre-seleciona as duas primeiras
      },
    });
  }
  console.log(`✅ Galeria de Provas criada com link: http://localhost:3002/g/${galeria.linkPublico}`);

  // 8. Transações Financeiras (Receitas e Despesas)
  await prisma.transacaoFinanceira.createMany({
    data: [
      {
        tenantId: tenant.id,
        ensaioId: ensaio1.id,
        tipo: 'RECEITA',
        categoria: 'Serviço Principal',
        descricao: 'Receita — Casamento Completo (Marina e Ricardo)',
        valor: 6500.0,
        status: 'PAGO',
        dataVencimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        tenantId: tenant.id,
        ensaioId: ensaio1.id,
        tipo: 'DESPESA',
        categoria: 'Custo Ensaio',
        descricao: 'Segundo Fotógrafo Freelancer (Casamento Marina)',
        valor: 950.0,
        status: 'PAGO',
        dataVencimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        tenantId: tenant.id,
        ensaioId: ensaio2.id,
        tipo: 'RECEITA',
        categoria: 'Serviço Principal',
        descricao: 'Receita — Ensaio Gestante em Estúdio (Juliana Paes)',
        valor: 1200.0,
        status: 'PENDENTE',
        dataVencimento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      },
      {
        tenantId: tenant.id,
        tipo: 'DESPESA',
        categoria: 'Custos Fixos',
        descricao: 'Assinatura Adobe CC / Lightroom & Photoshop',
        valor: 275.0,
        status: 'PAGO',
        dataVencimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        dataPagamento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
    ],
  });
  console.log('✅ 4 Transações Financeiras geradas (Receitas, Despesas de Ensaio e Custo Fixo)');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('---------------------------------------------------------');
  console.log('🧑‍💼 ESTÚDIO DEMO: Lumière Studio (slug: lumiere-studio)');
  console.log('📧 ADMIN LOGIN: admin@lumiere.com | SENHA: 123456');
  console.log('📧 FOTÓGRAFO: camila@lumiere.com  | SENHA: 123456');
  console.log(`🔗 GALERIA PROVAS CLIENTE: http://localhost:3002/g/${galeria.linkPublico}`);
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
