import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicosRepository } from './servicos.repository';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private readonly servicosRepository: ServicosRepository) {}

  async findAll(tenantId: string, search?: string) {
    return this.servicosRepository.findAll(tenantId, search);
  }

  async findById(tenantId: string, id: string) {
    const servico = await this.servicosRepository.findById(tenantId, id);
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return servico;
  }

  async create(tenantId: string, dto: CreateServicoDto) {
    return this.servicosRepository.create(tenantId, dto);
  }

  async update(tenantId: string, id: string, dto: UpdateServicoDto) {
    await this.findById(tenantId, id);
    return this.servicosRepository.update(tenantId, id, dto);
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.servicosRepository.delete(tenantId, id);
  }
}
