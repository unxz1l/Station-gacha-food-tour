// 遊戲變數
let score = 0;
let isJumping = false;
let isCrouching = false;
let isGameOver = false;
let gameSpeed = 4;
let obstacleInterval = 2000;
let lastObstacleTime = 0;
let animationId;
let obstacles = [];
let sleepers = [];
let grassPatches = [];
let mountains = [];
let clouds = [];

// 台鐵車站名稱
const stationNames = [
    "臺北車站", "板橋車站", "桃園車站", "新竹車站", "臺中車站",
    "嘉義車站", "臺南車站", "高雄車站", "花蓮車站", "臺東車站",
    "宜蘭車站", "基隆車站", "彰化車站", "斗六車站", "屏東車站",
    "潮州車站", "瑞芳車站", "三坑車站", "猴硐車站", "汐止車站",
    "南港車站", "松山車站", "萬華車站", "七堵車站", "百福車站"
];

// DOM 元素
const startScreen = document.getElementById('start-screen');
const startScene = document.getElementById('start-scene');
const startBtn = document.getElementById('start-btn');
const gameScreen = document.getElementById('game-screen');
const cat = document.getElementById('cat');
const track = document.getElementById('track');
const scoreValue = document.getElementById('score-value');
const gameOverScreen = document.getElementById('game-over');
const stationNameElement = document.getElementById('station-name');
const restartBtn = document.getElementById('restart-btn');
const mountainsContainer = document.getElementById('mountains');
const cloudsContainer = document.getElementById('clouds');
const grassContainer = document.getElementById('grass-container');

