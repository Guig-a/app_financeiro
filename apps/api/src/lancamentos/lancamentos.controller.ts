import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { LancamentosService } from './lancamentos.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';
import { FilterLancamentoDto } from './dto/filter-lancamento.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../commom/decorators/current-user.decorator';

@ApiTags('lancamentos')
@Controller('lancamentos')
export class LancamentosController {
  constructor(private service: LancamentosService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar novo lançamento financeiro' })
  @ApiResponse({ status: 201, description: 'Lançamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreateLancamentoDto,
  ) {
    return this.service.create(user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar lançamentos com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de lançamentos' })
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Query() filters: FilterLancamentoDto,
  ) {
    return this.service.findAll(user.tenantId, filters);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar lançamento por ID' })
  @ApiResponse({ status: 200, description: 'Lançamento encontrado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.findOne(id, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento atualizado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateLancamentoDto,
  ) {
    return this.service.update(id, user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar lançamento' })
  @ApiResponse({ status: 200, description: 'Lançamento deletado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.remove(id, user.tenantId);
  }
}
