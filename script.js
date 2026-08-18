// --- CONFIGURATION ---
const CORRECT_PASSWORD = "dream"; 
const PASSWORD_HINT = "psst... the password is 'dream'";

const liminalMessages = [
    "You have been here before.",
    "There is nothing left to click.",
    "Are you sure you are awake?",
    "The walls are breathing.",
    "It is looking at you.",
    "Please stop tapping the glass."
];

// --- SOUND EFFECT LOGIC ---
const clickAudio = document.getElementById('ui-click-sound');
const outfitAudio = document.getElementById('outfit-sound');

function playClickSound() {
    if (clickAudio) {
        clickAudio.currentTime = 0; 
        clickAudio.play().catch(e => { });
    }
}

function playOutfitSound() {
    if (outfitAudio) {
        outfitAudio.currentTime = 0;
        outfitAudio.play().catch(e => {});
    }
}

document.addEventListener('click', (e) => {
    const isClickable = e.target.closest('.icon, button, a, #start-btn, #clock, #user-avatar, .tab-btn');
    if (isClickable) {
        playClickSound();
    }
});

// --- LOGIN LOGIC ---
const avatarBtn = document.getElementById('user-avatar');
const passInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');

avatarBtn.addEventListener('click', () => alert(PASSWORD_HINT));

loginBtn.addEventListener('click', () => {
    if(passInput.value.toLowerCase() === CORRECT_PASSWORD) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
        resetScreensaver(); 
    } else {
        document.getElementById('login-error').style.opacity = 1;
        passInput.value = "";
    }
});

// --- NOTEPAD TABS & BADGES INFO LOGIC ---
const badgeData = {
    1: { title: "1. Starlight Novice", quote: "“Even the smallest spark can light up an endless abyss.” ✧" },
    2: { title: "2. Cloud Hopper", quote: "“Keep looking up, the softest clouds are just ahead.” ☁️" },
    3: { title: "3. Dream Wanderer", quote: "“Lost in a haze of plum and light blue memories.” 𓆩ꨄ︎𓆪" },
    4: { title: "4. Astral Sprite", quote: "“Dancing between dimensions where gravity doesn't apply.” ✨" },
    5: { title: "5. Celestial Queen", quote: "“The entire sky bows to your endless high score.” 👑" }
};

function switchTab(tabName) {
    const notesTab = document.getElementById('notepad-notes-tab');
    const badgesTab = document.getElementById('notepad-badges-tab');
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => btn.classList.remove('active-tab'));

    if (tabName === 'notes') {
        notesTab.classList.remove('hidden');
        badgesTab.classList.add('hidden');
        event.target.classList.add('active-tab');
    } else {
        notesTab.classList.add('hidden');
        badgesTab.classList.remove('hidden');
        event.target.classList.add('active-tab');
        loadBadgesToNotepad();
    }
}

function loadBadgesToNotepad() {
    let unlockedBadges = JSON.parse(localStorage.getItem('devililiaUnlockedBadges')) || [];
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        let isUnlocked = unlockedBadges.includes(i);
        let slot = document.createElement('div');
        slot.className = isUnlocked ? 'badge-slot' : 'badge-slot locked';
        slot.innerHTML = `<img src="ms${i}.png" alt="Badge ${i}"><span class="badge-title">${badgeData[i].title}</span>`;
        
        if (isUnlocked) {
            slot.addEventListener('click', () => {
                alert(`${badgeData[i].title}\n\n${badgeData[i].quote}`);
            });
        }
        grid.appendChild(slot);
    }
}

// --- WINDOW MANAGEMENT ---
let clickCount = 0;
let clickTimer = null;
const gameBGM = document.getElementById('game-bgm');

function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.remove('hidden');
    
    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach(w => w.style.zIndex = 100);
    win.style.zIndex = 101;
    
    if (id === 'window-game') {
        if (!gameActive) {
            initGame();
            resetScreensaver(); 
        }
        if (gameBGM) {
            gameBGM.currentTime = 0;
            gameBGM.play().catch(e => {}); 
        }
    }
    
    trackClicks();
}

function closeWindow(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'window-game') {
        gameActive = false;
        cancelAnimationFrame(gameLoop);
        resetScreensaver(); 
        
        if (gameBGM) {
            gameBGM.pause();
            gameBGM.currentTime = 0; 
        }
    }
}

function trackClicks() {
    clickCount++;
    clearTimeout(clickTimer);
    
    if(clickCount >= 5) {
        triggerLiminalError();
        clickCount = 0;
    }
    
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
}