// 創建開場場景
function createStartScene() {
    startScene.innerHTML = `
        <svg width="1000" height="400" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#e8d9c3" />
                    <stop offset="100%" stop-color="#b7d0e6" />
                </linearGradient>
                <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#4da1c8" />
                    <stop offset="100%" stop-color="#7ab4d8" />
                </linearGradient>
            </defs>

            <!-- 背景層 -->
            <g id="bg">
                <!-- 天空 -->
                <rect x="0" y="0" width="1000" height="250" fill="url(#sunsetGrad)" />
                
                <!-- 海面 -->
                <rect x="0" y="250" width="1000" height="150" fill="url(#seaGrad)" />
                
                <!-- 海浪 -->
                <path d="M0,250 Q250,245 500,250 Q750,255 1000,250" 
                      stroke="#fff" fill="none" stroke-width="1.5" opacity="0.3" />
                <path d="M0,260 Q250,255 500,260 Q750,265 1000,260" 
                      stroke="#fff" fill="none" stroke-width="1.5" opacity="0.2" />
                
                <!-- 遠山 -->
                <path d="M0,200 Q250,180 500,190 Q750,170 1000,200" 
                      fill="#6a8c69" opacity="0.6" />
                
                <!-- 山壁 -->
                <path d="M600,150 Q800,100 1000,150 L1000,300 L600,300 Z" 
                      fill="#8a9a8a" opacity="0.4" />
            </g>

            <!-- 電線 -->
            <g id="overheadWires">
                <path d="M0,100 Q250,90 500,100 Q750,110 1000,100" 
                      stroke="#404040" fill="none" stroke-width="1" />
                <path d="M0,120 Q250,110 500,120 Q750,130 1000,120" 
                      stroke="#404040" fill="none" stroke-width="1" />
                <path d="M0,140 Q250,130 500,140 Q750,150 1000,140" 
                      stroke="#404040" fill="none" stroke-width="1" />
            </g>

            <!-- 軌道區域 -->
            <g id="rail">
                <!-- 軌道基座 -->
                <rect x="0" y="300" width="1000" height="50" fill="#8B4513" opacity="0.8" />
                
                <!-- S型彎曲鐵軌 -->
                <path d="M0,320 C200,315 400,325 600,320 C800,315 1000,325 1000,320" 
                      stroke="#555" fill="none" stroke-width="2" />
                <path d="M0,330 C200,325 400,335 600,330 C800,325 1000,335 1000,330" 
                      stroke="#555" fill="none" stroke-width="2" />
                
                <!-- 枕木 -->
                ${Array.from({length: 25}, (_, i) => 
                    `<rect x="${i * 40}" y="315" width="20" height="10" fill="#8B4513" opacity="0.9" />`
                ).join('')}
                
                <!-- 踏切欄杆 -->
                <g transform="translate(200, 280)">
                    <rect x="0" y="0" width="4" height="40" fill="#404040" />
                    <rect x="0" y="0" width="60" height="4" fill="#404040" />
                </g>
            </g>

            <!-- 背景電車 -->
            <g id="bgTrain" transform="translate(100, 280)">
                <!-- 車身 -->
                <rect x="0" y="0" width="160" height="40" fill="#3a8b5f" rx="5" />
                <!-- 窗戶 -->
                <rect x="10" y="5" width="20" height="25" fill="#f2e8c8" rx="2" />
                <rect x="40" y="5" width="20" height="25" fill="#f2e8c8" rx="2" />
                <rect x="70" y="5" width="20" height="25" fill="#f2e8c8" rx="2" />
                <rect x="100" y="5" width="20" height="25" fill="#f2e8c8" rx="2" />
                <rect x="130" y="5" width="20" height="25" fill="#f2e8c8" rx="2" />
                <!-- 車輪 -->
                <circle cx="20" cy="45" r="5" fill="#404040" />
                <circle cx="60" cy="45" r="5" fill="#404040" />
                <circle cx="100" cy="45" r="5" fill="#404040" />
                <circle cx="140" cy="45" r="5" fill="#404040" />
            </g>

            <!-- 主角貓咪 -->
            <g id="catSprite" transform="translate(600, 280)">
                <!-- 身體 -->
                <g id="catBody">
                    <!-- 西裝外套 -->
                    <rect x="0" y="0" width="30" height="25" fill="#404040" rx="3" />
                    <!-- 西裝領子 -->
                    <path d="M0,0 L10,0 L5,5 L0,5 Z" fill="#303030" />
                    <path d="M30,0 L20,0 L25,5 L30,5 Z" fill="#303030" />
                    <!-- 襯衫 -->
                    <rect x="7" y="0" width="16" height="12" fill="#fff" rx="2" />
                    <!-- 領帶 -->
                    <polygon points="15,0 13,12 15,12 17,12 15,0" fill="#7a5c58" />
                </g>
                
                <!-- 頭部 -->
                <g id="catHead">
                    <!-- 頭 -->
                    <circle cx="15" cy="-10" r="12" fill="#757575" />
                    <!-- 耳朵 -->
                    <polygon points="7,-18 5,-10 10,-12" fill="#757575" />
                    <polygon points="23,-18 25,-10 20,-12" fill="#757575" />
                    <!-- 耳朵內部 -->
                    <polygon points="8,-16 6,-11 9,-13" fill="#ff9999" />
                    <polygon points="22,-16 24,-11 21,-13" fill="#ff9999" />
                    <!-- 眼睛 -->
                    <circle cx="10" cy="-12" r="2" fill="#404040" />
                    <circle cx="20" cy="-12" r="2" fill="#404040" />
                    <!-- 眼睛光點 -->
                    <circle cx="11" cy="-13" r="0.5" fill="#fff" />
                    <circle cx="21" cy="-13" r="0.5" fill="#fff" />
                    <!-- 鼻子 -->
                    <circle cx="15" cy="-9" r="1" fill="#ff9999" />
                    <!-- 嘴巴 -->
                    <path d="M12,-7 Q15,-5 18,-7" stroke="#404040" fill="transparent" stroke-width="0.8" />
                </g>
                
                <!-- 腿部 -->
                <g id="catLegs">
                    <rect x="5" y="25" width="6" height="10" fill="#404040" rx="1" transform="rotate(-15, 8, 25)" />
                    <rect x="19" y="25" width="6" height="10" fill="#404040" rx="1" transform="rotate(15, 22, 25)" />
                </g>
                
                <!-- 尾巴 -->
                <g id="catTail">
                    <path d="M30,15 Q35,10 40,15" stroke="#757575" fill="transparent" stroke-width="3" />
                </g>
            </g>

            <!-- 障礙物模板 -->
            <g id="trainObstacle" class="obstacle" transform="translate(0, 0)" style="display: none">
                <!-- 小火車 -->
                <rect x="0" y="0" width="80" height="30" fill="#3a8b5f" rx="3" />
                <rect x="80" y="0" width="40" height="30" fill="#3a8b5f" rx="3" />
                <rect x="10" y="5" width="15" height="15" fill="#f2e8c8" rx="2" />
                <rect x="35" y="5" width="15" height="15" fill="#f2e8c8" rx="2" />
                <rect x="60" y="5" width="15" height="15" fill="#f2e8c8" rx="2" />
                <rect x="90" y="5" width="15" height="15" fill="#f2e8c8" rx="2" />
            </g>

            <g id="signObstacle" class="obstacle" transform="translate(0, 0)" style="display: none">
                <!-- 站牌 -->
                <rect x="0" y="0" width="40" height="60" fill="#f2e8c8" rx="2" />
                <rect x="2" y="2" width="36" height="56" fill="#7a5c58" rx="1" />
                <text x="20" y="35" font-size="8" fill="#fff" text-anchor="middle" font-family="sans-serif">車站</text>
            </g>

            <!-- 開始按鈕 -->
            <g transform="translate(500, 350)">
                <rect x="-50" y="-20" width="100" height="40" fill="#7a5c58" rx="20" />
                <text x="0" y="5" font-size="16" fill="#fff" text-anchor="middle" font-family="sans-serif">開始遊戲</text>
            </g>
        </svg>
    `;
}

