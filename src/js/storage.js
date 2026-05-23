async function loadUserData() {
  // 先加载本地数据
  const savedUser = localStorage.getItem('pixelGameUser');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    gameState.userId = userData.userId;
    gameState.userName = userData.userName;
    gameState.avatarUrl = userData.avatarUrl || null;
    gameState.region = userData.region || "未知";
    gameState.hasSetUserName = userData.hasSetUserName || false;
    gameState.stats = { ...gameState.stats, ...userData.stats };
    gameState.bonusCount = gameState.stats.bonusCount || 0;
    gameState.highScore = gameState.stats.maxCoinsEnded || 0;
    if (!gameState.stats.history) gameState.stats.history = [];
  }

  // 尝试从服务器同步数据
  if (getIsOnline()) {
    try {
      const result = await getUserDataFromServer();
      if (result.success && result.data) {
        // 服务器有数据，覆盖本地
        const serverData = result.data;
        gameState.userName = serverData.userName || gameState.userName;
        gameState.avatarUrl = serverData.avatarUrl || null;
        gameState.region = serverData.region || gameState.region;
        gameState.hasSetUserName = serverData.hasSetUserName || false;
        if (serverData.totalGames !== undefined) {
          gameState.stats.totalGames = serverData.totalGames;
        }
        if (serverData.totalLosses !== undefined) {
          gameState.stats.totalLosses = serverData.totalLosses;
        }
        if (serverData.maxCoinsEnded !== undefined) {
          gameState.stats.maxCoinsEnded = serverData.maxCoinsEnded;
          gameState.highScore = serverData.maxCoinsEnded;
        }
        if (serverData.maxCoinsLost !== undefined) {
          gameState.stats.maxCoinsLost = serverData.maxCoinsLost;
        }
        if (serverData.bonusCount !== undefined) {
          gameState.stats.bonusCount = serverData.bonusCount;
          gameState.bonusCount = serverData.bonusCount;
        }
        if (serverData.gameHistory) {
          gameState.stats.history = serverData.gameHistory;
        }
        console.log('已从服务器同步用户数据');
        // 保存回本地，确保数据一致
        saveUserDataLocal();
      }
    } catch (error) {
      console.warn('从服务器同步数据失败，使用本地数据:', error);
    }
  }
}

/**
 * 仅保存到本地存储
 */
function saveUserDataLocal() {
  gameState.stats.bonusCount = gameState.bonusCount;
  gameState.stats.maxCoinsEnded = gameState.highScore;
  const userData = {
    userId: gameState.userId,
    userName: gameState.userName,
    avatarUrl: gameState.avatarUrl || null,
    region: gameState.region,
    hasSetUserName: gameState.hasSetUserName,
    stats: gameState.stats
  };
  localStorage.setItem('pixelGameUser', JSON.stringify(userData));
}

/**
 * 保存用户数据（本地+云端）
 */
async function saveUserData() {
  // 先保存到本地
  saveUserDataLocal();
  
  // 尝试保存到服务器
  if (getIsOnline()) {
    try {
      await saveUserDataToServer();
      console.log('用户数据已保存到服务器');
    } catch (error) {
      console.warn('保存用户数据到服务器失败:', error);
    }
  }
}

function saveRanking(coins, deathCount, probability) {
  const rankings = getRankings();
  rankings.push({
    userId: gameState.userId,
    userName: gameState.userName,
    region: gameState.region,
    coins: coins,
    deathCount: deathCount || 0,
    probability: probability || 0,
    date: new Date().toISOString()
  });
  
  const sortedRankings = rankings
    .sort((a, b) => {
      if (b.coins !== a.coins) return b.coins - a.coins;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 100);
  
  localStorage.setItem('pixelGameRankings', JSON.stringify(sortedRankings));
}

function getRankings() {
  const rankings = localStorage.getItem('pixelGameRankings');
  return rankings ? JSON.parse(rankings) : [];
}
