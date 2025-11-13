import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoresService } from './stores.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /stores - Get all stores for current user
   */
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return await this.storesService.findStoresByUserId(userId);
  }

  /**
   * GET /stores/:id - Get store details
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.storesService.findOne(id, userId);
  }

  /**
   * PATCH /stores/:id - Update store information
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStoreDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.storesService.update(id, userId, updateDto);
  }

  /**
   * GET /stores/:id/employees - Get employees for a store
   */
  @Get(':id/employees')
  async findEmployees(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.storesService.findEmployees(id, userId);
  }
}
