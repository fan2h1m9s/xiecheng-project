import { DataSource, DataSourceOptions } from 'typeorm';
import { Address } from '../entities/Address';
import { User } from '../entities/User';
import { Hotel } from '../entities/Hotel';
import { RoomType } from '../entities/RoomType';
import { Room } from '../entities/Room';
import { Order } from '../entities/Order';
import { OrderRoomRelation } from '../entities/OrderRoomRelation';
import { Keyword } from '../entities/Keyword';
import { KeywordRelation } from '../entities/KeywordRelation';
import dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'sh-cynosdbmysql-grp-32u86s4e.sql.tencentcdb.com',
  port: parseInt(process.env.DB_PORT || '22961', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'wxh123456!',
  database: process.env.DB_DATABASE || 'hotelServer',
  entities: [
    Address,
    User,
    Hotel,
    RoomType,
    Room,
    Order,
    OrderRoomRelation,
    Keyword,
    KeywordRelation
  ],
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || true,
  extra: {
    charset: 'utf8mb4'
  }
};

export const AppDataSource = new DataSource(typeOrmConfig);
