# 携程酒店管理系统 - PC端

## 项目简介

这是一个基于 React + TypeScript + Ant Design 的酒店管理系统PC端应用，支持酒店管理员和系统管理员两种角色。

## 功能模块

### 1. 用户登录/注册
- 支持酒店管理员和系统管理员两种角色注册
- 注册界面可选择角色进行注册
- 登录界面根据账号自动判断角色

### 2. 酒店信息录入/编辑/修改
- 酒店管理员可以上传/编辑酒店信息
- 支持提交审核操作
- 酒店信息包括：
  - 中文名称、英文名称
  - 地址、星级、电话
  - 最早入住时间、最晚退房时间
  - 酒店描述、备注信息

### 3. 酒店信息审核发布/禁用
- 系统管理员可以审核酒店信息
- 审核状态：通过/拒绝
- 已通过的酒店可以禁用
- 已禁用的酒店可以重新启用

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Axios
- Vite
- Day.js

## 项目结构

```
xiecheng-pc-frontend/
├── src/
│   ├── api/              # API接口
│   │   ├── auth.ts       # 认证相关接口
│   │   └── hotel.ts      # 酒店相关接口
│   ├── components/       # 公共组件
│   │   └── Layout/       # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── Login/        # 登录页
│   │   ├── Register/     # 注册页
│   │   ├── HotelList/    # 酒店列表
│   │   ├── HotelEdit/    # 酒店编辑
│   │   └── HotelReview/  # 酒店审核
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   │   ├── auth.ts       # 认证工具
│   │   └── request.ts    # HTTP请求封装
│   ├── App.tsx           # 应用入口
│   ├── main.tsx          # 主入口
│   └── index.css         # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 后端API对接

本项目对接的后端API基于 hotel-server 项目：

### 用户类型
- 0: 普通用户
- 1: 酒店管理员（对应前端的商户角色）
- 2: 系统管理员

### 酒店状态
- 0: 待审核
- 1: 已通过
- 2: 已拒绝
- 3: 已禁用

### API端点
- POST `/api/users/login` - 用户登录
- POST `/api/users/register` - 用户注册
- GET `/api/users/me` - 获取当前用户信息
- POST `/api/users/logout` - 用户登出
- GET `/api/hotels` - 获取酒店列表
- GET `/api/hotels/:id` - 获取酒店详情
- POST `/api/hotels` - 创建酒店
- PUT `/api/hotels/:id` - 更新酒店
- DELETE `/api/hotels/:id` - 删除酒店

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 构建生产版本

```bash
npm run build
```

## 注意事项

1. 本项目需要配合后端API使用，请确保后端服务已启动
2. 后端API地址默认为 `http://localhost:3000`，可在 `vite.config.ts` 中修改
3. 用户认证信息存储在 localStorage 中
4. 后端使用 JWT 进行身份认证

## 权限说明

### 酒店管理员角色
- 可以查看自己创建的酒店列表
- 可以新增、编辑、删除自己的酒店
- 可以提交酒店审核

### 系统管理员角色
- 可以查看所有酒店
- 可以审核通过或拒绝酒店信息
- 可以禁用已发布的酒店
- 可以启用已禁用的酒店

## 开发说明

### 状态映射
前端展示的状态与后端数据库状态的映射关系：
- 待审核 → hotelStatus = 0
- 已通过 → hotelStatus = 1
- 已拒绝 → hotelStatus = 2
- 已禁用 → hotelStatus = 3

### 字段映射
前端表单字段与后端数据库字段的映射：
- 酒店中文名称 → hotelNameZh
- 酒店英文名称 → hotelNameEn
- 酒店地址 → hotelAddress
- 酒店星级 → hotelStars
- 酒店电话 → hotelTele
- 酒店描述 → hotelDis
- 备注 → hotelRemark
- 最早入住时间 → earliestCheckIn
- 最晚退房时间 → latestCheckOut
- 酒店状态 → hotelStatus
- 用户ID → userId
