// 超酷炫像素图案系统！
class CityBuilder {
  constructor() {
    this.cityCanvas = null;
    this.cityCtx = null;
    this.grid = [];
    this.particles = [];
    this.magicAppearCoins = [];
    this.isExploding = false;
    this.animationFrame = null;
    this.coinSize = 12; // 金币大小
    
    this.patterns = this.getPatternLibrary();
  }

  getPatternLibrary() {
    return {
      heart: [
        '  XX    XX  ',
        ' XXXX  XXXX ',
        'XXXXXXXXXXXX',
        'XXXXXXXXXXXX',
        ' XXXXXXXXXX ',
        '  XXXXXXXX  ',
        '   XXXXXX   ',
        '    XXXX    ',
        '     XX     '
      ],
      star: [
        '     XX     ',
        '     XX     ',
        '   XXXXXX   ',
        ' XXXXXXXXXX ',
        'XXXXXXXXXXXX',
        ' XXXXXXXXXX ',
        '   XXXXXXXX ',
        '   XX    XX ',
        '  XX      XX',
        '  XX      XX'
      ],
      moon: [
        '    XXXX    ',
        '   XXXXXX   ',
        '  XXX  XXX  ',
        ' XXX    XXX ',
        ' XXX    XXX ',
        ' XXX    XXX ',
        '  XXX  XXX  ',
        '   XXXXXX   ',
        '    XXXX    '
      ],
      diamond: [
        '     XX     ',
        '    XXXX    ',
        '   XXXXXX   ',
        '  XXXXXXXX  ',
        ' XXXXXXXXXX ',
        '  XXXXXXXX  ',
        '   XXXXXX   ',
        '    XXXX    ',
        '     XX     '
      ],
      skull: [
        '   XXXXXX   ',
        '  XXXXXXXX  ',
        ' XXXXXXXXXXX',
        ' XX XX XX XX',
        ' XXXXXXXXXXX',
        ' XXXXXXXXXX ',
        '  XX    XX  ',
        '  XX XX XX  ',
        '   XXXXXX   ',
        '    XXXX    '
      ],
      mushroom: [
        '    XXXX    ',
        '   XXXXXX   ',
        '  XXXXXXXX  ',
        ' XXXXXXXXXX ',
        ' XXOXXOXXXX ',
        ' XXXXXXXXXX ',
        '   XXXXXX   ',
        '   XXXXXX   ',
        '   XXXXXX   '
      ],
      pacman: [
        '   XXXXX    ',
        '  XXXXXXX   ',
        ' XXXXXXXXX  ',
        ' XXXXXXX    ',
        ' XXXXX      ',
        ' XXXXXXX    ',
        ' XXXXXXXXX  ',
        '  XXXXXXX   ',
        '   XXXXX    '
      ],
      ghost: [
        '  XXXXXXXX  ',
        ' XXXXXXXXXX ',
        ' XX XX XX XX',
        ' XXXXXXXXXX ',
        ' XXXXXXXXXX ',
        ' XXXXXXXXXX ',
        ' X X  X X X ',
        '  X    X    '
      ],
      triforce: [
        '            ',
        '            ',
        '     XX     ',
        '    XXXX    ',
        '   XXXXXX   ',
        '  XX    XX  ',
        ' XXXX  XXXX ',
        'XXXXXXXXXXXX'
      ],
      pixel_heart: [
        '   XX  XX   ',
        '  XXXXXXXX  ',
        ' XXXXXXXXXX ',
        ' XXXXXXXXXX ',
        '  XXXXXXXX  ',
        '   XXXXXX   ',
        '    XXXX    ',
        '     XX     '
      ]
    };
  }

