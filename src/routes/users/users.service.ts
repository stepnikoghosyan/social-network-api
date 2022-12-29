import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Like, Not, Repository } from 'typeorm';
import { hash } from 'bcrypt';

// services
import { AttachmentsService } from '@common/modules/attachments/attachments.service';

// entity
import { User } from './user.entity';

// dto
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// models
import { UsersQueryParams } from './models/users-query-params.model';
import { PaginationResponse } from '@common/models/pagination-response.model';
import { EnvConfigEnum } from '@common/models/env-config.model';

// utils
import { normalizePaginationQueryParams } from '@common/utils/normalize-pagination-query-params.util';
import { getProfilePictureUrl } from './utils/profile-picture-url.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly attachmentsService: AttachmentsService,
    private readonly configService: ConfigService,
  ) {}

  async getUserByID(id: number): Promise<User> {
    const data = await this.usersRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  async getUserByEmail(email: string, includePassword = false): Promise<User> {
    let query = this.usersRepository.createQueryBuilder().where('user.email = :email', { email });

    if (includePassword) {
      query = query.addSelect('password', 'User_password'); // TODO: check if this is the correct way
    }

    const user = await query.getOne();
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getUsersList(
    queryParams: UsersQueryParams,
    currentUserId: number,
  ): Promise<PaginationResponse<Omit<User, 'attachment'>>> {
    // TODO: check if below query is working fine. should become: where id... AND (firstName like *** OR lastName like ***)
    const [results, count] = await this.usersRepository.findAndCount({
      ...normalizePaginationQueryParams(queryParams),
      ...(!!queryParams.excludeSelf && (queryParams.excludeSelf === 'true' || +queryParams.excludeSelf === 1)
        ? {
            id: Not(currentUserId),
          }
        : null),
      ...(queryParams.search?.trim()
        ? {
            where: [
              { firstName: Like(`%${queryParams.search.trim().toLocaleLowerCase()}%`) },
              { lastName: Like(`%${queryParams.search.trim().toLocaleLowerCase()}%`) },
            ],
          }
        : null),
      relations: {
        attachment: true,
      },
    });

    // TODO: Review this, there should be a better way
    return {
      count,
      results: results.map((user) => {
        const { attachment, ...userData } = user;

        return {
          ...userData,
          profilePictureUrl: getProfilePictureUrl(this.configService, attachment?.fileName),
        };
      }),
    };
  }

  async createUser(payload: CreateUserDto): Promise<Partial<User>> {
    let userWithGivenEmailAlreadyExists = false;

    try {
      userWithGivenEmailAlreadyExists = !!(await this.getUserByEmail(payload.email));
    } catch (ex) {}

    if (userWithGivenEmailAlreadyExists) {
      throw new ConflictException();
    }

    const hashedPassword = await hash(payload.password, +this.configService.get(EnvConfigEnum.HASH_SALT_ROUNDS));
    const result: User = await this.usersRepository.save({
      ...payload,
      password: hashedPassword,
      activatedAt: new Date(), // TODO: change this to null after adding emailing feature
    });

    // TODO: review this, there should be a better approach
    const { password, ...userData } = result;

    return userData;
  }

  // TODO: change return type from void to newly updated data
  async updateUser(id: number, payload: UpdateUserDto, file?: Express.Multer.File): Promise<void> {
    const user = await this.getUserByID(id);
    if (!user.activatedAt) {
      throw new ForbiddenException('Account is not activated');
    }

    const dataForUpdate: Partial<User> = {
      firstName: payload.firstName || user.firstName,
      lastName: payload.lastName || user.lastName,
      email: payload.email || user.email,
      activatedAt: user.activatedAt,
    };

    if (!!payload.password) {
      dataForUpdate.password = await hash(payload.password, +this.configService.get(EnvConfigEnum.HASH_SALT_ROUNDS));
    }

    if (!!file) {
      const attachment = await this.attachmentsService.createOrUpdate(
        this.profilePicturesPathInStorage,
        user.attachment?.id,
        file.filename,
      );
      if (!!attachment) {
        dataForUpdate.attachment = attachment;
      }
    } else if (!payload.profilePicture && !!user.attachment.id) {
      // TODO: Add check in IF statement to make sure url in payload is same as current profile picture in db
      // Delete profile picture
      await this.attachmentsService.deleteByID(user.attachment.id);
      dataForUpdate.attachment = null;
    }

    if (!!payload.email && payload.email !== dataForUpdate.email) {
      dataForUpdate.activatedAt = null;
      await this.usersRepository.update(user.id, dataForUpdate);

      // await sendAccountVerificationEmail({
      //   mailService: this.mailService,
      //   configService: this.configService,
      //   jwtService: this.jwtService,
      //   user: {
      //     id: user.id,
      //     firstName: payload.firstName,
      //     lastName: payload.lastName,
      //     email: payload.email,
      //   },
      //   isUpdateAccountRequest: true,
      // });
    } else {
      await this.usersRepository.update(user.id, dataForUpdate);
    }
  }

  async activateUserAccount(userID: number): Promise<void> {
    // Check if user exists
    await this.getUserByID(userID);

    // Verify account
    await this.usersRepository.update(userID, {
      activatedAt: new Date(),
    });
  }

  async changeUserPassword(userID: string, password: string): Promise<void> {
    if (!userID || !password) {
      throw new BadRequestException('userId ans password are required.');
    }

    const hashedPassword = await hash(password, +this.configService.get(EnvConfigEnum.HASH_SALT_ROUNDS));

    await this.usersRepository.update(userID, { password: hashedPassword });
  }

  async deleteUser(userID: number, currentUserId: number): Promise<void> {
    if (userID !== currentUserId) {
      throw new ForbiddenException();
    }

    const user = await this.getUserByID(userID);
    if (!user) {
      throw new NotFoundException('User with given id not found');
    }

    // if (!!user.profilePictureId) {
    //   await this.attachmentsService.deleteByID(user.profilePictureId);
    // }

    await this.usersRepository.delete(userID);
  }

  private get profilePicturesPathInStorage(): string {
    const names = [
      EnvConfigEnum.ROOT_STORAGE_PATH,
      EnvConfigEnum.IMAGES_PATH,
      EnvConfigEnum.PROFILE_PICTURES_IMAGES_PATH,
    ];
    return names.map((item) => this.configService.get(item)).join('/');
  }
}
