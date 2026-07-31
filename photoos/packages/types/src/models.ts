import { PapelUsuario, StatusEnsaio, TipoTransacao, StatusTransacao } from './enums';

export interface ITenant {
  id: string;
  nome: string;
  slug: string;
  logoUrl?: string | null;
  corPrimaria?: string | null;
  plano: string;
  criadoEm: Date | string;
}

export interface IUsuario {
  id: string;
  tenantId: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: Date | string;
}

export interface ICliente {
  id: string;
  tenantId: string;
  nomeCompleto: string;
  fotoUrl?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cpf?: string | null;
  dataNascimento?: Date | string | null;
  instagram?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
  origem?: string | null;
  criadoEm: Date | string;
}

export interface IInteracaoTimeline {
  id: string;
  tenantId: string;
  clienteId: string;
  tipo: string;
  descricao: string;
  metadata?: Record<string, any> | null;
  criadoEm: Date | string;
}

export interface IServico {
  id: string;
  tenantId: string;
  nome: string;
  descricao?: string | null;
  valorPadrao: number | string;
  tempoMedioMin?: number | null;
  qtdFotosInclusas?: number | null;
  valorFotoExtra?: number | string | null;
  qtdPessoas?: number | null;
  local?: string | null;
  observacoes?: string | null;
  ativo: boolean;
}

export interface IEnsaio {
  id: string;
  tenantId: string;
  clienteId: string;
  servicoId: string;
  dataHora: Date | string;
  local?: string | null;
  valorTotal: number | string;
  sinalPago: number | string;
  status: StatusEnsaio;
  checklistEquipamentos?: Record<string, any> | null;
  criadoEm: Date | string;
  cliente?: ICliente;
  servico?: IServico;
}

export interface ITarefaWorkflow {
  id: string;
  tenantId: string;
  ensaioId: string;
  titulo: string;
  dataExecucao: Date | string;
  concluida: boolean;
}

export interface IDespesaEnsaio {
  id: string;
  tenantId: string;
  ensaioId: string;
  descricao: string;
  categoria: string;
  valor: number | string;
  criadoEm: Date | string;
}

export interface ITransacaoFinanceira {
  id: string;
  tenantId: string;
  ensaioId?: string | null;
  clienteId?: string | null;
  tipo: TipoTransacao;
  categoria?: string | null;
  descricao: string;
  valor: number | string;
  metodoPagamento?: string | null;
  status: StatusTransacao;
  dataVencimento?: Date | string | null;
  dataPagamento?: Date | string | null;
  gatewayTxId?: string | null;
  criadoEm: Date | string;
}

export interface IContratoModelo {
  id: string;
  tenantId: string;
  nome: string;
  conteudoHtml: string;
  ativo: boolean;
}

export interface IContrato {
  id: string;
  tenantId: string;
  ensaioId: string;
  conteudoFinal: string;
  assinado: boolean;
  assinadoEm?: Date | string | null;
  ipAssinatura?: string | null;
  hashDocumento?: string | null;
  criadoEm: Date | string;
}

export interface IDocumento {
  id: string;
  tenantId: string;
  ensaioId: string;
  tipo: string;
  url: string;
  criadoEm: Date | string;
}

export interface IGaleria {
  id: string;
  tenantId: string;
  ensaioId: string;
  linkPublico: string;
  limiteSelecao: number;
  finalizada: boolean;
  criadoEm: Date | string;
}

export interface IFotoGaleria {
  id: string;
  tenantId: string;
  galeriaId: string;
  urlBaixaRes: string;
  urlOriginal: string;
  selecionada: boolean;
  comentario?: string | null;
  ordem: number;
}

export interface ILeadPipeline {
  id: string;
  tenantId: string;
  clienteId: string;
  etapa: string;
  origem?: string | null;
  atualizadoEm: Date | string;
  cliente?: ICliente;
}

export interface ITemplateMensagem {
  id: string;
  tenantId: string;
  nome: string;
  gatilho: string;
  conteudo: string;
  ativo: boolean;
}

export interface IEquipamento {
  id: string;
  tenantId: string;
  nome: string;
  tipo: string;
  numeroSerie?: string | null;
  dataUltimaManutencao?: Date | string | null;
  intervaloManutencaoDias?: number | null;
  ativo: boolean;
}
