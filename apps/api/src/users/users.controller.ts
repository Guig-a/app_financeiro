import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../commom/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getProfile(
    @CurrentUser() user: { userId: string; tenantId: string; role: string },
  ) {
    return this.service.findById(user.userId, user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar novo usuário no tenant autenticado' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({
    status: 403,
    description: 'Apenas MASTER pode criar usuários',
  })
  create(
    @CurrentUser() user: { tenantId: string; role: string },
    @Body() dto: CreateUserDto,
  ) {
    return this.service.create(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.service.findAll(user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar usuário no tenant autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({
    status: 403,
    description: 'Apenas MASTER pode atualizar usuários',
  })
  update(
    @CurrentUser() user: { tenantId: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar usuário no tenant autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário removido' })
  @ApiResponse({
    status: 403,
    description: 'Apenas MASTER pode remover usuários',
  })
  remove(
    @CurrentUser() user: { tenantId: string; role: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(user, id);
  }
}