// 創建小貓 SVG
function createCatSVG(state = 'running') {
    let svgContent;
    
    if (state === 'running') {
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <!-- 西裝外套 -->
                <rect x="15" y="20" width="30" height="25" fill="#333" rx="3" />
                <!-- 西裝領子 -->
                <path d="M15,20 L25,20 L20,25 L15,25 Z" fill="#222" />
                <path d="M45,20 L35,20 L40,25 L45,25 Z" fill="#222" />
                <!-- 襯衫 -->
                <rect x="22" y="20" width="16" height="12" fill="#FFF" rx="2" />
                <!-- 領帶 -->
                <polygon points="30,20 28,32 30,32 32,32 30,20" fill="#7a5c58" />
                <!-- 頭 -->
                <circle cx="30" cy="10" r="12" fill="#999" />
                <!-- 耳朵 -->
                <polygon points="22,2 20,10 25,8" fill="#999" />
                <polygon points="38,2 40,10 35,8" fill="#999" />
                <!-- 耳朵內部 -->
                <polygon points="23,4 21,9 24,7" fill="#ff9999" />
                <polygon points="37,4 39,9 36,7" fill="#ff9999" />
                <!-- 眼睛 -->
                <circle cx="25" cy="8" r="2" fill="#333" />
                <circle cx="35" cy="8" r="2" fill="#333" />
                <!-- 眼睛光點 -->
                <circle cx="26" cy="7" r="0.5" fill="#fff" />
                <circle cx="36" cy="7" r="0.5" fill="#fff" />
                <!-- 鼻子 -->
                <circle cx="30" cy="11" r="1" fill="#ff9999" />
                <!-- 嘴巴 -->
                <path d="M27,13 Q30,15 33,13" stroke="#333" fill="transparent" stroke-width="0.8" />
                <!-- 腿 (跑步姿勢) -->
                <rect x="20" y="45" width="6" height="10" fill="#333" rx="1" transform="rotate(-15, 23, 45)" />
                <rect x="34" y="45" width="6" height="10" fill="#333" rx="1" transform="rotate(15, 37, 45)" />
                <!-- 尾巴 -->
                <path d="M45,30 Q50,25 55,30" stroke="#999" fill="transparent" stroke-width="3" />
            </svg>
        `;
    } else if (state === 'jumping') {
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <!-- 西裝外套 -->
                <rect x="15" y="20" width="30" height="25" fill="#333" rx="3" />
                <!-- 西裝領子 -->
                <path d="M15,20 L25,20 L20,25 L15,25 Z" fill="#222" />
                <path d="M45,20 L35,20 L40,25 L45,25 Z" fill="#222" />
                <!-- 襯衫 -->
                <rect x="22" y="20" width="16" height="12" fill="#FFF" rx="2" />
                <!-- 領帶 -->
                <polygon points="30,20 28,32 30,32 32,32 30,20" fill="#7a5c58" />
                <!-- 頭 -->
                <circle cx="30" cy="10" r="12" fill="#999" />
                <!-- 耳朵 -->
                <polygon points="22,2 20,10 25,8" fill="#999" />
                <polygon points="38,2 40,10 35,8" fill="#999" />
                <!-- 耳朵內部 -->
                <polygon points="23,4 21,9 24,7" fill="#ff9999" />
                <polygon points="37,4 39,9 36,7" fill="#ff9999" />
                <!-- 眼睛 -->
                <circle cx="25" cy="8" r="2" fill="#333" />
                <circle cx="35" cy="8" r="2" fill="#333" />
                <!-- 眼睛光點 -->
                <circle cx="26" cy="7" r="0.5" fill="#fff" />
                <circle cx="36" cy="7" r="0.5" fill="#fff" />
                <!-- 鼻子 -->
                <circle cx="30" cy="11" r="1" fill="#ff9999" />
                <!-- 嘴巴 (微笑) -->
                <path d="M27,13 Q30,16 33,13" stroke="#333" fill="transparent" stroke-width="0.8" />
                <!-- 腿 (跳躍姿勢) -->
                <rect x="20" y="45" width="6" height="8" fill="#333" rx="1" transform="rotate(-30, 23, 45)" />
                <rect x="34" y="45" width="6" height="8" fill="#333" rx="1" transform="rotate(30, 37, 45)" />
                <!-- 尾巴 (跳躍時上揚) -->
                <path d="M45,30 Q50,20 55,25" stroke="#999" fill="transparent" stroke-width="3" />
            </svg>
        `;
    } else if (state === 'crouching') {
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <!-- 西裝外套 (蹲下) -->
                <rect x="15" y="30" width="30" height="20" fill="#333" rx="3" />
                <!-- 西裝領子 -->
                <path d="M15,30 L25,30 L20,35 L15,35 Z" fill="#222" />
                <path d="M45,30 L35,30 L40,35 L45,35 Z" fill="#222" />
                <!-- 襯衫 -->
                <rect x="22" y="30" width="16" height="10" fill="#FFF" rx="2" />
                <!-- 領帶 -->
                <polygon points="30,30 28,40 30,40 32,40 30,30" fill="#7a5c58" />
                <!-- 頭 (蹲下) -->
                <circle cx="30" cy="20" r="12" fill="#999" />
                <!-- 耳朵 -->
                <polygon points="22,12 20,20 25,18" fill="#999" />
                <polygon points="38,12 40,20 35,18" fill="#999" />
                <!-- 耳朵內部 -->
                <polygon points="23,14 21,19 24,17" fill="#ff9999" />
                <polygon points="37,14 39,19 36,17" fill="#ff9999" />
                <!-- 眼睛 -->
                <circle cx="25" cy="18" r="2" fill="#333" />
                <circle cx="35" cy="18" r="2" fill="#333" />
                <!-- 眼睛光點 -->
                <circle cx="26" cy="17" r="0.5" fill="#fff" />
                <circle cx="36" cy="17" r="0.5" fill="#fff" />
                <!-- 鼻子 -->
                <circle cx="30" cy="21" r="1" fill="#ff9999" />
                <!-- 嘴巴 -->
                <path d="M27,23 Q30,25 33,23" stroke="#333" fill="transparent" stroke-width="0.8" />
                <!-- 腿 (蹲下) -->
                <rect x="20" y="50" width="6" height="5" fill="#333" rx="1" />
                <rect x="34" y="50" width="6" height="5" fill="#333" rx="1" />
                <!-- 尾巴 (蹲下時彎曲) -->
                <path d="M45,35 Q50,40 55,35" stroke="#999" fill="transparent" stroke-width="3" />
            </svg>
        `;
    } else if (state === 'dead') {
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <!-- 西裝外套 (倒下) -->
                <rect x="15" y="20" width="30" height="25" fill="#333" rx="3" transform="rotate(30, 30, 30)" />
                <!-- 西裝領子 -->
                <path d="M15,20 L25,20 L20,25 L15,25 Z" fill="#222" transform="rotate(30, 30, 30)" />
                <path d="M45,20 L35,20 L40,25 L45,25 Z" fill="#222" transform="rotate(30, 30, 30)" />
                <!-- 襯衫 -->
                <rect x="22" y="20" width="16" height="12" fill="#FFF" rx="2" transform="rotate(30, 30, 30)" />
                <!-- 領帶 -->
                <polygon points="30,20 28,32 30,32 32,32 30,20" fill="#7a5c58" transform="rotate(30, 30, 30)" />
                <!-- 頭 (倒下) -->
                <circle cx="30" cy="10" r="12" fill="#999" transform="rotate(30, 30, 10)" />
                <!-- 耳朵 -->
                <polygon points="22,2 20,10 25,8" fill="#999" transform="rotate(30, 30, 10)" />
                <polygon points="38,2 40,10 35,8" fill="#999" transform="rotate(30, 30, 10)" />
                <!-- 耳朵內部 -->
                <polygon points="23,4 21,9 24,7" fill="#ff9999" transform="rotate(30, 30, 10)" />
                <polygon points="37,4 39,9 36,7" fill="#ff9999" transform="rotate(30, 30, 10)" />
                <!-- 眼睛 (閉眼) -->
                <path d="M22,8 L28,8" stroke="#333" stroke-width="1" transform="rotate(30, 30, 10)" />
                <path d="M32,8 L38,8" stroke="#333" stroke-width="1" transform="rotate(30, 30, 10)" />
                <!-- 鼻子 -->
                <circle cx="30" cy="11" r="1" fill="#ff9999" transform="rotate(30, 30, 10)" />
                <!-- 嘴巴 (難過) -->
                <path d="M27,13 Q30,11 33,13" stroke="#333" fill="transparent" stroke-width="0.8" transform="rotate(30, 30, 10)" />
                <!-- 腿 (倒下) -->
                <rect x="20" y="45" width="6" height="10" fill="#333" rx="1" transform="rotate(30, 30, 30)" />
                <rect x="34" y="45" width="6" height="10" fill="#333" rx="1" transform="rotate(30, 30, 30)" />
                <!-- 尾巴 (倒下時彎曲) -->
                <path d="M45,30 Q50,35 55,30" stroke="#999" fill="transparent" stroke-width="3" transform="rotate(30, 30, 30)" />
            </svg>
        `;
    }
    
    return svgContent;
}

