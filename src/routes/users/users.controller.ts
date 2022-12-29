import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

// services
import { UsersService } from './users.service';

// decorators
import { CurrentUser } from '@common/decorators/current-user.decorator';

// dto
import { UpdateUserDto } from './dto/update-user.dto';

// models
import { User } from './user.entity';
import { UsersQueryParams } from './models/users-query-params.model';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'showAll', type: Boolean, required: false })
  @ApiQuery({ name: 'excludeSelf', type: Boolean, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  get(@Query() queryParams: UsersQueryParams, @CurrentUser() currentUser: Partial<User>) {
    return this.usersService.getUsersList(queryParams, currentUser.id);
  }

  @Get('my-profile')
  getCurrentUserProfileData(@CurrentUser() currentUser: Partial<User>) {
    return this.usersService.getUserByID(currentUser.id);
  }

  @Get('/:id')
  getByID(@Param('id') userID: number) {
    return this.usersService.getUserByID(userID);
  }

  @Put('')
  @HttpCode(204)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profilePicture'))
  public updateUser(
    @CurrentUser() currentUser: Partial<User>,
    @Body() payload: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(currentUser.id, payload, file);
  }

  @Delete('/:id')
  @HttpCode(204)
  public delete(@Param('id') userID: number, @CurrentUser() currentUser: Partial<User>) {
    return this.usersService.deleteUser(userID, currentUser.id);
  }
}