function triggerLiminalError() {
    const errorWin = document.getElementById('error-message');
    const errorTxt = document.getElementById('error-text');
    const randomMsg = liminalMessages[Math.floor(Math.random() * liminalMessages.length)];
    
    errorTxt.innerText = randomMsg;
    errorWin.classList.remove('hidden');
    errorWin.style.zIndex = 999; 
}

// --- DRAGGABLE WINDOWS ---
const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const titleBar = win.querySelector('.drag-handle');
    if (!titleBar) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;

    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    titleBar.addEventListener('touchstart', (e) => dragStart(e.touches[0]), { passive: false });
    document.addEventListener('touchmove', (e) => {
        if (isDragging) e.preventDefault(); 
        dragMove(e.touches[0]);
    }, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.target.classList.contains('close-btn')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = win.offsetLeft;
        initialY = win.offsetTop;
        
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = 100);
        win.style.zIndex = 101;
    }

    function dragMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        win.style.left = `${initialX + dx}px`;
        win.style.top = `${initialY + dy}px`;
    }

    function dragEnd() {
        isDragging = false;
    }
});

// --- START MENU & CLOCK ---
document.getElementById('start-btn').addEventListener('click', () => {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-btn') && !e.target.closest('#start-menu')) {
        document.getElementById('start-menu').classList.add('hidden');
    }
});

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

setInterval(() => {
    document.getElementById('clock').innerText = updateClock();
}, 1000);
document.getElementById('clock').innerText = updateClock();

// --- VERTICAL PLATFORMER MINI GAME ---
let gameLoop;
let player = { x: 70, y: 160, width: 180, height: 220, vy: 0, outfit: 'gc.png' };
let platforms = [];
let items = [];
let stars = [];
let gravity = 0.09; 
let jumpPower = -3.9; 
let score = 0;
let lives = 3;
let gameActive = false;
let gameStarted = false; 
let mouseX = 160;

const outfitsList = ['gc.png', 'black.png', 'blue.png', 'pink.png'];

outfitsList.forEach(src => {
    const img = new Image();
    img.src = src;
});

const milestones = [
    { score: 2500, id: 1, title: "Badge Unlocked: Starlight Novice!" },
    { score: 7500, id: 2, title: "Badge Unlocked: Cloud Hopper!" },
    { score: 15000, id: 3, title: "Badge Unlocked: Dream Wanderer!" },
    { score: 30000, id: 4, title: "Badge Unlocked: Astral Sprite!" },
    { score: 60000, id: 5, title: "Badge Unlocked: Celestial Queen!" }
];

const gameContainer = document.getElementById('game-container');

gameContainer.addEventListener('mousedown', startGameHandler);
gameContainer.addEventListener('touchstart', startGameHandler, {passive: true});

function startGameHandler(e) {
    if (gameActive && !gameStarted) {
        gameStarted = true;
        player.vy = jumpPower; 
        document.getElementById('start-overlay').classList.add('hidden');
    }
}

gameContainer.addEventListener('mousemove', (e) => {
    let rect = gameContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});
gameContainer.addEventListener('touchmove', (e) => {
    let rect = gameContainer.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
});

function initGame() {
    platforms.forEach(p => { if(p.element) p.element.remove(); });
    items.forEach(i => { if(i.element) i.element.remove(); });
    stars.forEach(s => { if(s.element) s.element.remove(); });
    platforms = [];
    items = [];
    stars = [];
    score = 0;
    lives = 3;
    player.outfit = 'gc.png';
    
    player.y = 160; 
    player.x = 70;
    player.vy = 0;
    
    updatePlayerSprite();
    updateHearts();
    document.getElementById('score-display').innerText = `Score: ${score}`;
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-overlay').classList.remove('hidden');

    platforms.push({ x: 60, y: 380, type: 'normal', element: null }); 
    
    for(let i = 1; i <= 3; i++) {
        let isPastel = Math.random() < 0.4;
        let platX = Math.random() * 120;
        let platY = 380 - (i * 75);
        platforms.push({ x: platX, y: platY, type: isPastel ? 'pastel' : 'normal', baseKey: Math.random() * 100, element: null });
        
        if (Math.random() < 0.3) {
            stars.push({ x: platX + 40, y: platY - 45, element: null });
        }
    }
    renderGameObjects();
    
    gameActive = true;
    gameStarted = false; 
    cancelAnimationFrame(gameLoop);
    updateGame();
}

function updatePlayerSprite() {
    const playerEl = document.getElementById('game-player-el');
    playerEl.style.backgroundImage = `url('${player.outfit}')`;
}

