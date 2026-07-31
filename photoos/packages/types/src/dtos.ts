import { StatusEnsaio, TipoTransacao, StatusTransacao, PapelUsuario } from './enums';

export interface ICreateTenantDto {
  nome: string;
  slug: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

export interface ICreateClienteDto {
  nomeCompleto: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  cpf?: string;
  dataNascimento?: string;
  instagram?: string;
  endereco?: string;
  cidade?: string;
  observacoes?: string;
  origem?: string;
}

export interface IUpdateClienteDto extends Partial<ICreateClienteDto> {}

export interface ICreateServicoDto {
  nome: string;
  descricao?: string;
  valorPadrao: number;
  tempoMedioMin?: number;
  qtdFotosInclusas?: number;
  valorFotoExtra?: number;
  qtdPessoas?: number;
  local?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface IUpdateServicoDto extends Partial<ICreateServicoDto> {}

export interface ICreateEnsaioDto {
  clienteId: string;
  servicoId: string;
  dataHora: string;
  local?: string;
  valorTotal: number;
  sinalPago?: number;
  status?: StatusEnsaio;
  fotografoIds?: string[];
}

export interface IUpdateEnsaioStatusDto {
  status: StatusEnsaio;
}

export interface ICreateTransacaoDto {
  ensaioId?: string;
  clienteId?: string;
  tipo: TipoTransacao;
  categoria?: string;
  descricao: string;
  valor: number;
  metodoPagamento?: string;
  status?: StatusTransacao;
  dataVencimento?: string;
  dataPagamento?: string;
}

export interface ICreateContratoModeloDto {
  nome: string;
  conteudoHtml: string;
  ativo?: boolean;
}

export interface IAssinarContratoDto {
  ensaioId: string;
  ipAssinatura: string;
  hashDocumento: string;
}

export interface ICreateGaleriaDto {
  ensaioId: string;
  limiteSelecao: number;
}

export interface ISelectFotoDto {
  selecionada: boolean;
  comentario?: string;
}

export interface ICreateLeadDto {
  nomeCompleto: string;
  email?: string;
  whatsapp?: string;
  cidade?: string;
  observacoes?: string;
  origem?: string;
}

export interface IUpdateLeadEtapaDto {
  etapa: string;
}

export interface ICreateEquipamentoDto {
  nome: string;
  tipo: string;
  numeroSerie?: string;
  dataUltimaManutencao?: string;
  intervaloManutencaoDias?: number;
  ativo?: boolean;
}

export interface IUpdateEquipamentoDto extends Partial<ICreateEquipamentoDto> {}