  // 超倍扩图案！
  expandPattern(patternData) {
    const expanded = [];
    for (let y = 0; y < patternData.length; y++) {
      const row = patternData[y];
      let newRow = '';
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        newRow += char + char + char + char; // 4倍
      }
      expanded.push(newRow);
      expanded.push(newRow);
      expanded.push(newRow);
      expanded.push(newRow);
    }
    return expanded;
  }

  init() {
    let cityCanvas = document.getElementById('city-canvas');
    if (!cityCanvas) {
      cityCanvas = document.createElement('canvas');
      cityCanvas.id = 'city-canvas';
      cityCanvas.style.position = 'absolute';
      cityCanvas.style.top = 'calc(50% - 50px)';
      cityCanvas.style.left = '50%';
      cityCanvas.style.transform = 'translate(-50%, -50%)';
      cityCanvas.style.pointerEvents = 'none';
      cityCanvas.style.zIndex = '5';
      cityCanvas.style.width = '600px';
      cityCanvas.style.height = '600px';
      gameArea.appendChild(cityCanvas);
    }
    
    // 如果画布已存在，更新位置
    if (cityCanvas) {
      cityCanvas.style.top = 'calc(50% - 50px)';
    }
    
    this.cityCanvas = cityCanvas;
    this.cityCtx = cityCanvas.getContext('2d');
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    
    this.animate();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.cityCanvas.width = 600 * dpr;
    this.cityCanvas.height = 600 * dpr;
    this.cityCtx.scale(dpr, dpr);
  }

  loadRandomPattern() {
    const patternNames = Object.keys(this.patterns);
    const randomName = patternNames[Math.floor(Math.random() * patternNames.length)];
    return this.loadPattern(randomName);
  }

  loadPattern(patternName) {
    const patternData = this.patterns[patternName];
    if (!patternData) return;
    
    const expandedPattern = this.expandPattern(patternData);
    
    this.grid = [];
    
    const canvasWidth = 600;
    const canvasHeight = 600;
    
    const patternHeight = expandedPattern.length;
    const patternWidth = expandedPattern[0].length;
    
    const startX = Math.floor((canvasWidth - patternWidth * this.coinSize) / 2);
    const startY = Math.floor((canvasHeight - patternHeight * this.coinSize) / 2);
    
    for (let py = 0; py < patternHeight; py++) {
      this.grid[py] = [];
      const row = expandedPattern[py];
      for (let px = 0; px < patternWidth; px++) {
        const char = row[px];
        this.grid[py][px] = {
          exists: char === 'X' || char === 'O',
          isBonus: char === 'O',
          filled: false,
          x: startX + px * this.coinSize,
          y: startY + py * this.coinSize
        };
      }
    }
  }

  addMagicCoin(isBonus = false) {
    const availableSlots = [];
    
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell && cell.exists && !cell.filled) {
          availableSlots.push({ x, y, cell });
        }
      }
    }
    
    if (availableSlots.length === 0) {
      const allSlots = [];
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] && this.grid[y][x].exists) {
            allSlots.push({ x, y });
          }
        }
      }
      if (allSlots.length === 0) return;
      
      const randomSlot = allSlots[Math.floor(Math.random() * allSlots.length)];
      this.grid[randomSlot.y][randomSlot.x].filled = false;
      availableSlots.push({ 
        x: randomSlot.x, 
        y: randomSlot.y, 
        cell: this.grid[randomSlot.y][randomSlot.x] 
      });
    }
    
    const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
    
    // 从目标格子上方10像素位置开始
    const startX = slot.cell.x + this.coinSize / 2;
    const startY = slot.cell.y - 10;
    
    this.magicAppearCoins.push({
      x: startX,
      y: startY,
      startY: startY,
      targetX: slot.cell.x + this.coinSize / 2,
      targetY: slot.cell.y + this.coinSize / 2,
      targetGridX: slot.x,
      targetGridY: slot.y,
      progress: 0,
      isBonus: isBonus
    });
  }

  animate() {
    this.updateMagicCoins();
    this.draw();
    this.drawMagicCoins();
    
    if (!this.isExploding) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  updateMagicCoins() {
    for (let i = this.magicAppearCoins.length - 1; i >= 0; i--) {
      const coin = this.magicAppearCoins[i];
      
      coin.progress += 0.04;
      
      // 平滑移动到目标位置
      if (coin.progress < 1) {
        const t = coin.progress;
        // 缓动函数：ease out quad
        const easeT = t * (2 - t);
        coin.y = coin.startY + (coin.targetY - coin.startY) * easeT;
        coin.x = coin.targetX;
      } else {
        coin.y = coin.targetY;
        coin.x = coin.targetX;
      }
      
      // 当 progress 达到 0.9 时，立刻设置 filled
      if (coin.progress >= 0.9 && coin.progress < 1) {
        if (this.grid[coin.targetGridY] && this.grid[coin.targetGridY][coin.targetGridX]) {
          this.grid[coin.targetGridY][coin.targetGridX].filled = true;
          this.grid[coin.targetGridY][coin.targetGridX].isBonus = coin.isBonus;
        }
      }
      
      // 超过 1 后再删除
      if (coin.progress >= 1) {
        this.magicAppearCoins.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.cityCtx;
    const canvasWidth = 600;
    const canvasHeight = 600;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell && cell.exists && !cell.filled) {
          const cx = cell.x + this.coinSize / 2;
          const cy = cell.y + this.coinSize / 2;
          
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
          
          ctx.beginPath();
          ctx.arc(cx, cy, this.coinSize / 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        }
      }
    }
    
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell && cell.filled) {
          this.drawPixelCoin(ctx, cell.x, cell.y, cell.isBonus);
        }
      }
    }
  }

  drawMagicCoins() {
    const ctx = this.cityCtx;
    
    this.magicAppearCoins.forEach(coin => {
      const cx = coin.x;
      const cy = coin.y;
      
      // 计算发光量：普通金币发光逐渐消失，双倍金币保持发光
      let glowAmount;
      if (coin.isBonus) {
        // 双倍金币保持稳定发光
        glowAmount = 1;
      } else {
        // 普通金币发光逐渐消失
        glowAmount = Math.max(0, 1 - coin.progress);
      }
      
      // 设置外发光
      ctx.shadowBlur = 8 + glowAmount * 8;
      ctx.shadowColor = coin.isBonus ? 
        `rgba(180, 100, 255, ${0.4 + glowAmount * 0.4})` : 
        `rgba(255, 215, 0, ${0.3 + glowAmount * 0.4})`;
      
      // 绘制金币
      ctx.save();
      ctx.translate(cx, cy);
      this.drawPixelCoin(ctx, -this.coinSize/2, -this.coinSize/2, coin.isBonus);
      ctx.restore();
      
      ctx.shadowBlur = 0;
    });
  }

  // 像素金币 - 紫金色双倍奖励！
  drawPixelCoin(ctx, x, y, isBonus = false) {
    const size = this.coinSize;
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    // 保持原本金币形态
    const pixelColors = [
      '   XXXX   ',
      '  XXYYXX  ',
      ' XXYYYYXX ',
      ' XXYYYYXX ',
      ' XXYYYYXX ',
      ' XXYYYYXX ',
      '  XXYYXX  ',
      '   XXXX   '
    ];
    
    const pixelSize = size / 8;
    
    // 双倍金币额外紫色光芒
    if (isBonus) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(180, 100, 255, 0.9)';
      
      // 额外发光外圈
      const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      glowGradient.addColorStop(0, 'rgba(255, 220, 255, 0.5)');
      glowGradient.addColorStop(0.5, 'rgba(180, 100, 255, 0.3)');
      glowGradient.addColorStop(1, 'rgba(180, 100, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }
    
    // 绘制金币本体
    for (let py = 0; py < 8; py++) {
      for (let px = 0; px < 8; px++) {
        const char = pixelColors[py] && pixelColors[py][px] || ' ';
        let color;
        
        if (char === 'X') {
          color = '#5C4A0F';
        } else if (char === 'Y') {
          color = '#D4AF37';
        } else {
          continue;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(
          x + px * pixelSize,
          y + py * pixelSize,
          pixelSize + 0.5,
          pixelSize + 0.5
        );
      }
    }
    
    // $ 符号
    ctx.fillStyle = '#5C4A0F';
    ctx.font = `bold ${Math.floor(size * 0.5)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy);
    
    ctx.shadowBlur = 0;
  }

  explode(callback) {
    if (this.isExploding) return;
    
    this.isExploding = true;
    this.particles = [];
    
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell && cell.filled) {
          const px = cell.x + this.coinSize / 2;
          const py = cell.y + this.coinSize / 2;
          
          const velocityX = (Math.random() - 0.5) * 30;
          const velocityY = -Math.random() * 30 - 15;
          
          this.particles.push({
            x: px,
            y: py,
            vx: velocityX,
            vy: velocityY,
            size: this.coinSize,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.5,
            life: 1,
            gravity: 0.7,
            isBonus: cell.isBonus
          });
        }
      }
    }
    
    this.grid = [];
    this.magicAppearCoins = [];
    this.animateExplosion(callback);
  }

  animateExplosion(callback) {
    const ctx = this.cityCtx;
    const canvasWidth = 600;
    const canvasHeight = 600;
    
    let frameCount = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      let allDead = true;
      
      this.particles.forEach((p, index) => {
        if (p.life <= 0) return;
        
        allDead = false;
        
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.006;
        p.vx *= 0.99;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.life;
        
        const size = Math.max(p.size * p.life, 4);
        
        this.drawPixelCoin(ctx, -size/2, -size/2, p.isBonus);
        
        ctx.restore();
      });
      
      frameCount++;
      
      if (!allDead && frameCount < 500) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isExploding = false;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (callback) callback();
      }
    };
    
    animate();
  }

  reset() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.isExploding = false;
    this.grid = [];
    this.particles = [];
    this.magicAppearCoins = [];
    
    if (this.cityCtx) {
      this.cityCtx.clearRect(0, 0, 600, 600);
    }
  }
}

const cityBuilder = new CityBuilder();