function updateGame() {
    if(!gameActive) return;

    if (gameStarted) {
        player.vy += gravity;
        player.y += player.vy;

        let playerCenter = player.x + (player.width / 2);
        let dx = mouseX - playerCenter;
        
        if (dx > 160) dx -= 320;
        if (dx < -160) dx += 320;
        
        player.x += dx * 0.08;

        let currentCenter = player.x + (player.width / 2);
        if (currentCenter < 0) {
            player.x += 320;
        } else if (currentCenter > 320) {
            player.x -= 320;
        }

        // --- PLATFORM COLLISION ---
        let gameTime = Date.now() * 0.002; 
        if (player.vy > 0) {
            let preciseCenter = player.x + (player.width / 2); 
            
            platforms.forEach(plat => {
                if (plat.type === 'pastel') {
                    plat.currentX = plat.x + Math.sin(gameTime + plat.baseKey) * 60;
                } else {
                    plat.currentX = plat.x;
                }

                if(preciseCenter > plat.currentX + 30 && preciseCenter < plat.currentX + 170 &&
                   player.y + player.height > plat.y + 10 && 
                   player.y + player.height < plat.y + 30 + player.vy) {
                    
                    player.vy = jumpPower; 
                    
                    plat.element.classList.add('platform-bounce');
                    setTimeout(() => plat.element.classList.remove('platform-bounce'), 150);
                }
            });
        }
        
        // --- ITEM COLLISION ---
        let itemGrabCenter = player.x + (player.width / 2);
        items.forEach(item => {
            if (item.element && 
                itemGrabCenter > item.x - 30 && itemGrabCenter < item.x + 70 &&
                player.y + player.height > item.y && player.y < item.y + 40) {
                
                player.vy = -7.2; 
                score += 500; 
                
                item.element.remove();
                item.element = null; 
            }
        });

        // --- STAR COLLISION (OUTFIT CHANGE) ---
        stars.forEach(star => {
            if (star.element &&
                itemGrabCenter > star.x - 30 && itemGrabCenter < star.x + 75 &&
                player.y + player.height > star.y && player.y < star.y + 45) {
                
                let availableOutfits = outfitsList.filter(o => o !== player.outfit);
                player.outfit = availableOutfits[Math.floor(Math.random() * availableOutfits.length)];
                updatePlayerSprite();
                playOutfitSound(); 

                star.element.remove();
                star.element = null;
            }
        });

        checkMilestones(score);

        // --- CAMERA SCROLLING ---
        if (player.y < 150) {
            let diff = 150 - player.y;
            player.y = 150;
            score += Math.floor(diff);
            document.getElementById('score-display').innerText = `Score: ${score}`;
            
            platforms.forEach(plat => plat.y += diff);
            items.forEach(item => item.y += diff);
            stars.forEach(star => star.y += diff);

            platforms = platforms.filter(plat => {
                if(plat.y > 420) {
                    plat.element.remove();
                    return false;
                }
                return true;
            });
            
            items = items.filter(item => {
                if (!item.element) return false;
                if(item.y > 420) {
                    item.element.remove();
                    return false;
                }
                return true;
            });

            stars = stars.filter(star => {
                if (!star.element) return false;
                if(star.y > 420) {
                    star.element.remove();
                    return false;
                }
                return true;
            });

            while(platforms.length < 4) {
                let lastY = platforms[platforms.length-1]?.y || 0;
                
                let newPlatX = Math.random() * 120;
                let newPlatY = lastY - (Math.random() * 15 + 70); 
                let isPastel = Math.random() < 0.4;
                
                platforms.push({ x: newPlatX, y: newPlatY, type: isPastel ? 'pastel' : 'normal', baseKey: Math.random() * 100, element: null });
                
                if (Math.random() < 0.15) {
                    items.push({ x: newPlatX + 80, y: newPlatY - 40, element: null });
                }
                if (Math.random() < 0.25) {
                    stars.push({ x: newPlatX + 40, y: newPlatY - 45, element: null });
                }
            }
            renderGameObjects();
        }

        // --- FALL LOGIC ---
        if (player.y > 420) {
            lives--;
            updateHearts();
            
            if(lives > 0) {
                gameStarted = false; 
                document.getElementById('start-overlay').classList.remove('hidden');
                
                player.y = 160;
                player.vy = 0;
                platforms.push({ x: player.x - 10, y: 380, type: 'normal', element: null });
                renderGameObjects();
            } else {
                gameActive = false;
                
                const gameOverScreen = document.getElementById('game-over-screen');
                const msgDisplay = document.getElementById('game-over-msg');
                const highScoreDisplay = document.getElementById('high-score-display');
                
                let savedHighScore = localStorage.getItem('jumpHighScore') || 0;
                
                if (score > savedHighScore) {
                    localStorage.setItem('jumpHighScore', score);
                    msgDisplay.innerText = "New High Score! 💖";
                    highScoreDisplay.innerText = `You scored: ${score}`;
                } else {
                    msgDisplay.innerText = "Good try!";
                    highScoreDisplay.innerText = `Score: ${score} | High Score: ${savedHighScore}`;
                }
                
                gameOverScreen.classList.remove('hidden');
            }
        }
    }

    // --- HARDWARE-ACCELERATED RENDER LOOP ---
    const playerEl = document.getElementById('game-player-el');
    playerEl.style.transform = `translate3d(${player.x}px, ${player.y}px, 0)`;

    platforms.forEach(plat => {
        if(plat.element) {
            let renderX = plat.type === 'pastel' ? plat.x + Math.sin(Date.now() * 0.002 + plat.baseKey) * 60 : plat.x;
            plat.element.style.transform = `translate3d(${renderX}px, ${plat.y}px, 0)`;
        }
    });
    
    // Separated the items and stars to use .left and .top so CSS animations don't break!
    items.forEach(item => {
        if(item.element) {
            item.element.style.left = `${item.x}px`;
            item.element.style.top = `${item.y}px`;
        }
    });

    stars.forEach(star => {
        if(star.element) {
            star.element.style.left = `${star.x}px`;
            star.element.style.top = `${star.y}px`;
        }
    });

    gameLoop = requestAnimationFrame(updateGame);
}

