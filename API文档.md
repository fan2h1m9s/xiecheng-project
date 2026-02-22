# 酒店后端服务接口文档

## 项目简介

本项目是一个酒店预订系统的后端服务，基于 Node.js + Express.js + TypeScript 开发，使用 TypeORM 作为 ORM 框架，MySQL 作为数据库，Redis 作为缓存。

## 接口总览

| 模块 | 路径前缀 | 功能描述 |
| --- | --- | --- |
| 用户 | /api/users | 处理用户的登录、注册、查询、更新、删除等 |
| 酒店 | /api/hotels | 处理酒店的创建、查询、更新、删除等 |
| 房间 | /api/rooms | 处理房间的创建、查询、更新、删除等 |
| 订单 | /api/orders | 处理订单的创建、查询、更新、删除等 |

## 认证方式

本系统使用 JWT (JSON Web Token) 进行身份认证。用户登录成功后，服务器会返回一个 JWT 令牌，客户端需要在后续的请求中携带该令牌，放在请求头的 `Authorization` 字段中。

## 接口详细信息

### 1. 用户模块

#### 1.1 用户登录

- **接口路径**: `/api/users/login`
- **请求方法**: POST
- **功能描述**: 用户登录，获取 JWT 令牌
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | userAccount | string | 是 | 用户账号 |
  | userPassword | string | 是 | 用户密码 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "success": true,
      "message": "登录成功",
      "user": {
        "id": 1,
        "userAccount": "admin",
        "userName": "管理员",
        "userType": 2
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **失败响应**:
    ```json
    {
      "success": false,
      "message": "账号和密码不能为空"
    }
    ```
    ```json
    {
      "success": false,
      "message": "用户名或密码错误"
    }
    ```
    ```json
    {
      "success": false,
      "message": "登录失败"
    }
    ```
- **权限要求**: 公开

#### 1.2 用户注册

- **接口路径**: `/api/users/register`
- **请求方法**: POST
- **功能描述**: 用户注册，创建新用户
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | userAccount | string | 是 | 用户账号 |
  | userPassword | string | 是 | 用户密码 |
  | userName | string | 否 | 用户姓名 |
  | userType | number | 否 | 用户类型（1: 普通用户, 2: 系统管理员, 3: 酒店管理员） |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "user": {
        "id": 3,
        "userAccount": "user2",
        "userName": "用户2",
        "userType": 1
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "账号已存在"
    }
    ```
    ```json
    {
      "error": "账号不能为空"
    }
    ```
    ```json
    {
      "error": "注册请求处理中，请稍后重试"
    }
    ```
    ```json
    {
      "error": "创建用户失败"
    }
    ```
- **权限要求**: 公开

#### 1.3 获取当前用户信息

- **接口路径**: `/api/users/me`
- **请求方法**: GET
- **功能描述**: 获取当前登录用户的信息
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "userAccount": "admin",
        "userType": 2
      }
    }
    ```
  - **失败响应**:
    ```json
    {
      "success": false,
      "message": "未登录"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 1.4 用户登出

- **接口路径**: `/api/users/logout`
- **请求方法**: POST
- **功能描述**: 用户登出，清除会话
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "success": true,
      "message": "登出成功"
    }
    ```
  - **失败响应**:
    ```json
    {
      "success": false,
      "message": "未提供令牌"
    }
    ```
    ```json
    {
      "success": false,
      "message": "无效的令牌"
    }
    ```
    ```json
    {
      "success": false,
      "message": "登出失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 1.5 获取所有用户

- **接口路径**: `/api/users`
- **请求方法**: GET
- **功能描述**: 获取所有用户列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "userAccount": "admin",
        "userName": "管理员",
        "userType": 2
      },
      {
        "id": 2,
        "userAccount": "user1",
        "userName": "用户1",
        "userType": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取用户列表失败"
    }
    ```
- **权限要求**: 需要系统管理员权限

#### 1.6 获取用户详情

- **接口路径**: `/api/users/:id`
- **请求方法**: GET
- **功能描述**: 根据 ID 获取用户详情
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 用户 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "userAccount": "admin",
      "userName": "管理员",
      "userType": 2
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "用户不存在"
    }
    ```
    ```json
    {
      "error": "获取用户失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 1.7 更新用户

- **接口路径**: `/api/users/:id`
- **请求方法**: PUT
- **功能描述**: 更新用户信息
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 用户 ID |
  | userPassword | string | 否 | 用户密码 |
  | userName | string | 否 | 用户姓名 |
  | userType | number | 否 | 用户类型（1: 普通用户, 2: 系统管理员, 3: 酒店管理员） |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "userAccount": "admin",
      "userName": "管理员1",
      "userType": 2
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "用户不存在"
    }
    ```
    ```json
    {
      "error": "更新用户失败"
    }
    ```
- **权限要求**: 需要系统管理员权限

#### 1.8 删除用户

- **接口路径**: `/api/users/:id`
- **请求方法**: DELETE
- **功能描述**: 删除用户
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 用户 ID |
- **响应格式**:
  - **成功响应**: 204 No Content
  - **失败响应**:
    ```json
    {
      "error": "删除用户失败"
    }
    ```
- **权限要求**: 需要系统管理员权限

### 2. 酒店模块

#### 2.1 获取所有酒店

- **接口路径**: `/api/hotels`
- **请求方法**: GET
- **功能描述**: 获取所有酒店列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "hotelName": "酒店1",
        "hotelAddress": "地址1",
        "hotelPhone": "1234567890",
        "hotelStatus": 1,
        "hotelRegion": 1
      },
      {
        "id": 2,
        "hotelName": "酒店2",
        "hotelAddress": "地址2",
        "hotelPhone": "0987654321",
        "hotelStatus": 1,
        "hotelRegion": 2
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取酒店列表失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 2.2 获取酒店详情

- **接口路径**: `/api/hotels/:id`
- **请求方法**: GET
- **功能描述**: 根据 ID 获取酒店详情
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 酒店 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "hotelName": "酒店1",
      "hotelAddress": "地址1",
      "hotelPhone": "1234567890",
      "hotelStatus": 1,
      "hotelRegion": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "酒店不存在"
    }
    ```
    ```json
    {
      "error": "获取酒店失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 2.3 创建酒店

- **接口路径**: `/api/hotels`
- **请求方法**: POST
- **功能描述**: 创建新酒店
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | hotelName | string | 是 | 酒店名称 |
  | hotelAddress | string | 是 | 酒店地址 |
  | hotelPhone | string | 是 | 酒店电话 |
  | hotelStatus | number | 是 | 酒店状态（1: 正常, 2: 暂停营业） |
  | hotelRegion | number | 是 | 酒店地区（1: 地区1, 2: 地区2, 3: 地区3, 4: 地区4, 5: 地区5） |
  | keywords | array | 否 | 关键词数组，用于ElasticSearch搜索 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 3,
      "hotelName": "酒店3",
      "hotelAddress": "地址3",
      "hotelPhone": "1112223333",
      "hotelStatus": 1,
      "hotelRegion": 3
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "创建酒店失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 2.4 更新酒店

- **接口路径**: `/api/hotels/:id`
- **请求方法**: PUT
- **功能描述**: 更新酒店信息
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 酒店 ID |
  | hotelName | string | 否 | 酒店名称 |
  | hotelAddress | string | 否 | 酒店地址 |
  | hotelPhone | string | 否 | 酒店电话 |
  | hotelStatus | number | 否 | 酒店状态（1: 正常, 2: 暂停营业） |
  | hotelRegion | number | 否 | 酒店地区（1: 地区1, 2: 地区2, 3: 地区3, 4: 地区4, 5: 地区5） |
  | keywords | array | 否 | 关键词数组，用于ElasticSearch搜索 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "hotelName": "酒店1更新",
      "hotelAddress": "地址1更新",
      "hotelPhone": "1234567890",
      "hotelStatus": 1,
      "hotelRegion": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "酒店不存在"
    }
    ```
    ```json
    {
      "error": "更新酒店失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限，且需要是酒店的所有者

#### 2.5 删除酒店

- **接口路径**: `/api/hotels/:id`
- **请求方法**: DELETE
- **功能描述**: 删除酒店
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 酒店 ID |
- **响应格式**:
  - **成功响应**: 204 No Content
  - **失败响应**:
    ```json
    {
      "error": "删除酒店失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限，且需要是酒店的所有者

#### 2.6 搜索酒店

- **接口路径**: `/api/hotels/search`
- **请求方法**: GET
- **功能描述**: 使用关键词搜索酒店（基于ElasticSearch）
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | q | string | 是 | 搜索关键词 |
  | page | number | 否 | 页码，默认1 |
  | pageSize | number | 否 | 每页数量，默认10 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "total": 1,
      "hits": [
        {
          "id": 1,
          "hotelName": "酒店1",
          "hotelAddress": "地址1",
          "hotelPhone": "1234567890",
          "hotelStatus": 1,
          "hotelRegion": 1
        }
      ],
      "page": 1,
      "pageSize": 10
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "搜索关键词不能为空"
    }
    ```
    ```json
    {
      "error": "搜索酒店失败"
    }
    ```
- **权限要求**: 公开

#### 2.7 同步酒店数据到ElasticSearch

- **接口路径**: `/api/hotels/sync-es`
- **请求方法**: POST
- **功能描述**: 将所有酒店数据同步到ElasticSearch
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "message": "酒店数据同步到ElasticSearch成功"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "同步酒店数据失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

### 3. 房间模块

#### 3.1 获取所有房间

- **接口路径**: `/api/rooms`
- **请求方法**: GET
- **功能描述**: 获取所有房间列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomNumber": "101",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      },
      {
        "id": 2,
        "roomNumber": "102",
        "roomPrice": 250,
        "roomStatus": 1,
        "roomTypeId": 2,
        "hotelId": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取房间列表失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.2 获取房间详情

- **接口路径**: `/api/rooms/:id`
- **请求方法**: GET
- **功能描述**: 根据 ID 获取房间详情
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 房间 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "roomNumber": "101",
      "roomPrice": 200,
      "roomStatus": 1,
      "roomTypeId": 1,
      "hotelId": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "房间不存在"
    }
    ```
    ```json
    {
      "error": "获取房间失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.3 获取所有房间类型

- **接口路径**: `/api/rooms/types/all`
- **请求方法**: GET
- **功能描述**: 获取所有房间类型列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomTypeName": "标准间",
        "roomTypeDescription": "标准双人间"
      },
      {
        "id": 2,
        "roomTypeName": "豪华间",
        "roomTypeDescription": "豪华双人间"
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取房间类型列表失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.4 创建房间

- **接口路径**: `/api/rooms`
- **请求方法**: POST
- **功能描述**: 创建新房间
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | roomNumber | string | 是 | 房间号 |
  | roomPrice | number | 是 | 房间价格 |
  | roomStatus | number | 是 | 房间状态（1: 空闲, 2: 已预订, 3: 已入住, 4: 维修中） |
  | roomTypeId | number | 是 | 房间类型 ID |
  | hotelId | number | 是 | 酒店 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 3,
      "roomNumber": "103",
      "roomPrice": 300,
      "roomStatus": 1,
      "roomTypeId": 3,
      "hotelId": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "创建房间失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 3.5 更新房间

- **接口路径**: `/api/rooms/:id`
- **请求方法**: PUT
- **功能描述**: 更新房间信息
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 房间 ID |
  | roomNumber | string | 否 | 房间号 |
  | roomPrice | number | 否 | 房间价格 |
  | roomStatus | number | 否 | 房间状态（1: 空闲, 2: 已预订, 3: 已入住, 4: 维修中） |
  | roomTypeId | number | 否 | 房间类型 ID |
  | hotelId | number | 否 | 酒店 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "roomNumber": "101",
      "roomPrice": 220,
      "roomStatus": 1,
      "roomTypeId": 1,
      "hotelId": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "房间不存在"
    }
    ```
    ```json
    {
      "error": "更新房间失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 3.6 删除房间

- **接口路径**: `/api/rooms/:id`
- **请求方法**: DELETE
- **功能描述**: 删除房间
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 房间 ID |
- **响应格式**:
  - **成功响应**: 204 No Content
  - **失败响应**:
    ```json
    {
      "error": "删除房间失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 3.7 创建房间类型

- **接口路径**: `/api/rooms/types`
- **请求方法**: POST
- **功能描述**: 创建新房间类型
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | roomTypeName | string | 是 | 房间类型名称 |
  | roomTypeDescription | string | 否 | 房间类型描述 |
  | keywords | array | 否 | 关键词数组，用于ElasticSearch搜索 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 3,
      "roomTypeName": "套房",
      "roomTypeDescription": "豪华套房"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "创建房间类型失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 3.8 更新房间类型

- **接口路径**: `/api/rooms/types/:id`
- **请求方法**: PUT
- **功能描述**: 更新房间类型信息
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 房间类型 ID |
  | roomTypeName | string | 否 | 房间类型名称 |
  | roomTypeDescription | string | 否 | 房间类型描述 |
  | keywords | array | 否 | 关键词数组，用于ElasticSearch搜索 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "roomTypeName": "标准间更新",
      "roomTypeDescription": "标准双人间更新"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "房间类型不存在"
    }
    ```
    ```json
    {
      "error": "更新房间类型失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 3.9 获取可用房间

- **接口路径**: `/api/rooms/available`
- **请求方法**: GET
- **功能描述**: 获取所有可用房间列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomNumber": "101",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      },
      {
        "id": 2,
        "roomNumber": "102",
        "roomPrice": 250,
        "roomStatus": 1,
        "roomTypeId": 2,
        "hotelId": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取可用房间失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.10 获取酒店房间

- **接口路径**: `/api/rooms/hotel/:hotelId`
- **请求方法**: GET
- **功能描述**: 根据酒店 ID 获取房间列表
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | hotelId | number | 是 | 酒店 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomNumber": "101",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      },
      {
        "id": 2,
        "roomNumber": "102",
        "roomPrice": 250,
        "roomStatus": 1,
        "roomTypeId": 2,
        "hotelId": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取酒店房间失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.11 按房型查询房间

- **接口路径**: `/api/rooms/room-type/:roomTypeId`
- **请求方法**: GET
- **功能描述**: 根据房型 ID 获取房间列表
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | roomTypeId | number | 是 | 房型 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomNumber": "101",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      },
      {
        "id": 3,
        "roomNumber": "103",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取房型房间失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.12 按酒店查询可用房间

- **接口路径**: `/api/rooms/hotel/:hotelId/available`
- **请求方法**: GET
- **功能描述**: 根据酒店 ID 获取可用房间列表
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | hotelId | number | 是 | 酒店 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "roomNumber": "101",
        "roomPrice": 200,
        "roomStatus": 1,
        "roomTypeId": 1,
        "hotelId": 1
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取酒店可用房间失败"
    }
    ```
- **权限要求**: 公开（普通用户可访问）

#### 3.13 更新房间状态

- **接口路径**: `/api/rooms/:id/status`
- **请求方法**: PUT
- **功能描述**: 更新房间状态
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 房间 ID |
  | status | number | 是 | 房间状态（1: 空闲, 2: 已预订, 3: 已入住, 4: 维修中） |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "roomNumber": "101",
      "roomPrice": 200,
      "roomStatus": 2,
      "roomTypeId": 1,
      "hotelId": 1
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "无效的房间状态"
    }
    ```
    ```json
    {
      "error": "房间不存在"
    }
    ```
    ```json
    {
      "error": "更新房间状态失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

### 4. 订单模块

#### 4.1 获取所有订单

- **接口路径**: `/api/orders`
- **请求方法**: GET
- **功能描述**: 获取所有订单列表
- **请求参数**: 无
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "orderNumber": "ORD202401010001",
        "userId": 1,
        "orderStatus": 1,
        "orderTotalPrice": 400,
        "orderCreateTime": "2024-01-01T00:00:00Z",
        "orderCheckInTime": "2024-01-02T14:00:00Z",
        "orderCheckOutTime": "2024-01-03T12:00:00Z"
      },
      {
        "id": 2,
        "orderNumber": "ORD202401010002",
        "userId": 2,
        "orderStatus": 2,
        "orderTotalPrice": 250,
        "orderCreateTime": "2024-01-01T01:00:00Z",
        "orderCheckInTime": "2024-01-03T14:00:00Z",
        "orderCheckOutTime": "2024-01-04T12:00:00Z"
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取订单列表失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.2 获取订单详情

- **接口路径**: `/api/orders/:id`
- **请求方法**: GET
- **功能描述**: 根据 ID 获取订单详情
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "orderNumber": "ORD202401010001",
      "userId": 1,
      "orderStatus": 1,
      "orderTotalPrice": 400,
      "orderCreateTime": "2024-01-01T00:00:00Z",
      "orderCheckInTime": "2024-01-02T14:00:00Z",
      "orderCheckOutTime": "2024-01-03T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "订单不存在"
    }
    ```
    ```json
    {
      "error": "获取订单失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.3 获取订单房间关系

- **接口路径**: `/api/orders/:id/relations`
- **请求方法**: GET
- **功能描述**: 根据订单 ID 获取订单房间关系列表
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    [
      {
        "id": 1,
        "orderId": 1,
        "roomId": 1
      },
      {
        "id": 2,
        "orderId": 1,
        "roomId": 2
      }
    ]
    ```
  - **失败响应**:
    ```json
    {
      "error": "获取订单房间关系失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.4 创建订单

- **接口路径**: `/api/orders`
- **请求方法**: POST
- **功能描述**: 创建新订单
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | userId | number | 是 | 用户 ID |
  | orderStatus | number | 是 | 订单状态（1: 待支付, 2: 已支付, 3: 已完成, 4: 已取消） |
  | orderTotalPrice | number | 是 | 订单总价 |
  | orderCheckInTime | string | 是 | 入住时间（ISO 格式） |
  | orderCheckOutTime | string | 是 | 退房时间（ISO 格式） |
  | roomIds | array | 是 | 房间 ID 数组 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 3,
      "orderNumber": "ORD202401010003",
      "userId": 1,
      "orderStatus": 1,
      "orderTotalPrice": 550,
      "orderCreateTime": "2024-01-01T02:00:00Z",
      "orderCheckInTime": "2024-01-04T14:00:00Z",
      "orderCheckOutTime": "2024-01-05T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "创建订单失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.5 支付订单

- **接口路径**: `/api/orders/:id/pay`
- **请求方法**: POST
- **功能描述**: 支付订单
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "orderNumber": "ORD202401010001",
      "userId": 1,
      "orderStatus": 2,
      "orderTotalPrice": 400,
      "orderCreateTime": "2024-01-01T00:00:00Z",
      "orderCheckInTime": "2024-01-02T14:00:00Z",
      "orderCheckOutTime": "2024-01-03T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "支付订单失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.6 订单入住

- **接口路径**: `/api/orders/:id/check-in`
- **请求方法**: POST
- **功能描述**: 处理订单入住
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
  | roomAssignments | array | 是 | 房间分配信息数组 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "orderNumber": "ORD202401010001",
      "userId": 1,
      "orderStatus": 3,
      "orderTotalPrice": 400,
      "orderCreateTime": "2024-01-01T00:00:00Z",
      "orderCheckInTime": "2024-01-02T14:00:00Z",
      "orderCheckOutTime": "2024-01-03T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "入住处理失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 4.7 订单退房

- **接口路径**: `/api/orders/:id/check-out`
- **请求方法**: POST
- **功能描述**: 处理订单退房
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
  | roomIds | array | 是 | 房间 ID 数组 |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "orderNumber": "ORD202401010001",
      "userId": 1,
      "orderStatus": 4,
      "orderTotalPrice": 400,
      "orderCreateTime": "2024-01-01T00:00:00Z",
      "orderCheckInTime": "2024-01-02T14:00:00Z",
      "orderCheckOutTime": "2024-01-03T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "退房处理失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

#### 4.8 取消订单

- **接口路径**: `/api/orders/:id/cancel`
- **请求方法**: POST
- **功能描述**: 取消订单
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
- **响应格式**:
  - **成功响应**:
    ```json
    {
      "id": 1,
      "orderNumber": "ORD202401010001",
      "userId": 1,
      "orderStatus": 5,
      "orderTotalPrice": 400,
      "orderCreateTime": "2024-01-01T00:00:00Z",
      "orderCheckInTime": "2024-01-02T14:00:00Z",
      "orderCheckOutTime": "2024-01-03T12:00:00Z"
    }
    ```
  - **失败响应**:
    ```json
    {
      "error": "取消订单失败"
    }
    ```
- **权限要求**: 需要登录（所有登录用户可访问）

#### 4.9 删除订单

- **接口路径**: `/api/orders/:id`
- **请求方法**: DELETE
- **功能描述**: 删除订单
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  | --- | --- | --- | --- |
  | id | number | 是 | 订单 ID |
- **响应格式**:
  - **成功响应**: 204 No Content
  - **失败响应**:
    ```json
    {
      "error": "删除订单失败"
    }
    ```
- **权限要求**: 需要酒店管理员或系统管理员权限

## 响应格式

### 成功响应

- **登录、注册接口**:
  ```json
  {
    "success": true,
    "message": "操作成功",
    "user": {
      "id": 1,
      "userAccount": "admin",
      "userName": "管理员",
      "userType": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **查询接口**:
  ```json
  [
    {
      "id": 1,
      "name": "名称"
    }
  ]
  ```

- **获取详情接口**:
  ```json
  {
    "id": 1,
    "name": "名称"
  }
  ```

- **创建接口**:
  ```json
  {
    "id": 1,
    "name": "名称"
  }
  ```

- **更新接口**:
  ```json
  {
    "id": 1,
    "name": "名称更新"
  }
  ```

- **删除接口**:
  ```
  204 No Content
  ```

### 错误响应

- **参数错误**:
  ```json
  {
    "success": false,
    "message": "参数错误"
  }
  ```

- **认证错误**:
  ```json
  {
    "success": false,
    "message": "未登录"
  }
  ```

- **权限错误**:
  ```json
  {
    "success": false,
    "message": "权限不足"
  }
  ```

- **服务器错误**:
  ```json
  {
    "success": false,
    "message": "服务器内部错误"
  }
  ```

## 错误处理

| 状态码 | 描述 |
| --- | --- |
| 200 | 操作成功 |
| 201 | 创建成功 |
| 204 | 删除成功 |
| 400 | 参数错误 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
