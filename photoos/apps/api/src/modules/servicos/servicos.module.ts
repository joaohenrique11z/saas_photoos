import { Module } from '@nestjs/common';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';
import { ServicosRepository } from './servicos.repository';

@Module({
  controllers: [ServicosController],
  providers: [ServicosService, ServicosRepository],
  exports: [ServicosService, ServicosRepository],
})
export class ServicosModule {}
