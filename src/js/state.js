const gameState = {
  coins: 0,
  isPlaying: true,
  isTestMode: false,
  clickCount: 0,
  bonusCount: 0,
  highScore: 0,
  clickMessageTimer: null,
  bonusMessageTimer: null,
  showingBonus: false,
  showingGameOver: false,
  userId: null,
  userName: null,
  avatarUrl: null,
  region: "未知",
  hasSetUserName: false,
  longPressTimer: null,
  autoClickInterval: null,
  stats: {
    totalGames: 0,
    totalLosses: 0,
    maxCoinsEnded: 0,
    maxCoinsLost: 0,
    bonusCount: 0,
    history: []
  }
};

function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

function generateUserName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 16; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
}
