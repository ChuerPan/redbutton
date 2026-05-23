// 保存当前要高亮的条目
let highlightCoins = null;

async function showRanking() {
  rankingList.innerHTML = '';
  let rankings = [];
  
  // 优先从服务器获取
  if (getIsOnline()) {
    try {
      const result = await getLeaderboardFromServer();
      if (result.success && result.data) {
        rankings = result.data;
        // 转换服务器返回的字段名，把下划线转成驼峰
        rankings = rankings.map(row => ({
          ...row,
          userId: row.user_id,
          userName: row.user_name,
          avatarUrl: row.avatar_url
        }));
      }
    } catch (error) {
      // 从服务器获取失败，使用本地数据
      rankings = getRankings();
    }
  } else {
    rankings = getRankings();
  }
  
  if (rankings.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="py-2 text-center">暂无排名数据</td>`;
    rankingList.appendChild(row);
  } else {
    rankings.forEach((ranking, index) => {
      const row = document.createElement('tr');
      // 前三名颜色
      let nameColor = '';
      if (index === 0) nameColor = 'style="color: #ffd700;"'; // 金色
      else if (index === 1) nameColor = 'style="color: #9932cc;"'; // 紫色
      else if (index === 2) nameColor = 'style="color: #b87333;"'; // 暗铜色
      
      // 高亮当前成绩
      let highlightClass = '';
      if (highlightCoins !== null && ranking.coins === highlightCoins && ranking.userId === gameState.userId) {
        highlightClass = 'bg-yellow-500 bg-opacity-30';
      }
      
      row.className = `border-b border-gray-700 last:border-0 ${ranking.userId === gameState.userId ? 'bg-gray-800 bg-opacity-50' : ''} ${highlightClass}`;
      
      let avatarHTML;
      if (ranking.avatarUrl) {
        avatarHTML = `<img src="${ranking.avatarUrl}" class="w-8 h-8 rounded" alt="头像" onerror="this.style.display='none'">`;
      } else {
        avatarHTML = `
          <div class="w-8 h-8 relative">
            <div class="w-2 h-2 bg-blue-500 absolute top-0 left-0"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-0 left-2"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-0 left-4"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-0 left-6"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-2 left-0"></div>
            <div class="w-2 h-2 bg-blue-400 absolute top-2 left-2"></div>
            <div class="w-2 h-2 bg-blue-400 absolute top-2 left-4"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-2 left-6"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-4 left-0"></div>
            <div class="w-2 h-2 bg-blue-400 absolute top-4 left-2"></div>
            <div class="w-2 h-2 bg-blue-400 absolute top-4 left-4"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-4 left-6"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-6 left-0"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-6 left-2"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-6 left-4"></div>
            <div class="w-2 h-2 bg-blue-500 absolute top-6 left-6"></div>
          </div>
        `;
      }
      
      // 格式化概率显示
      let probDisplay = '-';
      if (ranking.probability !== undefined && ranking.probability !== null) {
        if (ranking.probability >= 0.01) {
          probDisplay = ranking.probability.toFixed(Math.min(4, 50)) + '%';
        } else {
          probDisplay = ranking.probability.toFixed(50).replace(/0+$/, '').replace(/\.$/, '.0') + '%';
        }
      }
      
      const userNameDisplay = ranking.userName ? ranking.userName.substring(0, 8) + '...' : '匿名';
      
      row.innerHTML = `
        <td class="py-2 text-center" ${nameColor}>${index + 1}</td>
        <td class="py-2 text-center flex justify-center">${avatarHTML}</td>
        <td class="py-2 text-center" ${nameColor}>${userNameDisplay}</td>
        <td class="py-2 text-center" ${nameColor}>${ranking.region || '未知'}</td>
        <td class="py-2 text-center" ${nameColor}>${formatCoins(ranking.coins)}</td>
        <td class="py-2 text-center" ${nameColor}>${ranking.deathCount !== undefined ? ranking.deathCount : '-'}</td>
        <td class="py-2 text-center" ${nameColor}>${probDisplay}</td>
      `;
      
      rankingList.appendChild(row);
    });
  }
  
  addUserRankingEntry(rankings);
  rankingModal.style.display = 'flex';
}

function addUserRankingEntry(rankings) {
  const userEntry = rankings.find(r => r.userId === gameState.userId);
  let allRankings = [];
  
  if (getIsOnline()) {
    allRankings = rankings; // 使用刚才已经获取的服务器数据
  } else {
    allRankings = getRankings();
  }
  
  let userRank = 1;
  if (allRankings.length > 0) {
    const sortedAll = [...allRankings].sort((a, b) => {
      if (b.coins !== a.coins) return b.coins - a.coins;
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
    
    const userIndex = sortedAll.findIndex(r => r.userId === gameState.userId);
    userRank = userIndex > -1 ? userIndex + 1 : sortedAll.length + 1;
  }
  
  const avatar = `
    <div class="w-8 h-8 relative">
      <div class="w-2 h-2 bg-pixelGold absolute top-0 left-0"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-0 left-2"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-0 left-4"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-0 left-6"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-2 left-0"></div>
      <div class="w-2 h-2 bg-yellow-400 absolute top-2 left-2"></div>
      <div class="w-2 h-2 bg-yellow-400 absolute top-2 left-4"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-2 left-6"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-4 left-0"></div>
      <div class="w-2 h-2 bg-yellow-400 absolute top-4 left-2"></div>
      <div class="w-2 h-2 bg-yellow-400 absolute top-4 left-4"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-4 left-6"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-6 left-0"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-6 left-2"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-6 left-4"></div>
      <div class="w-2 h-2 bg-pixelGold absolute top-6 left-6"></div>
    </div>
  `;
  
  const currentCoins = gameState.isPlaying ? gameState.coins : 
                     (gameState.stats.history.length > 0 ? gameState.stats.history[gameState.stats.history.length - 1].coins : 0);
  
  // 计算当前用户的概率和死亡次数
  const currentProbability = Math.pow(0.99, gameState.clickCount) * 100;
  let userProbDisplay = '-';
  if (userEntry && userEntry.probability !== undefined && userEntry.probability !== null) {
    if (userEntry.probability >= 0.01) {
      userProbDisplay = userEntry.probability.toFixed(Math.min(4, 50)) + '%';
    } else {
      userProbDisplay = userEntry.probability.toFixed(50).replace(/0+$/, '').replace(/\.$/, '.0') + '%';
    }
  } else if (gameState.clickCount > 0) {
    if (currentProbability >= 0.01) {
      userProbDisplay = currentProbability.toFixed(Math.min(4, 50)) + '%';
    } else {
      userProbDisplay = currentProbability.toFixed(50).replace(/0+$/, '').replace(/\.$/, '.0') + '%';
    }
  }
  
  const userDeathCount = userEntry && userEntry.deathCount !== undefined ? userEntry.deathCount : gameState.stats.totalLosses;
  
  userRankingEntry.innerHTML = `
    <tr>
      <td class="py-2 font-bold text-center" style="color: #3b82f6;">${userRank > 100 ? '100+' : userRank}</td>
      <td class="py-2 text-center flex justify-center">${avatar}</td>
      <td class="py-2 font-bold text-center" style="color: #3b82f6;">${gameState.userName.substring(0, 8)}...(我)</td>
      <td class="py-2 text-center" style="color: #3b82f6;">${gameState.region}</td>
      <td class="py-2 font-bold text-center" style="color: #3b82f6;">${formatCoins(currentCoins)}</td>
      <td class="py-2 font-bold text-center" style="color: #3b82f6;">${userDeathCount}</td>
      <td class="py-2 font-bold text-center" style="color: #3b82f6;">${userProbDisplay}</td>
    </tr>
  `;
}
