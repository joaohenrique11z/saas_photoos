import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { StatusEnsaio } from '@photoos/types';
import { EnsaiosRepository } from './ensaios.repository';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class EnsaioStatusService {
  private readonly TRANSICAO_PERMITIDA: Record<StatusEnsaio, StatusEnsaio[]> = {
    [StatusEnsaio.ORCAMENTO_ENVIADO]: [
      StatusEnsaio.AGUARDANDO_RESPOSTA,
      StatusEnsaio.CONFIRMADO,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.AGUARDANDO_RESPOSTA]: [
      StatusEnsaio.CONFIRMADO,
      StatusEnsaio.ORCAMENTO_ENVIADO,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.CONFIRMADO]: [
      StatusEnsaio.AGENDADO,
      StatusEnsaio.EM_ANDAMENTO,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.AGENDADO]: [
      StatusEnsaio.EM_ANDAMENTO,
      StatusEnsaio.CONFIRMADO,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.EM_ANDAMENTO]: [
      StatusEnsaio.EDICAO,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.EDICAO]: [
      StatusEnsaio.SELECAO_CLIENTE,
      StatusEnsaio.ENTREGUE,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.SELECAO_CLIENTE]: [
      StatusEnsaio.EDICAO,
      StatusEnsaio.ENTREGUE,
      StatusEnsaio.CANCELADO,
    ],
    [StatusEnsaio.ENTREGUE]: [
      StatusEnsaio.FINALIZADO,
    ],
    [StatusEnsaio.FINALIZADO]: [],
    [StatusEnsaio.CANCELADO]: [
      StatusEnsaio.ORCAMENTO_ENVIADO, // Reabrir em caso excepcional via admin
    ],
  };

  constructor(
    private readonly ensaiosRepository: EnsaiosRepository,
    private readonly clientesService: ClientesService,
  ) {}

  async transicionarStatus(
    tenantId: string,
    ensaioId: string,
    novoStatus: StatusEnsaio,
    usuarioId?: string,
  ) {
    const ensaio = await this.ensaiosRepository.findById(tenantId, ensaioId);
    if (!ensaio) {
      throw new BadRequestException('Ensaio não encontrado.');
    }

    const statusAtual = ensaio.status as StatusEnsaio;

    if (statusAtual === novoStatus) {
      return ensaio;
    }

    const permitidos = this.TRANSICAO_PERMITIDA[statusAtual] || [];
    if (!permitidos.includes(novoStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: de '${statusAtual}' para '${novoStatus}'. Transições permitidas: ${permitidos.join(', ') || 'Nenhuma'}`,
      );
    }

    const ensaioAtualizado = await this.ensaiosRepository.updateStatus(
      tenantId,
      ensaioId,
      novoStatus,
    );

    await this.clientesService.addInteraction(
      tenantId,
      ensaio.clienteId,
      'status_ensaio_alterado',
      `Status do ensaio "${ensaio.servico?.nome || ensaioId}" alterado de ${statusAtual} para ${novoStatus}`,
      {
        ensaioId,
        statusAnterior: statusAtual,
        novoStatus,
        usuarioId,
      },
    );

    return ensaioAtualizado;
  }
}
