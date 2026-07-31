import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EnsaiosRepository } from './ensaios.repository';
import { EnsaioStatusService } from './ensaio-status.service';
import { CreateEnsaioDto } from './dto/create-ensaio.dto';
import { UpdateEnsaioDto } from './dto/update-ensaio.dto';
import { StatusEnsaio, PapelUsuario } from '@photoos/types';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class EnsaiosService {
  constructor(
    private readonly ensaiosRepository: EnsaiosRepository,
    private readonly ensaioStatusService: EnsaioStatusService,
    private readonly prisma: PrismaService,
    private readonly clientesService: ClientesService,
  ) {}

  async findAll(
    tenantId: string,
    user: { id: string; papel: PapelUsuario },
    filters?: {
      status?: StatusEnsaio;
      clienteId?: string;
      dataInicio?: string;
      dataFim?: string;
    },
  ) {
    return this.ensaiosRepository.findAll(tenantId, user, filters);
  }

  async findById(
    tenantId: string,
    id: string,
    user: { id: string; papel: PapelUsuario },
  ) {
    const ensaio = await this.ensaiosRepository.findById(tenantId, id, user);
    if (!ensaio) {
      throw new NotFoundException('Ensaio não encontrado ou sem permissão de acesso.');
    }
    return ensaio;
  }

  async create(
    tenantId: string,
    dto: CreateEnsaioDto,
    usuarioId?: string,
  ) {
    const ensaio = await this.ensaiosRepository.create(tenantId, dto);

    // Create automatic workflow tasks (Passo 5)
    const db = this.prisma.getTenantClient(tenantId);
    const dataHora = new Date(dto.dataHora);

    const checkPre = new Date(dataHora.getTime() - 24 * 60 * 60 * 1000);
    const checkPos = new Date(dataHora.getTime() + 24 * 60 * 60 * 1000);

    await db.tarefaWorkflow.createMany({
      data: [
        {
          tenantId,
          ensaioId: ensaio.id,
          titulo: 'Verificar checklist de equipamentos, baterias e cartões de memória',
          dataExecucao: checkPre,
          concluida: false,
        },
        {
          tenantId,
          ensaioId: ensaio.id,
          titulo: 'Confirmar horário e local com o cliente',
          dataExecucao: checkPre,
          concluida: false,
        },
        {
          tenantId,
          ensaioId: ensaio.id,
          titulo: 'Realizar backup dos arquivos brutos após o ensaio',
          dataExecucao: checkPos,
          concluida: false,
        },
        {
          tenantId,
          ensaioId: ensaio.id,
          titulo: 'Publicar galeria de seleção de fotos (proofing)',
          dataExecucao: new Date(dataHora.getTime() + 48 * 60 * 60 * 1000),
          concluida: false,
        },
      ],
    });

    await this.clientesService.addInteraction(
      tenantId,
      ensaio.clienteId,
      'ensaio_criado',
      `Novo ensaio agendado/orcado no valor de R$ ${dto.valorTotal}`,
      { ensaioId: ensaio.id, dataHora: dto.dataHora, usuarioId },
    );

    return ensaio;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateEnsaioDto,
    user: { id: string; papel: PapelUsuario },
  ) {
    await this.findById(tenantId, id, user);
    return this.ensaiosRepository.update(tenantId, id, dto);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: StatusEnsaio,
    usuarioId?: string,
  ) {
    return this.ensaioStatusService.transicionarStatus(
      tenantId,
      id,
      status,
      usuarioId,
    );
  }

  async delete(tenantId: string, id: string) {
    const ensaio = await this.ensaiosRepository.findById(tenantId, id);
    if (!ensaio) {
      throw new NotFoundException('Ensaio não encontrado');
    }
    return this.ensaiosRepository.delete(tenantId, id);
  }

  async toggleTarefaWorkflow(
    tenantId: string,
    tarefaId: string,
    concluida: boolean,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.tarefaWorkflow.update({
      where: { id: tarefaId },
      data: { concluida },
    });
  }
}
