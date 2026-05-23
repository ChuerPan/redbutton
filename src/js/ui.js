const nuclearButton = document.getElementById('nuclear-button');
const endButton = document.getElementById('end-button');
const myInfoButton = document.getElementById('my-info-button');
const rankingButton = document.getElementById('ranking-button');
const coinCountEl = document.getElementById('coin-count');
const highScoreEl = document.getElementById('high-score');
const gameArea = document.getElementById('game-area');
const rankingModal = document.getElementById('ranking-modal');
const rankingList = document.getElementById('ranking-list');
const userRankingEntry = document.getElementById('user-ranking-entry');
const closeRankingBtn = document.getElementById('close-ranking');
const myInfoModal = document.getElementById('my-info-modal');
const closeMyInfoBtn = document.getElementById('close-my-info');
const totalGamesEl = document.getElementById('total-games');
const totalLossesEl = document.getElementById('total-losses');
const maxEndedEl = document.getElementById('max-ended');
const maxLostEl = document.getElementById('max-lost');
const bonusCountEl = document.getElementById('bonus-count');
const userIdEl = document.getElementById('user-id');
const userNameEl = document.getElementById('user-name');
const editNameBtn = document.getElementById('edit-name-btn');
const userRegionEl = document.getElementById('user-region');
const editNameModal = document.getElementById('edit-name-modal');
const newNameInput = document.getElementById('new-name-input');
const cancelEditNameBtn = document.getElementById('cancel-edit-name');
const confirmEditNameBtn = document.getElementById('confirm-edit-name');
const statsChart = document.getElementById('stats-chart')?.getContext('2d');
const statsChartElement = document.getElementById('stats-chart');
const clickMessage = document.getElementById('click-message');
const clickCountText = document.getElementById('click-count-text');
const probabilityText = document.getElementById('probability-text');
const bonusText = document.getElementById('bonus-text');
const newPlayerNameModal = document.getElementById('new-player-name-modal');
const newPlayerNameInput = document.getElementById('new-player-name-input');
const skipSetNameBtn = document.getElementById('skip-set-name');
const confirmSetNameBtn = document.getElementById('confirm-set-name');

function updateCoinDisplay() {
  const currentCoins = gameState.coins;
  coinCountEl.textContent = formatCoins(currentCoins);
  
  // 显示/隐藏结束游戏按钮
  if (currentCoins > 0) {
    endButton.classList.remove('hidden');
  } else {
    endButton.classList.add('hidden');
  }
  
  if (gameState.highScore > 0) {
    const progress = currentCoins / gameState.highScore;
    const coinColor = getCoinColorByProgress(progress);
    coinCountEl.style.color = coinColor;
  } else {
    coinCountEl.style.color = '#FFD700';
  }
}

function updateHighScoreDisplay() {
  highScoreEl.textContent = `最高纪录 ${formatCoins(gameState.highScore)}`;
}

function updateMyInfoDisplay() {
  totalGamesEl.textContent = gameState.stats.totalGames;
  totalLossesEl.textContent = gameState.stats.totalLosses;
  maxEndedEl.textContent = formatCoins(gameState.highScore);
  maxLostEl.textContent = formatCoins(gameState.stats.maxCoinsLost);
  bonusCountEl.textContent = gameState.bonusCount;
  userIdEl.textContent = gameState.userId;
  userNameEl.textContent = gameState.userName;
  if (userRegionEl) userRegionEl.textContent = gameState.region;
  drawStatsChart();
}

window.editUserName = function() {
  console.log('修改玩家名称按钮被点击');
  newNameInput.value = gameState.userName;
  editNameModal.style.display = 'flex';
  editNameModal.classList.remove('hidden');
  newNameInput.focus();
}

function cancelEditUserName() {
  editNameModal.style.display = 'none';
  editNameModal.classList.add('hidden');
  newNameInput.value = '';
}

function confirmEditUserName() {
  const newName = newNameInput.value;
  if (newName && newName.trim() !== '') {
    gameState.userName = newName.trim();
    gameState.hasSetUserName = true;
    userNameEl.textContent = gameState.userName;
    saveUserData();
    // 更新排行榜中的用户名称
    const rankings = getRankings();
    const userRankingIndex = rankings.findIndex(r => r.userId === gameState.userId);
    if (userRankingIndex !== -1) {
      rankings[userRankingIndex].userName = gameState.userName;
      localStorage.setItem('pixelGameRankings', JSON.stringify(rankings));
    }
  }
  cancelEditUserName();
}