// 創建火車 SVG
function createTrainSVG() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 50">
            <!-- 車身 -->
            <rect x="10" y="5" width="60" height="30" fill="#7a5c58" rx="5" />
            <!-- 車頭 -->
            <rect x="70" y="5" width="10" height="30" fill="#6a4c48" rx="3" />
            <!-- 窗戶 -->
            <rect x="15" y="10" width="10" height="15" fill="#a7c5eb" rx="2" />
            <rect x="30" y="10" width="10" height="15" fill="#a7c5eb" rx="2" />
            <rect x="45" y="10" width="10" height="15" fill="#a7c5eb" rx="2" />
            <rect x="60" y="10" width="10" height="15" fill="#a7c5eb" rx="2" />
            <!-- 煙囪 -->
            <rect x="72" y="-5" width="6" height="10" fill="#555" rx="1" />
            <!-- 車輪 -->
            <circle cx="20" cy="40" r="5" fill="#333" />
            <circle cx="40" cy="40" r="5" fill="#333" />
            <circle cx="60" cy="40" r="5" fill="#333" />
        </svg>
    `;
}

// 創建車站牌 SVG
function createSignSVG() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
            <!-- 柱子 -->
            <rect x="18" y="30" width="4" height="50" fill="#8B4513" />
            <!-- 牌子 -->
            <rect x="5" y="5" width="30" height="25" fill="#FFF" rx="3" />
            <rect x="7" y="7" width="26" height="21" fill="#7a5c58" rx="2" />
            <!-- 文字 -->
            <text x="20" y="20" font-size="8" fill="#FFF" text-anchor="middle" font-family="sans-serif">車站</text>
        </svg>
    `;
}

