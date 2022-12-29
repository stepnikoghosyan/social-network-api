import * as joi from 'joi';

// models
import { EnvConfigEnum } from '@common/models/env-config.model';
import { Environment } from '@common/models/environment.model';

export function getEnvVarsValidationSchema(): joi.ObjectSchema {
  return joi.object({
    [EnvConfigEnum.ENV]: joi.string().valid(...Object.values(Environment)),
    [EnvConfigEnum.HOST]: joi.string().hostname().required(),
    [EnvConfigEnum.PORT]: joi.number().required(),

    [EnvConfigEnum.DATABASE_HOST]: joi.string().required(),
    [EnvConfigEnum.DATABASE_PORT]: joi.number().required(),
    [EnvConfigEnum.DATABASE_USERNAME]: joi.string().required(),
    [EnvConfigEnum.DATABASE_PASSWORD]: joi.string().empty(),
    [EnvConfigEnum.DATABASE_NAME]: joi.string().required(),

    [EnvConfigEnum.JWT_SIGN_ALGORITHM]: joi.string().required().valid('RS256', 'HS256'),
    [EnvConfigEnum.JWT_EXPIRE]: joi.string().required(),
    [EnvConfigEnum.JWT_REFRESH_EXPIRE]: joi.string().required(),
    [EnvConfigEnum.JWT_PRIVATE_KEY]: joi.string().required(),

    [EnvConfigEnum.HASH_SALT_ROUNDS]: joi.number().required(),

    // TODO: delete later if not needed
    // [EnvConfigEnum.ROOT_STORAGE_PATH]: string().required(),
    // [EnvConfigEnum.ROOT_PUBLIC_STORAGE_PATH]: string().required(),
    // [EnvConfigEnum.IMAGES_PATH]: string().required(),
    // [EnvConfigEnum.PROFILE_PICTURES_IMAGES_PATH]: string().required(),
    // [EnvConfigEnum.POSTS_IMAGES_PATH]: string().required(),
    //
    // [EnvConfigEnum.SENDGRID_API_KEY]: string().required(),
    // [EnvConfigEnum.MAIL_FROM]: string().required(),
  });
}
