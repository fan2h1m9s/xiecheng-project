import { DataSource, DataSourceOptions } from 'typeorm';
import { Address } from '../entities/Address';
import { User } from '../entities/User';
import { Hotel } from '../entities/Hotel';
import { RoomType } from '../entities/RoomType';
import { Room } from '../entities/Room';
import { Order } from '../entities/Order';
import { OrderRoomRelation } from '../entities/OrderRoomRelation';
import { Keyword } from '../entities/Keyword';

export const typeOrmConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'hotel',
  entities: [
    Address,
    User,
    Hotel,
    RoomType,
    Room,
    Order,
    OrderRoomRelation,
    Keyword
  ],
  synchronize: false,
  logging: true,
};

export const AppDataSource = new DataSource(typeOrmConfig);
