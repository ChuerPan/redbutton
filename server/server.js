const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dns = require('dns');
const os = require('os');

const app = express();
const PORT = 3001;  // 使用独立端口，不影响现有服务

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 连接数据库
const db = new Database(path.join(__dirname, 'game.db'));

// ==================== 游戏 API ====================

// 保存分数 - 保存游戏结束时保存分数
// 模拟IP到省份的映射（实际开发中可以使用IP地理位置库，如 ip2region）
function getRegionFromIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '本地';
  }
  // 这里只是模拟，实际开发应该接入真实的IP地理位置库
  // 例如：ip2region、GeoIP等
  return '未知';
}

// 获取用户真实IP
function getClientIP(req) {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  if (ip && ip.indexOf(',') > -1) {
    ip = ip.split(',')[0].trim();
  }
  return ip || 'unknown';
}

app.post('/api/save-score', (req, res) => {
  const { userId, userName, avatarUrl, region, coins, deathCount, probability } = req.body;
  
  if (!userId || coins == null) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }

  try {
    // 获取用户真实IP
    const clientIP = getClientIP(req);
    
    // 先获取当前排行榜第1000名的分数
    const checkStmt = db.prepare('SELECT coins FROM leaderboard ORDER BY coins DESC LIMIT 1 OFFSET 999');
    const thousandthScore = checkStmt.get();
    
    // 获取排行榜当前记录数
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM leaderboard');
    const { total } = countStmt.get();
    
    // 判断是否可以保存：总数<1000 或 分数高于第1000名
    let canSave = true;
    if (total >= 1000 && thousandthScore && coins <= thousandthScore.coins) {
      canSave = false;
    }
    
    if (canSave) {
      // 优先使用传入的region，否则从IP获取
      const finalRegion = region || getRegionFromIP(clientIP);
      
      const stmt = db.prepare(`
        INSERT INTO leaderboard (user_id, user_name, avatar_url, region, coins, death_count, probability)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(userId, userName || '匿名玩家', avatarUrl || null, finalRegion, coins, deathCount || 0, probability || 0);
      
      // 如果超过1000条，删除分数最低的
      if (total + 1 > 1000) {
        const deleteStmt = db.prepare(`
          DELETE FROM leaderboard 
          WHERE id NOT IN (
            SELECT id FROM leaderboard 
            ORDER BY coins DESC, created_at DESC 
            LIMIT 1000
          )
        `);
        deleteStmt.run();
      }
      
      res.json({ success: true, saved: true });
    } else {
      res.json({ success: true, saved: false, message: '分数不足以前1000名' });
    }
  } catch (error) {
    console.error('保存分数失败:', error);
    res.status(500).json({ success: false, error: '保存失败' });
  }
});

// 获取排行榜
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  try {
    const stmt = db.prepare(`
      SELECT * FROM leaderboard 
      ORDER BY coins DESC, created_at DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 保存用户数据
app.post('/api/save-user', (req, res) => {
  const { userId, userName, avatarUrl, region, totalGames, totalLosses, maxCoinsEnded, maxCoinsLost, bonusCount, gameHistory, hasSetUserName } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId 不能为空' });
  }

  try {
    // 获取用户真实IP
    const clientIP = getClientIP(req);
    const finalRegion = region || getRegionFromIP(clientIP);
    
    const historyJson = gameHistory ? JSON.stringify(gameHistory) : null;
    
    // 先检查用户是否已存在
    const checkStmt = db.prepare('SELECT * FROM user_stats WHERE user_id = ?');
    const existing = checkStmt.get(userId);
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_stats 
      (user_id, user_name, avatar_url, region, last_ip, has_set_user_name, total_games, total_losses, max_coins_ended, max_coins_lost, bonus_count, game_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      userId, 
      userName, 
      avatarUrl || null,
      finalRegion,
      clientIP,
      hasSetUserName ? 1 : 0,
      totalGames || 0, 
      totalLosses || 0, 
      maxCoinsEnded || 0, 
      maxCoinsLost || 0, 
      bonusCount || 0, 
      historyJson
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('保存用户数据失败:', error);
    res.status(500).json({ success: false, error: '保存失败' });
  }
});

// 获取用户数据
app.get('/api/user-info', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId 不能为空' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM user_stats WHERE user_id = ?');
    const row = stmt.get(userId);
    
    if (row) {
      // 转换字段名，把下划线命名转成驼峰命名
      const result = {
        user_id: row.user_id,
        userName: row.user_name,
        avatarUrl: row.avatar_url,
        region: row.region,
        lastIP: row.last_ip,
        hasSetUserName: row.has_set_user_name === 1,
        totalGames: row.total_games,
        totalLosses: row.total_losses,
        maxCoinsEnded: row.max_coins_ended,
        maxCoinsLost: row.max_coins_lost,
        bonusCount: row.bonus_count,
        gameHistory: row.game_history ? JSON.parse(row.game_history) : null
      };
      res.json({ success: true, data: result });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error('获取用户数据失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// ==================== 管理后台 API ====================

// 获取所有排行榜记录
app.get('/admin/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 200;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const stmt = db.prepare(`
      SELECT * FROM leaderboard ORDER BY coins DESC, created_at DESC LIMIT ? OFFSET ?`);
    const rows = stmt.all(limit, offset);
    
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM leaderboard');
    const { total } = countStmt.get();
    
    res.json({ 
      success: true, data: rows, total });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 删除排行榜记录
app.delete('/admin/api/leaderboard/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM leaderboard WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

// ==================== 静态文件服务 ====================
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 启动服务器
app.listen(PORT, () => {
  console.log(`
  🎮 别点红色按钮 - 游戏后端服务已启动!
  
  📡 API 地址: http://localhost:${PORT}
  📊 管理后台: http://localhost:${PORT}/admin
  📝 游戏 API:
    - POST /api/save-score - 保存分数
    - GET  /api/leaderboard - 获取排行榜
    - POST /api/save-user - 保存用户数据
    - GET  /api/user-info - 获取用户数据
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  db.close();
  process.exit(0);
});
