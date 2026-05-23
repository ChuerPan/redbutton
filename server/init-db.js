const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'game.db');

// 如果数据库已存在，先删除（方便测试）
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('已删除旧数据库，重新创建...');
}

const db = new Database(dbPath);

console.log('正在初始化数据库...');

// 创建排行榜表
db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT,
    avatar_url TEXT,
    region TEXT,
    coins INTEGER NOT NULL DEFAULT 0,
    death_count INTEGER DEFAULT 0,
    probability REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建用户数据表
db.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    user_name TEXT,
    avatar_url TEXT,
    region TEXT,
    last_ip TEXT,
    has_set_user_name INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    max_coins_ended INTEGER DEFAULT 0,
    max_coins_lost INTEGER DEFAULT 0,
    bonus_count INTEGER DEFAULT 0,
    game_history TEXT,  -- JSON格式存储
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建索引
db.exec('CREATE INDEX IF NOT EXISTS idx_leaderboard_coins ON leaderboard(coins DESC)');
db.exec('CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id)');

console.log('✅ 数据库初始化完成！');
console.log('数据库文件位置:', dbPath);

db.close();
