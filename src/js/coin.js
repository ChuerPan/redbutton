function createFallingCoin(isBonus = false) {
  const coin = document.createElement('div');
  coin.className = `falling-coin ${isBonus ? 'bonus-coin' : ''}`;
  coin.style.position = 'absolute';
  coin.style.width = '32px';
  coin.style.height = '32px';
  
  const gameAreaWidth = gameArea.offsetWidth;
  const leftPos = Math.random() * (gameAreaWidth - 32);
  coin.style.left = `${leftPos}px`;
  coin.style.top = '-32px';
  
  const coinColor = isBonus ? 'gold' : 'pixelGold';
  const centerColor = isBonus ? 'yellow-400' : 'yellow-600';
  
  coin.innerHTML = `
    <div class="w-8 h-8 relative">
      <div class="w-2 h-2 bg-${coinColor} absolute top-0 left-2"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-0 left-4"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-2 left-0"></div>
      <div class="w-4 h-4 bg-${coinColor} absolute top-2 left-2"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-2 left-6"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-4 left-0"></div>
      <div class="w-4 h-4 bg-${coinColor} absolute top-4 left-2"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-4 left-6"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-6 left-2"></div>
      <div class="w-2 h-2 bg-${coinColor} absolute top-6 left-4"></div>
      <div class="w-2 h-2 bg-${centerColor} absolute top-3 left-3"></div>
    </div>
    <div class="coin-shadow hidden"></div>
  `;
  
  gameArea.appendChild(coin);
  animateCoinFall(coin);
}

function animateCoinFall(coin) {
  const gameAreaHeight = gameArea.offsetHeight;
  const shadow = coin.querySelector('.coin-shadow');
  let position = -32;
  let velocity = 0;
  const gravity = 0.5;
  const bounceFactor = 0.6;
  const groundLevel = gameAreaHeight - 32;
  let bounces = 0;
  const maxBounces = 3;
  
  function updatePosition() {
    if (bounces >= maxBounces && velocity < 1) {
      shadow.classList.remove('hidden');
      return;
    }
    
    velocity += gravity;
    position += velocity;
    
    if (position >= groundLevel) {
      position = groundLevel;
      velocity = -velocity * bounceFactor;
      bounces++;
    }
    
    coin.style.top = `${position}px`;
    requestAnimationFrame(updatePosition);
  }
  
  updatePosition();
}
