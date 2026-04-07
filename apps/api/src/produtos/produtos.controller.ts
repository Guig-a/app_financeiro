import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { ProdutosService } from './produtos.service';
import {
  ImportRowResolution,
  ProdutosImportService,
} from './import/produtos-import.service';

import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CurrentUser } from '../commom/decorators/current-user.decorator';
import { Role } from '../common/types/role';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

const CSV_IMPORT_LIMIT = 2 * 1024 * 1024;

type UploadedCsvFile = { buffer: Buffer; originalname?: string };

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(
    private service: ProdutosService,
    private importService: ProdutosImportService,
  ) {}

  private ensureMasterImport(user: Pick<AuthenticatedUser, 'role'>) {
    if (user.role !== Role.MASTER) {
      throw new ForbiddenException(
        'Apenas MASTER pode importar produtos via planilha.',
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('import/csv-template')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Baixar modelo CSV de produtos',
    description: 'Apenas MASTER pode exportar o modelo e importar produtos.',
  })
  @ApiResponse({ status: 200, description: 'Arquivo CSV modelo' })
  @ApiResponse({ status: 403, description: 'Usuário não é MASTER' })
  downloadCsvTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    this.ensureMasterImport(user);
    const csv = this.importService.getCsvTemplate();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="produtos-modelo.csv"',
    );
    res.send('\ufeff' + csv);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import/preview')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Arquivo .csv' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Pré-visualizar importação CSV (validação em memória)',
    description: 'Apenas MASTER pode importar produtos via planilha.',
  })
  @ApiResponse({ status: 403, description: 'Usuário não é MASTER' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CSV_IMPORT_LIMIT },
    }),
  )
  async importPreview(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedCsvFile | undefined,
  ) {
    this.ensureMasterImport(user);
    return this.importService.previewFromBuffer(file?.buffer, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import/apply')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        resolutions: {
          type: 'string',
          description:
            'JSON: mapa rowIndex (string) -> "update" | "ignore" para linhas existentes',
        },
      },
      required: ['file', 'resolutions'],
    },
  })
  @ApiOperation({
    summary: 'Confirmar importação CSV (transação all-or-nothing)',
    description: 'Apenas MASTER pode importar produtos via planilha.',
  })
  @ApiResponse({ status: 403, description: 'Usuário não é MASTER' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CSV_IMPORT_LIMIT },
    }),
  )
  async importApply(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedCsvFile | undefined,
    @Body('resolutions') resolutionsRaw: string | undefined,
  ) {
    this.ensureMasterImport(user);
    if (resolutionsRaw == null || resolutionsRaw === '') {
      throw new BadRequestException('Campo "resolutions" é obrigatório (JSON).');
    }
    let resolutions: Record<string, ImportRowResolution>;
    try {
      resolutions = JSON.parse(resolutionsRaw) as Record<
        string,
        ImportRowResolution
      >;
    } catch {
      throw new BadRequestException('Campo "resolutions" deve ser um JSON válido.');
    }
    return this.importService.applyFromBuffer(
      file?.buffer,
      user.tenantId,
      resolutions,
    );
  }

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
}
