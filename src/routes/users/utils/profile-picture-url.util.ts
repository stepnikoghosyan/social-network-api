import { ConfigService } from '@nestjs/config';
import { EnvConfigEnum } from '@common/models/env-config.model';

export function getProfilePictureUrl(configService: ConfigService, imagePathInStorage?: string): string {
  if (!imagePathInStorage) {
    return null;
  }

  const names = [
    EnvConfigEnum.DOMAIN,
    EnvConfigEnum.ROOT_PUBLIC_STORAGE_PATH,
    EnvConfigEnum.IMAGES_PATH,
    EnvConfigEnum.PROFILE_PICTURES_IMAGES_PATH,
  ];
  return names.map((item) => configService.get(item)).join('/') + `/${imagePathInStorage}`;
}
