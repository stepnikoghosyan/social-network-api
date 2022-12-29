import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

// services
import { AttachmentsService } from './attachments.service';

// entities
import { Attachment } from './attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
