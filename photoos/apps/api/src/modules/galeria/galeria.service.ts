import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { GaleriaRepository } from './galeria.repository';
import { CreateGaleriaDto } from './dto/create-galeria.dto';
import { AddFotoDto } from './dto/add-foto.dto';
import { SelecionarFotosDto } from './dto/selecionar-fotos.dto';
import { TipoTransacao, StatusTransacao, StatusEnsaio } from '@photoos/types';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { ClientesService } from '../clientes/clientes.service';
import { EnsaioStatusService } from '../ensaios/ensaio-status.service';

@Injectable()
export class GaleriaService {
  constructor(
    private readonly galeriaRepository: GaleriaRepository,
    private readonly financeiroService: FinanceiroService,
    private readonly clientesService: ClientesService,
    private readonly ensaioStatusService: EnsaioStatusService,
  ) {}

  async findAll(tenantId: string) {
    return this.galeriaRepository.findAll(tenantId);
  }

  async getByEnsaio(tenantId: string, ensaioId: string) {
    const galeria = await this.galeriaRepository.findByEnsaio(tenantId, ensaioId);
    if (!galeria) {
      throw new NotFoundException('Galeria não encontrada para este ensaio');
    }
    return galeria;
  }

  async getByLinkPublico(token: string) {
    const galeria = await this.galeriaRepository.findByLinkPublico(token);
    if (!galeria) {
      throw new NotFoundException('Galeria do cliente não encontrada ou link expirado.');
    }
    return galeria;
  }

  async create(tenantId: string, dto: CreateGaleriaDto, usuarioId?: string) {
    const existing = await this.galeriaRepository.findByEnsaio(
      tenantId,
      dto.ensaioId,
    );
    if (existing) {
      return existing;
    }

    const token = crypto.randomBytes(20).toString('hex');

    const galeria = await this.galeriaRepository.create(tenantId, dto, token);

    if (galeria.ensaioId) {
      try {
        await this.ensaioStatusService.transicionarStatus(
          tenantId,
          dto.ensaioId,
          StatusEnsaio.SELECAO_CLIENTE,
          usuarioId,
        );
      } catch (_) {
        // status transistion optional if not allowed from current status
      }
    }

    return galeria;
  }

  async addFoto(
    tenantId: string,
    galeriaId: string,
    dto: AddFotoDto,
  ) {
    const urlBaixaRes = dto.urlOriginal.includes('?')
      ? `${dto.urlOriginal}&watermark=true`
      : `${dto.urlOriginal}?watermark=true`;

    return this.galeriaRepository.addFoto(
      tenantId,
      galeriaId,
      dto.urlOriginal,
      urlBaixaRes,
      dto.ordem || 0,
    );
  }

  async processarSelecaoCliente(
    token: string,
    dto: SelecionarFotosDto,
    ipCliente: string,
  ) {
    const galeria = await this.getByLinkPublico(token);

    if (galeria.finalizada) {
      throw new BadRequestException('Esta galeria já foi finalizada. Não é possível alterar a seleção.');
    }

    // Step 1: Apply each photo selection server-side
    for (const s of dto.selecoes) {
      const p = galeria.fotos.find((f) => f.id === s.fotoId);
      if (p) {
        await this.galeriaRepository.updateFotoSelecao(
          s.fotoId,
          s.selecionada,
          s.comentario,
        );
      }
    }

    // Step 2: Recalculate server-side counts
    const totalSelecionadas = await this.galeriaRepository.countFotosSelecionadas(
      galeria.id,
    );

    let cobrancaUpsell: any = null;

    // Step 3: Automatic Upsell check (Passo 9 & Rule 9)
    if (totalSelecionadas > galeria.limiteSelecao) {
      const extraCount = totalSelecionadas - galeria.limiteSelecao;
      const valorFotoExtra = Number(
        galeria.ensaio?.servico?.valorFotoExtra || 25.0,
      );
      const valorUpsell = Number((extraCount * valorFotoExtra).toFixed(2));

      if (valorUpsell > 0) {
        cobrancaUpsell = await this.financeiroService.createTransacao(
          galeria.tenantId,
          {
            ensaioId: galeria.ensaioId,
            clienteId: galeria.ensaio?.clienteId,
            tipo: TipoTransacao.RECEITA,
            descricao: `Upsell - ${extraCount} foto(s) extra(s) selecionada(s) pelo cliente na galeria (Limite: ${galeria.limiteSelecao})`,
            valor: valorUpsell,
            status: StatusTransacao.PENDENTE,
            dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        );
      }
    }

    // Mark gallery as finalized
    await this.galeriaRepository.markFinalizada(galeria.id);

    // Record in CRM Timeline
    if (galeria.ensaio?.clienteId) {
      await this.clientesService.addInteraction(
        galeria.tenantId,
        galeria.ensaio.clienteId,
        'selecao_fotos_cliente',
        `Cliente finalizou a seleção de fotos (${totalSelecionadas}/${galeria.limiteSelecao})${
          cobrancaUpsell ? ` — Gerado upsell de R$ ${cobrancaUpsell.valor}` : ''
        }`,
        {
          galeriaId: galeria.id,
          totalSelecionadas,
          limiteSelecao: galeria.limiteSelecao,
          cobrancaUpsellId: cobrancaUpsell?.id,
          ipCliente,
        },
      );
    }

    return {
      sucesso: true,
      galeriaId: galeria.id,
      totalSelecionadas,
      limiteSelecao: galeria.limiteSelecao,
      cobrancaUpsell: cobrancaUpsell
        ? {
            id: cobrancaUpsell.id,
            valor: cobrancaUpsell.valor,
            descricao: cobrancaUpsell.descricao,
            status: cobrancaUpsell.status,
          }
        : null,
    };
  }
}
