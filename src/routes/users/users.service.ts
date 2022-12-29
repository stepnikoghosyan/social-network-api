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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getUserByID(id: string): Promise<User> {
    const data = await this.usersRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  async getUserByEmail(email: string, includePassword = false): Promise<User> {
    let query = this.usersRepository.createQueryBuilder().addSelect('password').where('user.email = :email', { email });

    // TODO: check if this is working
    if (includePassword) {
      query = query.addSelect('password');
    }

    const user = await query.getOne();
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getUsersList(queryParams: UsersQueryParams, currentUserId: string): Promise<PaginationResponse<User>> {
    // const options: FindAndCountOptions<Post['_attributes']> = {
    //   ...this.getPaginationValues(queryParams),
    //   include: {
    //     model: Attachment,
    //     attributes: ['fileName'],
    //   },
    //   attributes: {
    //     exclude: ['profilePictureId', 'attachment', 'createdAt', 'updatedAt'],
    //     include: [[Sequelize.col('fileName'), 'profilePictureUrl']],
    //   },
    // };

    // TODO: Add profilePictureUrl calculated by profilePictureId
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
    });

    return {
      count,
      results,
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
    const plainObj = JSON.parse(JSON.stringify(result));
    const { password, ...userData } = plainObj;

    return userData;
  }

  // TODO: add file upload
  // TODO: change return type from void to newly updated data
  async updateUser(
    id: string,
    payload: UpdateUserDto,
    // file?: Express.Multer.File,
  ): Promise<void> {
    const user = await this.getUserByID(id);
    if (!user.activatedAt) {
      throw new ForbiddenException('Account is not activated');
    }

    const dataForUpdate: Partial<User> = {
      firstName: payload.firstName || user.firstName,
      lastName: payload.lastName || user.lastName,
      email: payload.email || user.email,
    };

    if (!!payload.password) {
      dataForUpdate.password = await hash(payload.password, +this.configService.get(EnvConfigEnum.HASH_SALT_ROUNDS));
    }

    // if (!!file) {
    //   const attachment = await this.attachmentsService.createOrUpdate(
    //     this.profilePicturesPathInStorage,
    //     user.profilePictureId,
    //     file.filename,
    //   );
    //   if (!!attachment) {
    //     dataForUpdate.profilePictureId = attachment.id;
    //   }
    // } else if (!payload.profilePicture && !!user.profilePictureId) {
    //   // TODO: Add check in IF statement to make sure url in payload is same as current profile picture in db
    //   // Delete profile picture
    //   await this.attachmentsService.deleteByID(user.profilePictureId);
    //   dataForUpdate.profilePictureId = null;
    // }

    if (payload.email !== dataForUpdate.email) {
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

  async activateUserAccount(userID: string): Promise<void> {
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

  async deleteUser(userID: string): Promise<void> {
    const user = await this.getUserByID(userID);
    if (!user) {
      throw new NotFoundException('User with given id not found');
    }

    // if (!!user.profilePictureId) {
    //   await this.attachmentsService.deleteByID(user.profilePictureId);
    // }

    await this.usersRepository.delete(userID);
  }

  // private get profilePicturesPathInStorage(): string {
  //   const names = [
  //     ConfigEnum.ROOT_STORAGE_PATH,
  //     ConfigEnum.IMAGES_PATH,
  //     ConfigEnum.PROFILE_PICTURES_IMAGES_PATH,
  //   ];
  //   return names.map((item) => this.configService.get(item)).join('/');
  // }
}
