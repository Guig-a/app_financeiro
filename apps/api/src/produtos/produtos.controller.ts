import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ProdutosService } from './produtos.service';
import { ProdutosImportService } from './import/produtos-import.service';

import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CurrentUser } from '../commom/decorators/current-user.decorator';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(
    private service: ProdutosService,
    private importService: ProdutosImportService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  create(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreateProdutoDto,
  ) {
    return this.service.create(user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.service.findAll(user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.findOne(id, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.service.update(id, user.tenantId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiResponse({ status: 200, description: 'Produto deletado' })
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.service.remove(id, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import/csv')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Importar produtos via CSV' })
  @ApiResponse({ status: 200, description: 'Produtos importados' })
  async importCsv(@CurrentUser() user: { tenantId: string }) {
    return this.importService.importFromCsv(
      './uploads/produtos.csv',
      user.tenantId,
    );
  }
}
