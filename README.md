# XieCheng 酒店预订全栈小程序

## 项目简介
本项目为“酒店预订”主题的小程序，支持用户在线浏览、筛选、查看地图与详情、选择日期、并完成酒店预订流程。项目采用 Taro 框架构建，适配微信小程序、H5 等多个端，配合 React + TypeScript 前端技术栈。旨在实现跨平台高效开发与良好用户体验。

## 功能模块
- 首页展示与酒店推荐 (`pages/index`)
- 酒店列表筛选与搜索 (`pages/hotel-list`, `pages/search`)
- 酒店地图定位与展示 (`pages/hotel-map`)
- 酒店详情页 (`pages/hotel-detail`)
- 预订日期选择与下单 (`pages/date-select`)
- 用户地理权限申请（支持定位附近酒店）

## 技术栈
- 前端框架：Taro 4.x（React 支持，TypeScript）
- UI组件库：NutUI for Taro
- 样式：Sass，Stylelint
- 工具链：Webpack5，Babel，Husky+Commitlint
- 配置文件：Taro 多平台适配、Typescript

主要依赖（`package.json`部分摘录）：
```json name=package.json url=https://github.com/FindNoName/XieCheng-hotel-fullstack-wxapp/blob/main/package.json
{
  "dependencies": {
    "@nutui/nutui-react-taro": "^3.0.19-cpp.26-beta.1",
    "@tarojs/components": "4.1.11",
    "@tarojs/react": "4.1.11",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 注意事项

- **项目需要配合后端 API 使用。请确保后端服务已启动。**后端详细源码请在 [GitHub 仓库](https://github.com/Nightin-g/hotel-server) 查看。
- 后端 API 地址默认为 `http://localhost:3000`，如需修改可在 [`vite.config.ts`](https://github.com/FindNoName/XieCheng-hotel-fullstack-wxapp/blob/main/vite.config.ts) 中设置。
- 用户认证信息存储在 `localStorage` 中，前端通过 JWT 与后端进行身份认证与权限管理。
- 请妥善保护 JWT Token 等用户敏感信息，避免泄露。

## 项目结构
参考主要目录和文件结构：

```
├── src
│   ├── app.config.ts              # 全局配置
│   ├── pages/
│   │   ├── index/                 # 首页
│   │   ├── hotel-list/            # 酒店列表
│   │   ├── hotel-map/             # 地图页
│   │   ├── hotel-detail/          # 酒店详情
│   │   ├── date-select/           # 日期选择页
│   │   ├── search/                # 搜索页
│   └── ...
├── babel.config.js                # Babel 配置
├── stylelint.config.mjs           # 样式检查配置
├── commitlint.config.mjs          # Git 提交规范配置
├── tsconfig.json                  # TypeScript 配置
├── project.config.json            # 微信小程序项目配置
├── package.json                   # 项目主依赖
├── .editorconfig                  # 代码风格配置
└── ...
```

## 快速启动

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动开发（以微信小程序为例）
   ```bash
   npm run dev:weapp
   ```
   其它平台参考 `package.json` 中 scripts，例如 `dev:h5`、`dev:alipay`、`dev:tt` 等。

3. 生成构建
   ```bash
   npm run build:weapp
   # 或其它平台，详见 scripts
   ```

4. 微信开发者工具导入 `dist/` 目录，配置 AppID（详见 `project.config.json`）。

---

项目结构与功能模块有参考代码片段及自动生成结果，详细源码请在 [GitHub 仓库](https://github.com/FindNoName/XieCheng-hotel-fullstack-wxapp) 查看。
