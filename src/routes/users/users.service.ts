import { Injectable } from '@nestjs/common';

// repository
import { UsersRepository } from './users.repository';

// entity
import { User } from './user.entity';

// dto
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// models
import { UsersQueryParams } from './models/users-query-params.model';
import { PaginationResponse } from '@common/models/pagination-response.model';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public getUserByID(id: string): Promise<User> {
    return this.usersRepository.getUserById(id);
  }

  getUserByEmail(email: string, includePassword = false): Promise<User | undefined> {
    return this.usersRepository.getUserByEmail(email, includePassword);
  }

  getUsersList(queryParams: UsersQueryParams, currentUserId: string): Promise<PaginationResponse<User>> {
    return this.usersRepository.getUsersList(queryParams, currentUserId);
  }

  createUser(payload: CreateUserDto): Promise<Partial<User>> {
    return this.usersRepository.createUser(payload);
  }

  updateUser(
    id: string,
    payload: UpdateUserDto,
    // file?: Express.Multer.File,
  ): Promise<void> {
    return this.usersRepository.updateUser(id, payload);
  }

  activateUserAccount(userID: string): Promise<void> {
    return this.usersRepository.activateUserAccount(userID);
  }

  changeUserPassword(userID: string, password: string): Promise<void> {
    return this.usersRepository.changeUserPassword(userID, password);
  }

  deleteUser(userID: string): Promise<void> {
    return this.usersRepository.deleteUser(userID);
  }
}
