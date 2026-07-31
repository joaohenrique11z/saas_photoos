import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientesRepository } from './clientes.repository';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  async findAll(tenantId: string, search?: string) {
    return this.clientesRepository.findAll(tenantId, search);
  }

  async findById(tenantId: string, id: string) {
    const cliente = await this.clientesRepository.findById(tenantId, id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async create(tenantId: string, dto: CreateClienteDto, usuarioId?: string) {
    const cliente = await this.clientesRepository.create(tenantId, dto);

    await this.clientesRepository.addTimelineInteraction(
      tenantId,
      cliente.id,
      'cliente_criado',
      `Cliente cadastrado no CRM: ${cliente.nomeCompleto}`,
      { usuarioId, origem: dto.origem || 'manual' },
    );

    return cliente;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateClienteDto,
    usuarioId?: string,
  ) {
    await this.findById(tenantId, id); // validates presence

    const cliente = await this.clientesRepository.update(tenantId, id, dto);

    await this.clientesRepository.addTimelineInteraction(
      tenantId,
      cliente.id,
      'cliente_atualizado',
      `Dados cadastrais do cliente atualizados`,
      { usuarioId, alteracoes: Object.keys(dto) },
    );

    return cliente;
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.clientesRepository.delete(tenantId, id);
  }

  async addInteraction(
    tenantId: string,
    clienteId: string,
    tipo: string,
    descricao: string,
    metadata?: Record<string, any>,
  ) {
    await this.findById(tenantId, clienteId);
    return this.clientesRepository.addTimelineInteraction(
      tenantId,
      clienteId,
      tipo,
      descricao,
      metadata,
    );
  }

  async getTimeline(tenantId: string, clienteId: string) {
    await this.findById(tenantId, clienteId);
    return this.clientesRepository.getTimeline(tenantId, clienteId);
  }
}
