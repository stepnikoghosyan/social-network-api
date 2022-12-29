import { Environment } from '@common/models/environment.model';

export interface EnvConfig {
  [EnvConfigEnum.NODE_ENV]: Environment;
  [EnvConfigEnum.HOST]: string;
  [EnvConfigEnum.PORT]: number;

  [EnvConfigEnum.DATABASE_HOST]: string;
  [EnvConfigEnum.DATABASE_PORT]: number;
  [EnvConfigEnum.DATABASE_USERNAME]: string;
  [EnvConfigEnum.DATABASE_PASSWORD]: string;
  [EnvConfigEnum.DATABASE_NAME]: string;

  [EnvConfigEnum.JWT_SIGN_ALGORITHM]: 'RS256' | 'HS256';
  [EnvConfigEnum.JWT_EXPIRE]: string | number;
  [EnvConfigEnum.JWT_REFRESH_EXPIRE]: string | number;
  [EnvConfigEnum.JWT_PRIVATE_KEY]: string;

  [EnvConfigEnum.HASH_SALT_ROUNDS]: number;
}

export enum EnvConfigEnum {
  NODE_ENV = 'NODE_ENV',
  HOST = 'HOST',
  PORT = 'PORT',

  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_USERNAME = 'DATABASE_USERNAME',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  DATABASE_NAME = 'DATABASE_NAME',

  JWT_SIGN_ALGORITHM = 'JWT_SIGN_ALGORITHM', // 'RS256' | 'HS256'
  JWT_EXPIRE = 'JWT_EXPIRE',
  JWT_REFRESH_EXPIRE = 'JWT_REFRESH_EXPIRE',
  JWT_PRIVATE_KEY = 'JWT_PRIVATE_KEY',

  HASH_SALT_ROUNDS = 'HASH_SALT_ROUNDS',
}
