import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('Media Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload media asset' })
  async upload(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('folderId') folderId?: string) {
    return this.mediaService.uploadAsset(req.user.id, file, folderId);
  }

  @Get('assets')
  @ApiOperation({ summary: 'Get user media assets' })
  async getAssets(@Req() req: any, @Query('type') type?: string, @Query('folderId') folderId?: string) {
    return this.mediaService.getUserAssets(req.user.id, type, folderId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create folder' })
  async createFolder(@Body() body: { name: string; parentId?: string }) {
    return this.mediaService.createFolder(body.name, body.parentId);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get folders' })
  async getFolders(@Query('parentId') parentId?: string) {
    return this.mediaService.getFolders(parentId);
  }

  @Delete('assets/:id')
  @ApiOperation({ summary: 'Delete asset' })
  async deleteAsset(@Param('id') id: string) {
    return this.mediaService.deleteAsset(id);
  }
}