function showClickMessage(count, isBonus = false) {
  console.log('显示提示文字, count:', count);
  
  const probability = Math.pow(0.99, count);
  
  let formattedProbability;
  if (probability >= 0.01) {
    formattedProbability = (probability * 100).toFixed(Math.min(4, 50));
  } else {
    formattedProbability = (probability * 100).toFixed(50).replace(/0+$/, '').replace(/\.$/, '.0');
  }
  
  const countColor = getClickCountColor(count);
  const probColor = getProbabilityColor(parseFloat(formattedProbability));
  
  let countText = `不可思议，您已连续点击<span style="color: ${countColor}">${count}</span>次！`;
  
  // 处理双倍奖励显示
  if (isBonus) {
    bonusText.innerHTML = `<span style="color: #FFD700; text-shadow: 0 0 8px #FFD700; font-size: 1.5em;">奖励x2</span>`;
    bonusText.style.display = 'block';
    bonusText.style.opacity = '1';
    bonusText.style.transform = 'scale(1)';
    bonusText.style.transition = 'all 0.3s ease';
    
    // 动画效果
    void bonusText.offsetWidth;
    bonusText.style.transform = 'scale(1.3)';
    setTimeout(() => {
      bonusText.style.transform = 'scale(1)';
    }, 200);
  } else {
    bonusText.innerHTML = '';
    bonusText.style.display = 'none';
  }
  
  clickCountText.innerHTML = countText;
  probabilityText.innerHTML = `这样的概率只有<span style="color: ${probColor}">${formattedProbability}</span>%！`;
  
  // 确保提示文字显示
  clickMessage.style.display = 'block';
  clickMessage.style.opacity = '1';
  clickMessage.style.transition = 'all 0.2s ease';
  
  // 先缩放到初始状态
  clickMessage.style.transform = 'translateY(0) scale(1)';
  
  // 强制重绘
  void clickMessage.offsetWidth;
  
  // 触发抖动 - 使用CSS transition
  setTimeout(() => {
    clickMessage.style.transform = 'translateY(-5px) scale(1.2)';
    
    // 返回到原始状态
    setTimeout(() => {
      clickMessage.style.transform = 'translateY(0) scale(1)';
    }, 150);
  }, 10);
}

window.showMyInfo = function() {
  console.log('尝试显示我的信息');
  updateMyInfoDisplay();
  if (myInfoModal) {
    myInfoModal.style.display = 'flex';
    setTimeout(drawStatsChart, 100);
  } else {
    console.error('未找到myInfoModal元素');
  }
}

window.hideMyInfo = function() {
  if (myInfoModal) {
    myInfoModal.style.display = 'none';
  }
}

function hideRanking() { 
  rankingModal.style.display = 'none'; 
  highlightCoins = null;
}

