// ==========================================
// 网络通信层 - 处理与后端服务器的通信
// ==========================================

const SERVER_BASE = 'http://localhost:3001';  // 本地测试地址
// const SERVER_BASE = 'http://your-server.com:3001';  // 生产环境替换

let isOnline = false;
let connectionTimeout = null;

/**
 * 设置服务器地址
 */
function setServerBase(url) {
    window.SERVER_BASE = url;
}

/**
 * 检查网络连接状态
 */
async function checkConnection() {
    try {
        // 用简单的请求测试连接
        const controller = new AbortController();
        connectionTimeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${SERVER_BASE}/api/leaderboard?limit=1`, {
            signal: controller.signal
        });
        
        clearTimeout(connectionTimeout);
        isOnline = response.ok;
        return isOnline;
    } catch (error) {
        isOnline = false;
        return false;
    }
}

/**
 * 获取当前在线状态
 */
function getIsOnline() {
    return isOnline;
}

/**
 * 通用请求函数 - 带超时和错误处理
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${SERVER_BASE}${endpoint}`;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        isOnline = true;
        return result;
    } catch (error) {
        isOnline = false;
        
        let errorMsg = '服务器连接失败';
        if (error.name === 'AbortError') {
            errorMsg = '服务器连接超时';
        } else if (error.message.includes('HTTP')) {
            errorMsg = '服务器返回错误';
        }
        
        throw new Error(errorMsg);
    }
}

/**
 * 保存分数到服务器
 */
async function saveScoreToServer(coins, deathCount, probability) {
    return await apiRequest('/api/save-score', {
        method: 'POST',
        body: JSON.stringify({
            userId: gameState.userId,
            userName: gameState.userName,
            avatarUrl: gameState.avatarUrl || null,
            region: gameState.region,
            coins: coins,
            deathCount: deathCount,
            probability: probability
        })
    });
}

/**
 * 从服务器获取排行榜
 */
async function getLeaderboardFromServer() {
    return await apiRequest('/api/leaderboard?limit=100');
}

/**
 * 保存用户数据到服务器
 */
async function saveUserDataToServer() {
    return await apiRequest('/api/save-user', {
        method: 'POST',
        body: JSON.stringify({
            userId: gameState.userId,
            userName: gameState.userName,
            avatarUrl: gameState.avatarUrl || null,
            region: gameState.region,
            hasSetUserName: gameState.hasSetUserName,
            totalGames: gameState.stats.totalGames,
            totalLosses: gameState.stats.totalLosses,
            maxCoinsEnded: gameState.stats.maxCoinsEnded,
            maxCoinsLost: gameState.stats.maxCoinsLost,
            bonusCount: gameState.stats.bonusCount,
            gameHistory: gameState.stats.history
        })
    });
}

/**
 * 从服务器获取用户数据
 */
async function getUserDataFromServer() {
    return await apiRequest(`/api/user-info?userId=${gameState.userId}`);
}

/**
 * 显示网络错误提示
 */
function showNetworkError(error) {
    let message = '网络连接失败，请稍后再试';
    
    if (error.message && error.message.includes('超时')) {
        message = '服务器响应超时，请检查网络后再试';
    } else if (error.message && error.message.includes('错误')) {
        message = '服务器数据错误，请稍后再试';
    }
    
    alert(message);
}

/**
 * 初始化网络连接
 */
async function initNetwork() {
    const online = await checkConnection();
    
    if (!online) {
        showNetworkError(new Error('无法连接'));
    }
    
    updateOfflineIndicator();
    return online;
}

/**
 * 更新左下角离线提示
 */
function updateOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        if (isOnline) {
            indicator.style.display = 'none';
        } else {
            indicator.style.display = 'block';
        }
    }
}
