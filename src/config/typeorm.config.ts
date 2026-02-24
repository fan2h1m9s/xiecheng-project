import { DataSource, DataSourceOptions } from 'typeorm';
import { Address } from '../entities/Address';
import { User } from '../entities/User';
import { Hotel } from '../entities/Hotel';
import { RoomType } from '../entities/RoomType';
import { Room } from '../entities/Room';
import { Order } from '../entities/Order';
import { OrderRoomRelation } from '../entities/OrderRoomRelation';
import { Keyword } from '../entities/Keyword';
import dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'hotel',
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
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || true,
};

export const AppDataSource = new DataSource(typeOrmConfig);
