import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { unlink } from 'fs';
import { resolve } from 'path';

// entities
import { Attachment } from '@common/modules/attachments/attachment.entity';

@Injectable()
export class AttachmentsService {
  constructor(@InjectRepository(Attachment) private readonly attachmentsRepository: Repository<Attachment>) {}

  public getAttachmentById(id: number): Promise<Attachment | null> {
    return !!id ? this.attachmentsRepository.findOneBy({ id }) : null;
  }

  public async createOrUpdate(basePath: string, previousAttachmentID: number, fileName: string): Promise<Attachment> {
    let resultAttachment: Attachment;

    // Update
    const currentAttachment = await this.getAttachmentById(previousAttachmentID);
    if (!!currentAttachment) {
      const previousAttachmentFileName = currentAttachment.fileName;

      // Update attachment fileName
      await this.attachmentsRepository.update(currentAttachment.id, { fileName });

      // Delete previous file from storage
      await this.deleteExistingAttachment(resolve(basePath, previousAttachmentFileName));

      resultAttachment = currentAttachment;
    } else {
      // Create
      resultAttachment = await this.attachmentsRepository.save({ fileName });
    }

    return resultAttachment;
  }

  public async deleteByID(id: number): Promise<void> {
    const data = await this.attachmentsRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException();
    }

    await this.attachmentsRepository.delete(id);
  }

  private deleteExistingAttachment(path: string): Promise<void> {
    return new Promise((resolve) => {
      unlink(path, () => resolve());
    });
  }
}