function checkMilestones(currentScore) {
    let unlockedBadges = JSON.parse(localStorage.getItem('devililiaUnlockedBadges')) || [];
    
    milestones.forEach(m => {
        if (currentScore >= m.score && !unlockedBadges.includes(m.id)) {
            unlockedBadges.push(m.id);
            localStorage.setItem('devililiaUnlockedBadges', JSON.stringify(unlockedBadges));
            triggerMilestonePopup(m.title);
        }
    });
}

function triggerMilestonePopup(text) {
    const popup = document.getElementById('milestone-popup');
    popup.innerText = text;
    popup.classList.remove('hidden');
    void popup.offsetWidth;
}

function renderGameObjects() {
    const platContainer = document.getElementById('platforms-container');
    platforms.forEach(plat => {
        if(!plat.element) {
            let el = document.createElement('div');
            el.className = plat.type === 'pastel' ? 'pastel-platform' : 'game-platform';
            platContainer.appendChild(el);
            plat.element = el;
        }
    });
    
    const itemContainer = document.getElementById('items-container');
    items.forEach(item => {
        if(!item.element) {
            let el = document.createElement('div');
            el.className = 'game-item';
            itemContainer.appendChild(el);
            item.element = el;
        }
    });

    stars.forEach(star => {
        if(!star.element) {
            let el = document.createElement('div');
            el.className = 'star-item';
            itemContainer.appendChild(el);
            star.element = el;
        }
    });
}

function updateHearts() {
    const heartsContainer = document.getElementById('health-bar');
    heartsContainer.innerHTML = '';
    for(let i = 0; i < lives; i++) {
        let img = document.createElement('img');
        img.src = 'hrt.png';
        img.className = 'heart-icon';
        heartsContainer.appendChild(img);
    }
}

window.restartGame = initGame;

// --- SCREENSAVER LOGIC ---
let screensaverTimeout;
const screensaver = document.getElementById('screensaver');
const logo = document.getElementById('bounce-logo');

let x = 0, y = 0, dx = 2, dy = 2;
let animationFrame;

function resetScreensaver() {
    clearTimeout(screensaverTimeout);
    screensaver.classList.add('hidden');
    cancelAnimationFrame(animationFrame);
    
    if (gameActive) return; 
    
    screensaverTimeout = setTimeout(showScreensaver, 10000); 
}

function showScreensaver() {
    screensaver.classList.remove('hidden');
    x = Math.random() * (window.innerWidth - 80);
    y = Math.random() * (window.innerHeight - 80);
    animateLogo();
}

function animateLogo() {
    if(x + 80 >= window.innerWidth || x <= 0) dx = -dx;
    if(y + 80 >= window.innerHeight || y <= 0) dy = -dy;
    x += dx; y += dy;
    logo.style.left = x + 'px';
    logo.style.top = y + 'px';
    animationFrame = requestAnimationFrame(animateLogo);
}

['mousemove', 'touchstart', 'click', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetScreensaver);
});

