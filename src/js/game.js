function handleNuclearButtonClick() {
  // 如果正在显示失败界面，不响应点击（防止在等待金币飞完时误触）
  if (gameState.showingGameOver) {
    return;
  }
  
  if (!gameState.isPlaying) {
    restartGame();
    return;
  }
  
  const successProbability = gameState.isTestMode ? 0.5 : 0.99;
  const random = Math.random();
  
  if (random < successProbability) {
    const coinRandom = Math.random();
    const isBonus = coinRandom >= 0.99;
    const coinsToAdd = isBonus ? 200 : 100;
    
    gameState.coins += coinsToAdd;
    gameState.clickCount++;
    
    if (isBonus) {
      gameState.bonusCount++;
    }
    
    updateCoinDisplay();
    
    // 魔法出现金币！
    cityBuilder.addMagicCoin(false);
    if (isBonus) {
      setTimeout(() => {
        cityBuilder.addMagicCoin(true);
      }, 150);
    }
    
    showClickMessage(gameState.clickCount, isBonus);
  } else {
    console.log('💥 游戏失败！损失金币:', gameState.coins);
    gameState.stats.history.push({
      type: 'loss',
      coins: gameState.coins,
      timestamp: new Date().toISOString()
    });
    gameState.stats.totalLosses++;
    if (gameState.coins > gameState.stats.maxCoinsLost) {
      gameState.stats.maxCoinsLost = gameState.coins;
    }
    saveUserData();
    
    // 处理游戏失败（带爆炸效果）
    handleGameOver();
  }
}

// 处理游戏失败
function handleGameOver() {
  stopAutoClick();
  gameState.isPlaying = false;
  gameState.showingGameOver = true;
  
  // 隐藏提示消息
  clickMessage.style.display = 'none';
  if (gameState.clickMessageTimer) {
    clearTimeout(gameState.clickMessageTimer);
    gameState.clickMessageTimer = null;
  }
  
  // 清除双倍提示
  if (gameState.bonusMessageTimer) {
    clearTimeout(gameState.bonusMessageTimer);
    gameState.bonusMessageTimer = null;
  }
  gameState.showingBonus = false;
  bonusText.innerHTML = '';
  bonusText.style.display = 'none';
  
  // 设置损失的金币显示
  document.getElementById('lost-coins').textContent = formatCoins(gameState.coins);
  
  // 0.3秒内显示失败界面
  setTimeout(() => {
    showGameOverScreen();
  }, 250);
  
  // 同时播放爆炸效果
  cityBuilder.explode();
}

// 显示游戏失败界面
function showGameOverScreen() {
  const gameOverScreen = document.getElementById('game-over-screen');
  gameOverScreen.classList.add('show');
  gameOverScreen.classList.remove('hidden');
}

function toggleTestMode() {
  gameState.isTestMode = !gameState.isTestMode;
  testButton.textContent = gameState.isTestMode ? '测试中' : '测试';
  testButton.classList.toggle('bg-green-700', gameState.isTestMode);
  testButton.classList.toggle('bg-gray-700', !gameState.isTestMode);
}

async function endGame() {
  if (!gameState.isPlaying) return;
  
  gameState.stats.history.push({
    type: 'end',
    coins: gameState.coins,
    timestamp: new Date().toISOString()
  });
  gameState.stats.totalGames++;
  
  if (gameState.coins > gameState.highScore) {
    gameState.highScore = gameState.coins;
    updateHighScoreDisplay();
  }
  
  // 保存数据（本地+云端）
  await saveUserData();
  
  // 保存分数到服务器（仅在线时）
  if (getIsOnline() && gameState.coins > 0) {
    try {
      const probability = Math.pow(0.99, gameState.clickCount) * 100;
      await saveScoreToServer(gameState.coins, gameState.stats.totalLosses, probability);
    } catch (error) {
      // 静默处理保存错误
    }
  }
  
  // 设置要高亮的金币数
  highlightCoins = gameState.coins;
  
  gameState.isPlaying = false;
  
  // 隐藏提示消息
  clickMessage.style.display = 'none';
  if (gameState.clickMessageTimer) {
    clearTimeout(gameState.clickMessageTimer);
    gameState.clickMessageTimer = null;
  }
  
  // 清除双倍提示
  if (gameState.bonusMessageTimer) {
    clearTimeout(gameState.bonusMessageTimer);
    gameState.bonusMessageTimer = null;
  }
  gameState.showingBonus = false;
  bonusText.innerHTML = '';
  bonusText.style.display = 'none';
  
  // 判断是否是新玩家第一次有效成绩
  if (!gameState.hasSetUserName && gameState.coins > 0) {
    showNewPlayerNameModal();
  } else {
    showRanking();
  }
}

function restartGame() {
  stopAutoClick();
  // 隐藏失败界面
  const gameOverScreen = document.getElementById('game-over-screen');
  gameOverScreen.classList.remove('show');
  gameOverScreen.classList.add('hidden');
  
  // 立刻清除所有DOM金币
  const coins = gameArea.querySelectorAll('.falling-coin');
  coins.forEach(coin => {
    coin.remove();
  });
  
  // 重置格子图案（随机一个新的！）
  cityBuilder.reset();
  setTimeout(() => {
    cityBuilder.loadRandomPattern();
    cityBuilder.animate();
  }, 50);
  
  // 重置游戏状态
  gameState.coins = 0;
  gameState.clickCount = 0;
  gameState.isPlaying = true;
  gameState.showingGameOver = false;
  
  // 清除提示消息
  clickMessage.style.display = 'none';
  if (gameState.clickMessageTimer) {
    clearTimeout(gameState.clickMessageTimer);
    gameState.clickMessageTimer = null;
  }
  
  // 清除双倍提示
  if (gameState.bonusMessageTimer) {
    clearTimeout(gameState.bonusMessageTimer);
    gameState.bonusMessageTimer = null;
  }
  gameState.showingBonus = false;
  bonusText.innerHTML = '';
  bonusText.style.display = 'none';
  
  updateCoinDisplay();
}

function startAutoClick() {
  // 先清除可能存在的定时器
  stopAutoClick();
  
  // 设置1秒后的自动连点
  gameState.longPressTimer = setTimeout(() => {
    // 开始每0.3秒自动点击一次
    gameState.autoClickInterval = setInterval(() => {
      handleNuclearButtonClick();
    }, 300);
  }, 1000);
}

function stopAutoClick() {
  // 清除长按定时器
  if (gameState.longPressTimer) {
    clearTimeout(gameState.longPressTimer);
    gameState.longPressTimer = null;
  }
  // 清除自动连点定时器
  if (gameState.autoClickInterval) {
    clearInterval(gameState.autoClickInterval);
    gameState.autoClickInterval = null;
  }
}
