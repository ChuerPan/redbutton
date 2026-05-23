function setupEventListeners() {
  // Start game button
  const startButtonEl = document.getElementById('start-button');
  if (startButtonEl) {
    startButtonEl.addEventListener('click', window.startGame);
  }
  
  // Restart button
  const restartButtonEl = document.getElementById('restart-button');
  if (restartButtonEl) {
    restartButtonEl.addEventListener('click', restartGame);
  }
  
  if (myInfoButton) {
    myInfoButton.removeEventListener('click', showMyInfo);
    myInfoButton.removeEventListener('click', window.showMyInfo);
    myInfoButton.addEventListener('click', window.showMyInfo);
    myInfoButton.style.pointerEvents = 'auto';
    myInfoButton.style.cursor = 'pointer';
  }
  
  if (rankingButton) {
    rankingButton.addEventListener('click', () => {
      showRanking();
    });
  }
  
  if (nuclearButton) {
    nuclearButton.removeEventListener('click', handleNuclearButtonClick);
    nuclearButton.addEventListener('click', handleNuclearButtonClick);
    
    // 长按事件 - 桌面端
    nuclearButton.addEventListener('mousedown', startAutoClick);
    nuclearButton.addEventListener('mouseup', stopAutoClick);
    nuclearButton.addEventListener('mouseleave', stopAutoClick);
    
    // 长按事件 - 移动端
    nuclearButton.addEventListener('touchstart', startAutoClick);
    nuclearButton.addEventListener('touchend', stopAutoClick);
    nuclearButton.addEventListener('touchcancel', stopAutoClick);
  }
  

  
  if (endButton) {
    endButton.removeEventListener('click', endGame);
    endButton.addEventListener('click', endGame);
  }
  
  if (closeRankingBtn) {
    closeRankingBtn.removeEventListener('click', hideRanking);
    closeRankingBtn.addEventListener('click', hideRanking);
  }
  
  if (closeMyInfoBtn) {
    closeMyInfoBtn.removeEventListener('click', hideMyInfo);
    closeMyInfoBtn.addEventListener('click', hideMyInfo);
  }
  
  // Edit name button
  if (editNameBtn) {
    editNameBtn.addEventListener('click', window.editUserName);
  }
  
  // Cancel edit name button
  if (cancelEditNameBtn) {
    cancelEditNameBtn.addEventListener('click', cancelEditUserName);
  }
  
  // Confirm edit name button
  if (confirmEditNameBtn) {
    confirmEditNameBtn.addEventListener('click', confirmEditUserName);
  }
  
  // Enter key in name input
  if (newNameInput) {
    newNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmEditUserName();
      }
    });
  }
  
  // 新玩家设置名称弹窗事件
  if (skipSetNameBtn) {
    skipSetNameBtn.addEventListener('click', skipSetName);
  }
  
  if (confirmSetNameBtn) {
    confirmSetNameBtn.addEventListener('click', confirmSetName);
  }
  
  if (newPlayerNameInput) {
    newPlayerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmSetName();
      }
    });
  }
  
  window.addEventListener('resize', () => {
    if (myInfoModal && myInfoModal.style.display === 'flex') {
      drawStatsChart();
    }
  });
  
  window.addEventListener('beforeunload', () => {
    if (gameState.isPlaying && gameState.coins > 0) {
      endGame();
    }
  });
}
