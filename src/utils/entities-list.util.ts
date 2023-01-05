import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions';

// entities
import { User } from '../routes/users/user.entity';
import { Attachment } from '@common/modules/attachments/attachment.entity';
import { Room } from '../routes/rooms/room.entity';

export function getEntitiesList(): BaseDataSourceOptions['entities'] {
  return [User, Attachment, Room];
}
