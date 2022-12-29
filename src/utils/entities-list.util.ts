import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions';

// entities
import { User } from '../routes/users/user.entity';

export function getEntitiesList(): BaseDataSourceOptions['entities'] {
  return [User];
}