// 創建山脈 SVG
function createMountainSVG() {
    const height = 100 + Math.random() * 50;
    const width = 200 + Math.random() * 150;
    const color1 = '#6a8c69';
    const color2 = '#4a6c49';
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="mountainGrad${Math.random()}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${color1}" />
                    <stop offset="100%" stop-color="${color2}" />
                </linearGradient>
            </defs>
            <path d="M0,${height} L${width/3},${height*0.3} L${width/2},${height*0.5} L${width*0.7},${height*0.2} L${width},${height}" 
                  fill="url(#mountainGrad${Math.random()})" />
        </svg>
    `;
}

// 創建雲朵 SVG
function createCloudSVG() {
    const size = 40 + Math.random() * 30;
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size*2} ${size}">
            <path d="M${size*0.3},${size*0.5} 
                     C${size*0.3},${size*0.3} ${size*0.5},${size*0.2} ${size*0.7},${size*0.3} 
                     C${size*0.8},${size*0.1} ${size*1.2},${size*0.1} ${size*1.3},${size*0.3} 
                     C${size*1.5},${size*0.2} ${size*1.7},${size*0.3} ${size*1.7},${size*0.5} 
                     C${size*1.7},${size*0.7} ${size*1.5},${size*0.8} ${size*1.3},${size*0.7} 
                     C${size*1.2},${size*0.9} ${size*0.8},${size*0.9} ${size*0.7},${size*0.7} 
                     C${size*0.5},${size*0.8} ${size*0.3},${size*0.7} ${size*0.3},${size*0.5} Z" 
                  fill="rgba(255, 255, 255, 0.8)" />
        </svg>
    `;
}

