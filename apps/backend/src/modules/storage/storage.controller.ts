import { BadRequestException, Controller, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (!file) throw new BadRequestException('Image file is required');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Only image uploads are allowed');

    const url = await this.storageService.uploadFile(file, folder || 'uploads');
    return { url };
  }
}