function drawStatsChart() {
  if (!statsChart || !statsChartElement) {
    console.error('Chart elements not found');
    return;
  }
  
  const container = document.querySelector('.chart-container');
  if (!container) {
    console.error('Chart container not found');
    return;
  }
  
  const containerWidth = container.clientWidth || 300;
  const containerHeight = container.clientHeight || 300;
  
  statsChartElement.width = containerWidth;
  statsChartElement.height = containerHeight;
  
  statsChart.clearRect(0, 0, containerWidth, containerHeight);
  
  const recentHistory = [...gameState.stats.history].slice(-20);
  
  if (recentHistory.length === 0) {
    statsChart.fillStyle = '#fff';
    statsChart.font = '10px Press Start 2P, cursive';
    statsChart.textAlign = 'center';
    statsChart.fillText('暂无游戏数据', statsChartElement.width / 2, statsChartElement.height / 2);
  }
  
  const padding = { top: 20, right: 30, bottom: 40, left: 80 };
  const chartWidth = statsChartElement.width - padding.left - padding.right;
  const chartHeight = statsChartElement.height - padding.top - padding.bottom;
  
  // 始终预留20个柱子的位置
  const maxSlots = 20;
  const maxCoins = recentHistory.length > 0 ? Math.max(...recentHistory.map(item => item.coins), 100) : 100;
  const barWidth = 10;
  // 按照20个柱子的位置计算间距，保持一致
  const availableWidth = chartWidth - 40; // 留出一些边距
  const barSpacing = Math.max(2, (availableWidth - barWidth * maxSlots) / (maxSlots - 1));
  
  statsChart.strokeStyle = '#666';
  statsChart.lineWidth = 1;
  
  statsChart.beginPath();
  statsChart.moveTo(padding.left, statsChartElement.height - padding.bottom);
  statsChart.lineTo(statsChartElement.width - padding.right, statsChartElement.height - padding.bottom);
  statsChart.stroke();
  
  statsChart.beginPath();
  statsChart.moveTo(padding.left, padding.top);
  statsChart.lineTo(padding.left, statsChartElement.height - padding.bottom);
  statsChart.stroke();
  
  const yTicks = 5;
  statsChart.fillStyle = '#fff';
  statsChart.font = '8px Press Start 2P, cursive';
  statsChart.textAlign = 'right';
  
  for (let i = 0; i <= yTicks; i++) {
    const y = statsChartElement.height - padding.bottom - (i * chartHeight / yTicks);
    const value = Math.round((i * maxCoins) / yTicks);
    
    statsChart.beginPath();
    statsChart.moveTo(padding.left - 5, y);
    statsChart.lineTo(padding.left, y);
    statsChart.stroke();
    
    statsChart.fillText(formatCoins(value), padding.left - 10, y + 3);
  }
  
  // 只绘制有数据的柱子和标签
  if (recentHistory.length > 0) {
    statsChart.textAlign = 'center';
    recentHistory.forEach((item, index) => {
      const x = padding.left + 20 + index * (barWidth + barSpacing) + barWidth / 2;
      const gameNumber = gameState.stats.history.length - recentHistory.length + index + 1;
      statsChart.fillText(`#${gameNumber}`, x, statsChartElement.height - padding.bottom + 15);
    });
    
    recentHistory.forEach((item, index) => {
      const barHeight = (item.coins / maxCoins) * chartHeight;
      const x = padding.left + 20 + index * (barWidth + barSpacing); // 增加20px的偏移，防止挡住y轴
      const y = statsChartElement.height - padding.bottom - barHeight;
      
      statsChart.fillStyle = item.type === 'loss' ? '#FF3B30' : '#34C759';
      statsChart.fillRect(x, y, barWidth, barHeight);
      
      statsChart.strokeStyle = '#000';
      statsChart.lineWidth = 1;
      statsChart.strokeRect(x, y, barWidth, barHeight);
      
      if (barHeight > 20) {
        statsChart.fillStyle = '#fff';
        statsChart.font = '7px Press Start 2P, cursive';
        statsChart.textAlign = 'center';
        statsChart.fillText(formatCoins(item.coins), x + barWidth / 2, y - 5);
      }
    });
  }
  
  statsChart.font = '8px Press Start 2P, cursive';
  statsChart.textAlign = 'center';
  statsChart.fillText('最近20次游戏', statsChartElement.width / 2, statsChartElement.height - 5);
  
  statsChart.save();
  statsChart.translate(15, statsChartElement.height / 2);
  statsChart.rotate(-Math.PI / 2);
  statsChart.fillText('金币数', 0, 0);
  statsChart.restore();
}

// 新玩家设置名称相关函数
function showNewPlayerNameModal() {
  newPlayerNameModal.style.display = 'flex';
  newPlayerNameModal.classList.remove('hidden');
  newPlayerNameInput.value = '';
  setTimeout(() => newPlayerNameInput.focus(), 100);
}

function hideNewPlayerNameModal() {
  newPlayerNameModal.style.display = 'none';
  newPlayerNameModal.classList.add('hidden');
  newPlayerNameInput.value = '';
}

function skipSetName() {
  gameState.hasSetUserName = true;
  saveUserData();
  hideNewPlayerNameModal();
  showRanking();
}

function confirmSetName() {
  const newName = newPlayerNameInput.value;
  if (newName && newName.trim() !== '') {
    gameState.userName = newName.trim();
    gameState.hasSetUserName = true;
    userNameEl.textContent = gameState.userName;
    saveUserData();
    
    // 更新排行榜中的用户名称
    const rankings = getRankings();
    const userRankingIndex = rankings.findIndex(r => r.userId === gameState.userId);
    if (userRankingIndex !== -1) {
      rankings[userRankingIndex].userName = gameState.userName;
      localStorage.setItem('pixelGameRankings', JSON.stringify(rankings));
    }
  } else {
    // 如果用户没有输入名称，仍然标记为已设置
    gameState.hasSetUserName = true;
    saveUserData();
  }
  
  hideNewPlayerNameModal();
  showRanking();
}