// 創建草叢 SVG
function createGrassSVG() {
    const width = 30 + Math.random() * 20;
    const height = 20 + Math.random() * 15;
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <path d="M5,${height} C10,${height*0.7} 15,${height*0.9} 20,${height} C25,${height*0.6} 30,${height*0.8} 35,${height}" 
                  fill="#6a8c69" />
            <path d="M0,${height} C5,${height*0.5} 10,${height*0.7} 15,${height} C20,${height*0.4} 25,${height*0.6} 30,${height}" 
                  fill="#4a6c49" />
        </svg>
    `;
}

// 初始化開場畫面
function initStartScreen() {
    createStartScene();
    
    // 確保 SVG 填滿容器
    const svg = startScene.querySelector('svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // 綁定開始按鈕事件
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        initGame();
    });
}

// 初始化遊戲
function initGame() {
    // 設置小貓
    cat.innerHTML = createCatSVG('running');
    
    // 創建鐵軌枕木
    createSleepers();
    
    // 創建背景元素
    createBackgroundElements();
    
    // 重置遊戲狀態
    score = 0;
    scoreValue.textContent = score;
    isGameOver = false;
    gameSpeed = 4;
    obstacleInterval = 2000;
    obstacles = [];
    
    // 清除所有障礙物
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    
    // 隱藏遊戲結束畫面
    gameOverScreen.style.display = 'none';
    
    // 開始遊戲循環
    lastObstacleTime = Date.now();
    gameLoop();
}

// 創建鐵軌枕木
function createSleepers() {
    // 清除現有枕木
    sleepers.forEach(sleeper => sleeper.remove());
    sleepers = [];
    
    // 創建新枕木
    const trackWidth = track.offsetWidth;
    const sleeperCount = Math.ceil(trackWidth / 30);
    
    for (let i = 0; i < sleeperCount + 10; i++) {
        const sleeper = document.createElement('div');
        sleeper.className = 'sleeper';
        sleeper.style.left = `${i * 30}px`;
        track.appendChild(sleeper);
        sleepers.push(sleeper);
    }
}

// 創建背景元素
function createBackgroundElements() {
    // 清除現有元素
    mountains.forEach(mountain => mountain.remove());
    clouds.forEach(cloud => cloud.remove());
    grassPatches.forEach(grass => grass.remove());
    mountains = [];
    clouds = [];
    grassPatches = [];
    
    // 創建山脈
    for (let i = 0; i < 4; i++) {
        const mountain = document.createElement('div');
        mountain.style.position = 'absolute';
        mountain.style.left = `${i * 250 - 50}px`;
        mountain.style.bottom = '0';
        mountain.style.zIndex = '1';
        mountain.innerHTML = createMountainSVG();
        mountainsContainer.appendChild(mountain);
        mountains.push(mountain);
    }
    
    // 創建雲朵
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.style.position = 'absolute';
        cloud.style.left = `${i * 200 + Math.random() * 100}px`;
        cloud.style.top = `${Math.random() * 60}px`;
        cloud.style.opacity = `${0.6 + Math.random() * 0.4}`;
        cloud.innerHTML = createCloudSVG();
        cloudsContainer.appendChild(cloud);
        clouds.push(cloud);
    }
    
    // 創建草叢
    for (let i = 0; i < 8; i++) {
        const grass = document.createElement('div');
        grass.className = 'grass';
        grass.style.left = `${i * 120 + Math.random() * 60}px`;
        grass.style.zIndex = '2';
        grass.innerHTML = createGrassSVG();
        grassContainer.appendChild(grass);
        grassPatches.push(grass);
    }
}

// 遊戲循環
function gameLoop() {
    if (isGameOver) return;
    
    // 更新分數
    score++;
    scoreValue.textContent = score;
    
    // 增加遊戲速度
    if (score % 500 === 0) {
        gameSpeed += 0.3;
        if (obstacleInterval > 1000) {
            obstacleInterval -= 50;
        }
    }
    
    // 移動枕木
    moveSleepers();
    
    // 移動背景元素
    moveBackgroundElements();
    
    // 生成障礙物
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = currentTime;
    }
    
    // 移動障礙物並檢查碰撞
    moveObstaclesAndCheckCollision();
    
    // 繼續遊戲循環
    animationId = requestAnimationFrame(gameLoop);
}

// 移動枕木
function moveSleepers() {
    sleepers.forEach(sleeper => {
        let left = parseFloat(sleeper.style.left);
        left -= gameSpeed;
        
        if (left < -25) {
            left = track.offsetWidth;
        }
        
        sleeper.style.left = `${left}px`;
    });
}

// 移動背景元素
function moveBackgroundElements() {
    // 移動山脈 (慢速)
    mountains.forEach(mountain => {
        let left = parseFloat(mountain.style.left);
        left -= gameSpeed * 0.2;
        
        if (left < -250) {
            left = mountainsContainer.offsetWidth;
        }
        
        mountain.style.left = `${left}px`;
    });
    
    // 移動雲朵 (更慢速)
    clouds.forEach(cloud => {
        let left = parseFloat(cloud.style.left);
        left -= gameSpeed * 0.1;
        
        if (left < -100) {
            left = cloudsContainer.offsetWidth;
            cloud.style.top = `${Math.random() * 60}px`;
        }
        
        cloud.style.left = `${left}px`;
    });
    
    // 移動草叢
    grassPatches.forEach(grass => {
        let left = parseFloat(grass.style.left);
        left -= gameSpeed;
        
        if (left < -50) {
            left = gameScreen.offsetWidth;
        }
        
        grass.style.left = `${left}px`;
    });
}

// 創建障礙物
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // 隨機選擇障礙物類型 (火車或車站牌)
    const isTrainObstacle = Math.random() > 0.4;
    
    if (isTrainObstacle) {
        obstacle.classList.add('train');
        obstacle.innerHTML = createTrainSVG();
        obstacle.dataset.type = 'train';
    } else {
        obstacle.classList.add('sign');
        obstacle.innerHTML = createSignSVG();
        obstacle.dataset.type = 'sign';
        obstacle.style.bottom = '70px';
    }
    
    obstacle.style.left = `${gameScreen.offsetWidth}px`;
    gameScreen.appendChild(obstacle);
    obstacles.push(obstacle);
}

// 移動障礙物並檢查碰撞
function moveObstaclesAndCheckCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        let left = parseFloat(obstacle.style.left);
        left -= gameSpeed;
        obstacle.style.left = `${left}px`;
        
        // 移除超出畫面的障礙物
        if (left < -80) {
            obstacle.remove();
            obstacles.splice(i, 1);
            i--;
            continue;
        }
        
        // 檢查碰撞
        if (isColliding(cat, obstacle)) {
            gameOver();
            break;
        }
    }
}

// 碰撞檢測
function isColliding(cat, obstacle) {
    const catRect = cat.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    // 根據障礙物類型和小貓狀態調整碰撞檢測
    if (obstacle.dataset.type === 'train' && isJumping) {
        return false; // 跳躍可以避開火車
    }
    
    if (obstacle.dataset.type === 'sign' && isCrouching) {
        return false; // 蹲下可以避開車站牌
    }
    
    // 基本碰撞檢測
    return !(
        catRect.right < obstacleRect.left + 15 ||
        catRect.left > obstacleRect.right - 15 ||
        catRect.bottom < obstacleRect.top + 15 ||
        catRect.top > obstacleRect.bottom - 15
    );
}

// 跳躍
function jump() {
    if (isJumping || isCrouching || isGameOver) return;
    
    isJumping = true;
    cat.innerHTML = createCatSVG('jumping');
    
    let jumpHeight = 0;
    const jumpUp = setInterval(() => {
        jumpHeight += 5;
        cat.style.bottom = `${70 + jumpHeight}px`;
        
        if (jumpHeight >= 80) {
            clearInterval(jumpUp);
            
            const jumpDown = setInterval(() => {
                jumpHeight -= 5;
                cat.style.bottom = `${70 + jumpHeight}px`;
                
                if (jumpHeight <= 0) {
                    clearInterval(jumpDown);
                    cat.style.bottom = '70px';
                    isJumping = false;
                    if (!isCrouching && !isGameOver) {
                        cat.innerHTML = createCatSVG('running');
                    }
                }
            }, 20);
        }
    }, 20);
}

// 蹲下
function crouch() {
    if (isJumping || isGameOver) return;
    
    isCrouching = true;
    cat.innerHTML = createCatSVG('crouching');
}

// 站起
function standUp() {
    if (isJumping || isGameOver) return;
    
    isCrouching = false;
    cat.innerHTML = createCatSVG('running');
}

// 遊戲結束
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    
    // 顯示小貓跌倒
    cat.innerHTML = createCatSVG('dead');
    
    // 隨機選擇車站名稱
    const randomStation = stationNames[Math.floor(Math.random() * stationNames.length)];
    stationNameElement.textContent = randomStation;
    
    // 顯示遊戲結束畫面
    setTimeout(() => {
        gameOverScreen.style.display = 'flex';
    }, 500);
}

// 事件監聽
document.addEventListener('keydown', (event) => {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && gameScreen.style.display === 'block') {
        event.preventDefault();
        jump();
    } else if (event.code === 'ArrowDown' && gameScreen.style.display === 'block') {
        event.preventDefault();
        crouch();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowDown' && gameScreen.style.display === 'block') {
        standUp();
    }
});

// 觸控支援
gameScreen.addEventListener('touchstart', (event) => {
    const touchY = event.touches[0].clientY;
    const containerRect = gameScreen.getBoundingClientRect();
    
    if (touchY < containerRect.top + containerRect.height / 2) {
        jump();
    } else {
        crouch();
    }
});

gameScreen.addEventListener('touchend', () => {
    standUp();
});

// 重新開始按鈕
restartBtn.addEventListener('click', initGame);

// 初始化開場畫面
initStartScreen(); 