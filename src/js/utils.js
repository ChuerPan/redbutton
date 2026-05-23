function formatCoins(coins) {
  if (coins >= 1e12) return (coins / 1e12).toFixed(2) + '兆';
  if (coins >= 1e8) return (coins / 1e8).toFixed(2) + '亿';
  if (coins >= 1e4) return (coins / 1e4).toFixed(2) + '万';
  return coins.toFixed(2);
}

function getClickCountColor(n) {
  const colorStops = [
    { stop: 1, color: [200, 200, 200] },
    { stop: 5, color: [255, 255, 255] },
    { stop: 10, color: [52, 199, 89] },
    { stop: 20, color: [50, 130, 255] },
    { stop: 30, color: [175, 82, 222] },
    { stop: 50, color: [255, 159, 10] },
    { stop: 100, color: [255, 59, 48] },
    { stop: 200, color: [255, 0, 0] }
  ];
  
  if (n >= colorStops[colorStops.length - 1].stop) {
    return `rgb(${colorStops[colorStops.length - 1].color.join(',')})`;
  }
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (n >= colorStops[i].stop && n < colorStops[i + 1].stop) {
      const start = colorStops[i];
      const end = colorStops[i + 1];
      const ratio = (n - start.stop) / (end.stop - start.stop);
      const r = Math.round(start.color[0] + (end.color[0] - start.color[0]) * ratio);
      const g = Math.round(start.color[1] + (end.color[1] - start.color[1]) * ratio);
      const b = Math.round(start.color[2] + (end.color[2] - start.color[2]) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  return 'rgb(200, 200, 200)';
}

function getProbabilityColor(m) {
  let colorStops;
  
  if (m < 10) {
    colorStops = [
      { stop: 0, color: [100, 0, 0] },
      { stop: 5, color: [150, 0, 0] },
      { stop: 10, color: [255, 59, 48] }
    ];
  } else {
    colorStops = [
      { stop: 100, color: [52, 199, 89] },
      { stop: 80, color: [50, 130, 255] },
      { stop: 60, color: [50, 255, 255] },
      { stop: 40, color: [175, 82, 222] },
      { stop: 20, color: [255, 159, 10] },
      { stop: 10, color: [255, 59, 48] }
    ];
  }
  
  if (m >= colorStops[0].stop) {
    return `rgb(${colorStops[0].color.join(',')})`;
  }
  
  if (m <= colorStops[colorStops.length - 1].stop) {
    return `rgb(${colorStops[colorStops.length - 1].color.join(',')})`;
  }
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (m <= colorStops[i].stop && m > colorStops[i + 1].stop) {
      const start = colorStops[i];
      const end = colorStops[i + 1];
      const ratio = (start.stop - m) / (start.stop - end.stop);
      const r = Math.round(start.color[0] + (end.color[0] - start.color[0]) * ratio);
      const g = Math.round(start.color[1] + (end.color[1] - start.color[1]) * ratio);
      const b = Math.round(start.color[2] + (end.color[2] - start.color[2]) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  return 'rgb(255, 59, 48)';
}

function getCoinColorByProgress(progress) {
  let r, g, b;
  
  if (progress <= 1) {
    r = 255;
    g = Math.round(215 - 115 * progress);
    b = 0;
  } else {
    const excess = Math.min(progress - 1, 1);
    r = 255;
    g = Math.round(100 - 100 * excess);
    b = 0;
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}
