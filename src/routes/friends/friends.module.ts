import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { UsersModule } from '../users/users.module';

// services
import { FriendsService } from './friends.service';

// controllers
import { FriendsController } from './friends.controller';

// entities
import { Friend } from './friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), UsersModule],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [],
})
export class FriendsModule {}
