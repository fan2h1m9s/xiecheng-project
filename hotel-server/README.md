# 酒店预订系统后端服务

## 项目简介

本项目是一个基于 Node.js + Express.js + TypeScript 开发的酒店预订系统后端服务，使用 TypeORM 作为 ORM 框架，MySQL 作为数据库，Redis 作为缓存，Elasticsearch 作为搜索引擎。

## 技术栈

- **后端框架**: Express.js 5.2.1
- **开发语言**: TypeScript 5.9.3
- **数据库**: MySQL 8.0+
- **ORM 框架**: TypeORM 0.3.28
- **缓存**: Redis 5.10.0
- **搜索引擎**: Elasticsearch 7.17.4
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **环境配置**: dotenv
- **跨域处理**: cors

## 项目结构

```
hotel-server/
├── src/
│   ├── config/            # 配置文件
│   │   ├── elasticsearch.config.ts
│   │   ├── redis.config.ts
│   │   └── typeorm.config.ts
│   ├── controllers/       # 控制器
│   │   ├── hotel.controller.ts
│   │   ├── order.controller.ts
│   │   ├── room.controller.ts
│   │   └── user.controller.ts
│   ├── entities/          # 实体类
│   │   ├── Address.ts
│   │   ├── Hotel.ts
│   │   ├── Keyword.ts
│   │   ├── KeywordRelation.ts
│   │   ├── Order.ts
│   │   ├── OrderRoomRelation.ts
│   │   ├── Room.ts
│   │   ├── RoomType.ts
│   │   └── User.ts
│   ├── enums/             # 枚举类型
│   │   ├── hotel-region.enum.ts
│   │   ├── hotel-status.enum.ts
│   │   ├── order-status.enum.ts
│   │   ├── room-status.enum.ts
│   │   └── user-type.enum.ts
│   ├── middleware/        # 中间件
│   │   └── auth.middleware.ts
│   ├── routes/            # 路由配置
│   │   ├── hotel.routes.ts
│   │   ├── order.routes.ts
│   │   ├── room.routes.ts
│   │   └── user.routes.ts
│   ├── services/          # 服务层
│   │   ├── elasticsearch.service.ts
│   │   ├── hotel.service.ts
│   │   ├── order.service.ts
│   │   ├── room.service.ts
│   │   └── user.service.ts
│   ├── utils/             # 工具类
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   └── redis.util.ts
│   └── index.ts           # 应用入口
├── .gitignore
├── API文档.md             # API接口文档
├── Dockerfile             # Docker配置
├── LICENSE
├── README.md              # 项目说明
├── package-lock.json
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript配置
```

## 主要功能模块

### 1. 用户模块
- 用户注册、登录、登出
- 获取用户信息
- 用户管理（系统管理员）

### 2. 酒店模块
- 酒店列表查询
- 酒店详情查询
- 酒店创建、更新、删除
- 酒店搜索（基于Elasticsearch）
- 酒店数据同步到Elasticsearch

### 3. 房间模块
- 房间列表查询
- 房间详情查询
- 房间创建、更新、删除
- 房间类型管理
- 可用房间查询
- 按酒店/房型查询房间
- 房间状态更新

### 4. 订单模块
- 订单创建
- 订单支付
- 订单入住
- 订单退房
- 订单取消
- 订单查询
- 订单房间关系查询

## 快速开始

### 环境要求
- Node.js 16.0+
- MySQL 8.0+
- Redis 6.0+
- Elasticsearch 8.0+

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件，配置以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=hotelServer
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch配置
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 运行项目

#### 开发环境

```bash
npm run dev
```

#### 生产环境

```bash
# 构建
npm run build

# 运行
npm start
```

## API文档

详细的API接口文档请参考 [API文档.md](API文档.md) 文件。

## 数据库设计

### 主要数据表

1. **user** - 用户表
2. **hotel** - 酒店表
3. **room_type** - 房间类型表
4. **room** - 房间表
5. **order** - 订单表
6. **order_room_relation** - 订单房间关系表
7. **keyword** - 关键词表
8. **keyword_relation** - 关键词关系表
9. **address** - 地址表

### 数据同步

- 酒店数据会同步到Elasticsearch，用于搜索功能
- 用户会话信息存储在Redis中，用于身份认证

## 认证与授权

- 使用JWT进行身份认证
- 实现了基于角色的权限控制：
  - 普通用户：可查看酒店、房间信息，创建订单
  - 酒店管理员：可管理酒店、房间、订单
  - 系统管理员：可管理所有资源

## 项目特点

1. **TypeScript支持**：使用TypeScript提供类型安全
2. **模块化设计**：清晰的分层架构
3. **事务处理**：关键操作使用数据库事务确保数据一致性
4. **并发控制**：使用条件更新解决并发问题
5. **搜索功能**：集成Elasticsearch提供高效搜索
6. **缓存机制**：使用Redis提升性能
7. **安全性**：密码加密，JWT认证
8. **可扩展性**：模块化设计便于功能扩展

## 部署说明

详细的部署指南请参考 [前后端连接和部署指南.md](前后端连接和部署指南.md) 文件。

### Docker部署

项目提供了Dockerfile，可以通过Docker容器化部署：

```bash
# 构建镜像
docker build -t hotel-server .

# 运行容器
docker run -d -p 3000:3000 --name hotel-server hotel-server
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 许可证

本项目采用 ISC 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如果您有任何问题或建议，欢迎联系我们。

---

**注意**：本项目为训练营结营项目，仅供学习和参考使用。