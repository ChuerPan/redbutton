# 别点红色按钮 - 游戏后端

轻量级游戏后端服务，支持全服排行榜和用户数据存储。

## 特性

- ✅ 独立运行（端口 3001），不影响现有服务
- ✅ SQLite 数据库，无需单独安装
- ✅ 简单的管理后台
- ✅ 完整的 API 接口
- ✅ 为抖音小游戏适配预留接口

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 初始化数据库

```bash
npm run init-db
```

### 3. 启动服务器

```bash
npm start
```

服务器将在 http://localhost:3001 启动

## API 文档

### 游戏端 API

#### 保存分数
```
POST /api/save-score
Body: {
  userId: "用户ID",
  userName: "用户名",
  coins: 1000,
  deathCount: 5,
  probability: 0.01
}
```

#### 获取排行榜
```
GET /api/leaderboard?limit=100
```

#### 保存用户数据
```
POST /api/save-user
Body: {
  userId: "用户ID",
  userName: "用户名",
  totalGames: 10,
  totalLosses: 3,
  maxCoinsEnded: 2000,
  maxCoinsLost: 1500,
  bonusCount: 2,
  gameHistory: [...]
}
```

#### 获取用户数据
```
GET /api/user-info?userId=xxx
```

### 管理后台

访问: http://localhost:3001/admin

功能:
- 查看所有排行榜记录
- 删除违规记录
- 分页浏览

## 部署到你的服务器

### 在你的服务器上:

1. 将 `server` 文件夹上传到服务器
2. 安装 Node.js (如果还没安装)
3. 安装依赖: `npm install`
4. 初始化数据库: `npm run init-db`
5. 启动服务: `npm start`

### 使用 PM2 保持运行（推荐）

```bash
npm install -g pm2
pm2 start server.js --name redbutton-game
pm2 save
pm2 startup
```

## 端口说明

- 默认使用 **3001** 端口
- 如需修改，编辑 `server.js` 中的 `PORT` 变量

## 下一步

1. 看 `game-server-adapter.js`（在项目根目录）了解如何修改游戏代码
2. 在抖音开放平台配置域名白名单
3. 配置 Nginx 反向代理（可选）
