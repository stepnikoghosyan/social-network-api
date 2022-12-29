import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

// services
import { UsersService } from '../../users/users.service';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {
    super(
      {
        secretOrKey: configService.get<EnvConfig[EnvConfigEnum.JWT_PRIVATE_KEY]>(EnvConfigEnum.JWT_PRIVATE_KEY),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (payload: any, done: VerifiedCallback) => {
        try {
          const user = await this.usersService.getUserByID(payload.id);
          if (user) {
            return done(null, user);
          }

          return done(null, false);
        } catch (ex) {
          return done(ex, false);
        }
      },
    );
  }
}
