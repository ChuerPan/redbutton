// ==========================================
// 游戏后端适配器 - 使用说明
// ==========================================
// 这个文件展示了如何修改游戏代码来配合后端使用
// 将这些函数整合到你的 game.js 和 storage.js 中

// 配置项
const SERVER_BASE = 'http://your-server.com:3001';  // 替换为你的服务器地址

// ==========================================
// 1. 修改 storage.js - 添加云存储功能
// ==========================================

/**
 * 保存分数到服务器
 */
async function saveScoreToServer(coins, deathCount, probability) {
  try {
    const response = await fetch(`${SERVER_BASE}/api/save-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: gameState.userId,
        userName: gameState.userName,
        coins: coins,
        deathCount: deathCount,
        probability: probability
      })
    });
    return await response.json();
  } catch (error) {
    console.error('保存分数到服务器失败:', error);
    return { success: false };
  }
}

/**
 * 保存用户数据到服务器
 */
async function saveUserDataToServer() {
  try {
    const response = await fetch(`${SERVER_BASE}/api/save-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: gameState.userId,
        userName: gameState.userName,
        hasSetUserName: gameState.hasSetUserName,
        totalGames: gameState.stats.totalGames,
        totalLosses: gameState.stats.totalLosses,
        maxCoinsEnded: gameState.stats.maxCoinsEnded,
        maxCoinsLost: gameState.stats.maxCoinsLost,
        bonusCount: gameState.stats.bonusCount,
        gameHistory: gameState.stats.history
      })
    });
    return await response.json();
  } catch (error) {
    console.error('保存用户数据到服务器失败:', error);
    return { success: false };
  }
}

/**
 * 从服务器获取排行榜
 */
async function getLeaderboardFromServer() {
  try {
    const response = await fetch(`${SERVER_BASE}/api/leaderboard?limit=100`);
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return [];
  }
}

/**
 * 从服务器获取用户数据
 */
async function getUserDataFromServer() {
  try {
    const response = await fetch(`${SERVER_BASE}/api/user-info?userId=${gameState.userId}`);
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return null;
  }
}

// ==========================================
// 2. 修改 game.js 中的 endGame 函数
// ==========================================

/* 
原代码修改示例:

async function endGame() {
  // ... 原有代码 ...
  
  // 保存到服务器
  if (gameState.coins > 0) {
    const probability = Math.pow(0.99, gameState.clickCount) * 100;
    await saveScoreToServer(gameState.coins, gameState.stats.totalLosses, probability);
  }
  await saveUserDataToServer();
  
  // 获取服务器排行榜
  const serverLeaderboard = await getLeaderboardFromServer();
  // 使用 serverLeaderboard 替代本地排行榜显示
  
  showRanking();
}
*/

// ==========================================
// 3. 修改 ranking.js 中的 showRanking 函数
// ==========================================

/* 
async function showRanking() {
  // 优先从服务器获取
  const rankings = await getLeaderboardFromServer();
  
  // 然后渲染...
}
*/

// ==========================================
// 4. 抖音小游戏适配（仅供参考）
// ==========================================

/*
// 抖音小游戏需要使用 tt.login 和 tt.request
// 以下是简单示例（需要根据实际情况完善）

// 初始化用户
function initTTUser() {
  tt.login({
    success(res) {
      // 用 code 换取 openid（需要服务端配合）
      // 然后设置 gameState.userId
    }
  });
}

// 封装抖音小游戏的网络请求
function ttRequest(url, options) {
  return new Promise((resolve, reject) => {
    tt.request({
      url: SERVER_BASE + url,
      ...options,
      success: resolve,
      fail: reject
    });
  });
}
*/

console.log('游戏后端适配器已加载!');
console.log('请根据这个文件修改你的游戏代码');
