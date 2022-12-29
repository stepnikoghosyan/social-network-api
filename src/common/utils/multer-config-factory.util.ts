import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ConfigService } from '@nestjs/config';

import { resolve } from 'path';
import { diskStorage } from 'multer';
import { Request } from 'express';

// entities
import { User } from '../../routes/users/user.entity';

// models
import { MulterConfigType } from '../models/multer-config-type.model';
import { EnvConfigEnum } from '@common/models/env-config.model';

export function multerConfigFactory(multerConfigType: MulterConfigType): (...args) => MulterOptions {
  const filePathConfigs: {
    [key in MulterConfigType]: Array<Partial<EnvConfigEnum>>;
  } = {
    [MulterConfigType.profilePictures]: [EnvConfigEnum.IMAGES_PATH, EnvConfigEnum.PROFILE_PICTURES_IMAGES_PATH],
  };

  return (configService: ConfigService): MulterOptions => ({
    storage: diskStorage({
      destination: resolve(
        process.cwd(),
        configService.get(EnvConfigEnum.ROOT_STORAGE_PATH),
        ...filePathConfigs[multerConfigType].map((item) => configService.get(item)),
      ),
      filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) {
        const date = Date.now().toString(36);
        const path = `${(req.user as Partial<User>).id}_${date}${file.originalname.substring(
          file.originalname.lastIndexOf('.'),
        )}`;

        cb(null, path);
      },
    }),
    limits: {
      files: 1,
      fileSize: 10 * 1024 * 1024, // 10mb
    },
  });
}
