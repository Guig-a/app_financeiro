import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreatePessoaDto, TipoPessoa } from './dto/create-pessoa.dto';

import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { PessoasService } from './pessoas.service';
import { CurrentUser } from '../commom/decorators/current-user.decorator';

@ApiTags('pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private service: PessoasService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar nova pessoa (cliente/fornecedor)' })
  @ApiResponse({ status: 201, description: 'Pessoa criada com sucesso' })
  create(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreatePessoaDto,
  ) {
    return this.service.create(user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar pessoas com filtro opcional por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de pessoas' })
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Query('tipo') tipo?: TipoPessoa,
  ) {
    return this.service.findAll(user.tenantId, tipo);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  @ApiResponse({ status: 200, description: 'Pessoa encontrada' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.findOne(id, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa atualizada' })
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePessoaDto,
  ) {
    return this.service.update(id, user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa deletada' })
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.remove(id, user.tenantId);
  }
}
