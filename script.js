const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const shopButton = document.getElementById('shopButton');
const shopModal = document.getElementById('shopModal');
const closeButton = document.querySelector('.close-button');
const doubleShotButton = document.getElementById('doubleShotButton');
const fireRateButton = document.getElementById('fireRateButton');
const fireRateLevelDisplay = document.getElementById('fireRateLevel');
const doubleShotCostDisplay = document.getElementById('doubleShotCost');
const fireRateCostDisplay = document.getElementById('fireRateCost');
const currentScoreDisplay = document.getElementById('currentScoreDisplay');
const finalScoreDisplay = document.getElementById('finalScore'); // Get final score display element

canvas.width = 600;
canvas.height = 700;

// Game variables
let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let score = 0; // Score for the current run, will be added to persistentScore on game over
let gameOver = false;
let gameInterval;
let level = 1;

// Difficulty scaling
let currentEnemySpeed = 1;
let enemiesPerRow = 5;
let enemyRows = 3;
let spawnInterval = 3000; // Time in ms between new enemy waves
let lastEnemySpawnTime = 0;

// Player firing cooldown
let lastPlayerFireTime = 0;
let playerFireCooldown = 200; // milliseconds between shots (initial)

// Upgrade System Variables - these will be persistent
let hasDoubleShot = false;
let fireRateLevel = 0;
const MAX_FIRE_RATE_LEVEL = 5;
const DOUBLE_SHOT_COST = 500;
const FIRE_RATE_BASE_COST = 200;
const FIRE_RATE_COOLDOWN_REDUCTION_PER_LEVEL = 30; // ms reduction per level

// Persistent game state variables
let persistentScore = 0;
let persistentHasDoubleShot = false;
let persistentFireRateLevel = 0;

// Image assets
let playerImage = new Image();
let enemyImage = new Image();
let assetsLoadedCount = 0;
const totalAssetsToLoad = 2; // player and enemy images

// Key presses
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Player object
function createPlayer() {
    player = {
        x: canvas.width / 2 - 30,
        y: canvas.height - 70,
        width: 60,
        height: 60,
        dx: 0,
        image: playerImage // Assign loaded image
    };
    console.log("Player created:", player);
}

// Enemy object
function createEnemy(x, y) {
    const enemy = {
        x: x,
        y: y,
        width: 40,
        height: 40,
        dx: currentEnemySpeed,
        dy: 0,
        image: enemyImage // Assign loaded image
    };
    console.log("Enemy created:", enemy);
    return enemy;
}

// Bullet object
function createBullet(x, y, isPlayerBullet = true) {
    return {
        x: x,
        y: y,
        width: 5,
        height: 15,
        speed: isPlayerBullet ? -7 : 5,
        isPlayerBullet: isPlayerBullet
    };
}

// Function to save game state to localStorage
function saveGameState() {
    const gameState = {
        score: persistentScore, // Save the accumulated persistent score
        hasDoubleShot: hasDoubleShot,
        fireRateLevel: fireRateLevel
    };
    localStorage.setItem('spaceInvadersGameState', JSON.stringify(gameState));
    console.log("Game state saved:", gameState);
}

// Function to load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('spaceInvadersGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        persistentScore = gameState.score !== undefined ? gameState.score : 0;
        persistentHasDoubleShot = gameState.hasDoubleShot !== undefined ? gameState.hasDoubleShot : false;
        persistentFireRateLevel = gameState.fireRateLevel !== undefined ? gameState.fireRateLevel : 0;
        console.log("Game state loaded:", gameState);
    } else {
        console.log("No saved game state found. Initializing with defaults.");
        persistentScore = 0;
        persistentHasDoubleShot = false;
        persistentFireRateLevel = 0;
    }

    // Apply loaded persistent values to current game run
    score = 0; // Current run's score starts at 0
    hasDoubleShot = persistentHasDoubleShot;
    fireRateLevel = persistentFireRateLevel;
    playerFireCooldown = 200 - (fireRateLevel * FIRE_RATE_COOLDOWN_REDUCTION_PER_LEVEL);
    playerFireCooldown = Math.max(50, playerFireCooldown); // Ensure minimum cooldown
}

// Initialize game
function init() {
    if (!canvas || !ctx) {
        console.error("Canvas or context not found.");
        return;
    }
    console.log("Initializing game...");

    loadGameState(); // Load persistent state first

    createPlayer();
    enemies = [];
    bullets = [];
    enemyBullets = [];
    gameOver = false;
    level = 1;
    currentEnemySpeed = 1;
    enemiesPerRow = 5;
    enemyRows = 3;
    spawnInterval = 3000;
    lastEnemySpawnTime = performance.now(); // Initialize for continuous spawning

    scoreDisplay.textContent = `Score: ${score}`; // Display current run score
    finalScoreDisplay.textContent = `Final Score: ${score}`; // Set final score display to 0 for new game

    gameOverScreen.style.display = 'none';
    shopModal.style.display = 'none';

    spawnEnemies(); // Initial spawn

    updateShopUI(); // Update shop state on init

    if (gameInterval) clearInterval(gameInterval); // Clear any existing interval
    requestAnimationFrame(gameLoop); // Start the game loop
    console.log("Game initialized and loop started.");
}

// Game loop
function gameLoop() {
    if (gameOver) {
        return;
    }

    update();
    draw();

    gameInterval = requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (!player) return; // Ensure player exists before updating

    handlePlayerMovement();
    updateBullets();
    updateEnemies();
    checkCollisions();
    spawnNewEnemies();

    // Check for game over condition (enemies reaching bottom)
    enemies.forEach(enemy => {
        if (enemy.y + enemy.height >= canvas.height - player.height) { // If enemy reaches player level or below
            endGame();
        }
    });
}

// Handle player movement
function handlePlayerMovement() {
    player.dx = 0;
    if (keys['ArrowLeft'] && player.x > 0) {
        player.dx = -5;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.dx = 5;
    }
    player.x += player.dx;

    if (keys['Space']) {
        const currentTime = performance.now();
        if (currentTime - lastPlayerFireTime > playerFireCooldown) {
            if (hasDoubleShot) {
                bullets.push(createBullet(player.x + player.width / 4, player.y));
                bullets.push(createBullet(player.x + player.width - player.width / 4 - 5, player.y));
            } else {
                bullets.push(createBullet(player.x + player.width / 2 - 2.5, player.y));
            }
            lastPlayerFireTime = currentTime;
        }
    }
}

// Update bullets
function updateBullets() {
    // Player bullets
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y > 0;
    });

    // Enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < canvas.height;
    });

    // Enemy shooting (simplified for continuous game)
    enemies.forEach(enemy => {
        if (Math.random() < 0.002 * level) { // Increased chance with level
            enemyBullets.push(createBullet(enemy.x + enemy.width / 2 - 2.5, enemy.y + enemy.height, false));
        }
    });
}

// Update enemies
function updateEnemies() {
    let hitWall = false;
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            hitWall = true;
        }
    });

    if (hitWall) {
        enemies.forEach(enemy => {
            enemy.dx *= -1;
            enemy.y += 20; // Move down
        });
    }
}

// Check for collisions
function checkCollisions() {
    // Player bullets vs Enemies
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Collision!
                bullets.splice(bIndex, 1); // Remove bullet
                enemies.splice(eIndex, 1); // Remove enemy
                score += 10; // Current run score
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });
    });

    // Enemy bullets vs Player
    enemyBullets.forEach((bullet, ebIndex) => {
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            // Player hit!
            enemyBullets.splice(ebIndex, 1); // Remove bullet
            endGame();
        }
    });
}

// Spawn initial enemies (or when starting a new wave)
function spawnEnemies() {
    enemies = []; // Clear existing enemies for a new wave
    for (let row = 0; row < enemyRows; row++) {
        for (let i = 0; i < enemiesPerRow; i++) {
            const x = 50 + i * 80;
            const y = 50 + row * 60;
            const newEnemy = createEnemy(x, y);
            newEnemy.dx = currentEnemySpeed; // Ensure new enemies have current speed
            enemies.push(newEnemy);
        }
    }
    console.log("Enemies spawned:", enemies.length);
}

// Continuous enemy spawning for endless game
function spawnNewEnemies() {
    const currentTime = performance.now();
    if (currentTime - lastEnemySpawnTime > spawnInterval) {
        lastEnemySpawnTime = currentTime;

        // Increase difficulty over time
        level++;
        currentEnemySpeed += 0.1; // Increase speed
        if (level % 5 === 0 && enemiesPerRow < 10) { // Add more enemies per row every 5 levels
            enemiesPerRow++;
        }
        if (spawnInterval > 1000) { // Reduce spawn interval down to a minimum
            spawnInterval -= 50;
        }

        // Spawn a new row of enemies
        for (let i = 0; i < enemiesPerRow; i++) {
            const x = 50 + i * 80;
            const y = -60; // Spawn off-screen at the top
            const newEnemy = createEnemy(x, y);
            newEnemy.dx = currentEnemySpeed; // Ensure new enemies have current speed
            enemies.push(newEnemy);
        }
        console.log(`Level: ${level}, Enemy Speed: ${currentEnemySpeed.toFixed(2)}, Spawn Interval: ${spawnInterval}ms, Enemies per row: ${enemiesPerRow}`);
    }
}


// Drawing functions
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    // Score is updated in checkCollisions and init, no need to draw every frame.
    // drawScore(); // This function updates scoreDisplay.textContent, which is handled elsewhere
}

function drawPlayer() {
    if (player && player.image && player.image.complete) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        // console.log("Drawing player at:", player.x, player.y);
    } else {
        // console.log("Player or player image not ready for drawing.", player);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy && enemy.image && enemy.image.complete) {
            ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            // console.log("Drawing enemy at:", enemy.x, enemy.y);
        } else {
            // console.log("Enemy or enemy image not ready for drawing.", enemy);
        }
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = 'lime';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Game over
function endGame() {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
    // Add current run's score to the persistent score
    persistentScore += score;
    finalScoreDisplay.textContent = `Final Score: ${persistentScore}`; // Display total accumulated score

    saveGameState(); // Save the updated state

    if (gameInterval) {
        cancelAnimationFrame(gameInterval); // Stop game loop
        gameInterval = null; // Clear interval ID
    }
    console.log("Game Over!");
}

// Restart game
restartButton.addEventListener('click', () => {
    restartGame();
});

function restartGame() {
    console.log("Restarting game...");
    if (gameInterval) {
        cancelAnimationFrame(gameInterval); // Stop any ongoing animation frame loop
        gameInterval = null;
    }
    // Re-load assets and then init, which now loads persistent data
    assetsLoadedCount = 0; // Reset for a full re-load check (if needed, though init should handle it)
    loadGameAssets(); // Re-load assets and then init
}

// Shop System
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'block';
    // When opening shop, update currentScoreDisplay with the persistent score
    currentScoreDisplay.textContent = `Your Score: ${persistentScore}`;
    updateShopUI();
});

closeButton.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === shopModal) {
        shopModal.style.display = 'none';
    }
});

doubleShotButton.addEventListener('click', () => {
    if (persistentScore >= DOUBLE_SHOT_COST && !hasDoubleShot) {
        persistentScore -= DOUBLE_SHOT_COST;
        hasDoubleShot = true;
        updateShopUI();
        scoreDisplay.textContent = `Score: ${score}`; // Score display in game remains for current run
        saveGameState(); // Save state immediately after purchase
    }
});

fireRateButton.addEventListener('click', () => {
    const cost = FIRE_RATE_BASE_COST * (fireRateLevel + 1);
    if (persistentScore >= cost && fireRateLevel < MAX_FIRE_RATE_LEVEL) {
        persistentScore -= cost;
        fireRateLevel++;
        playerFireCooldown = Math.max(50, playerFireCooldown - FIRE_RATE_COOLDOWN_REDUCTION_PER_LEVEL); // Minimum 50ms cooldown
        updateShopUI();
        scoreDisplay.textContent = `Score: ${score}`; // Score display in game remains for current run
        saveGameState(); // Save state immediately after purchase
    }
});

function updateShopUI() {
    currentScoreDisplay.textContent = `Your Score: ${persistentScore}`; // Always show persistent score in shop

    // Double Shot
    if (hasDoubleShot) {
        doubleShotButton.textContent = 'Double Shot (Purchased)';
        doubleShotButton.disabled = true;
    } else {
        doubleShotButton.textContent = `Double Shot (Cost: ${DOUBLE_SHOT_COST})`;
        doubleShotButton.disabled = persistentScore < DOUBLE_SHOT_COST;
    }
    doubleShotCostDisplay.textContent = `${DOUBLE_SHOT_COST}`;


    // Increased Fire Rate
    const fireRateNextCost = FIRE_RATE_BASE_COST * (persistentFireRateLevel + 1); // Use persistent level for cost calculation
    if (fireRateLevel >= MAX_FIRE_RATE_LEVEL) {
        fireRateButton.textContent = `Fire Rate (Max Level)`;
        fireRateButton.disabled = true;
    } else {
        fireRateButton.textContent = `Fire Rate (Cost: ${fireRateNextCost})`;
        fireRateButton.disabled = persistentScore < fireRateNextCost;
    }
    fireRateLevelDisplay.textContent = `Level: ${fireRateLevel}/${MAX_FIRE_RATE_LEVEL}`;
    fireRateCostDisplay.textContent = `${fireRateNextCost}`;
}

// --- Asset Loading and Game Start ---
function loadGameAssets() {
    console.log("Loading game assets...");
    let loadedAssets = 0;

    const onAssetLoad = () => {
        loadedAssets++;
        console.log(`Asset loaded. Total loaded: ${loadedAssets}/${totalAssetsToLoad}`);
        if (loadedAssets === totalAssetsToLoad) {
            console.log("All assets loaded. Starting game initialization.");
            init(); // Start the game only after all assets are loaded
        }
    };

    playerImage.onload = onAssetLoad;
    enemyImage.onload = onAssetLoad;

    playerImage.onerror = () => { console.error("Failed to load player image: assets/player.png"); };
    enemyImage.onerror = () => { console.error("Failed to load enemy image: assets/enemy.png"); };

    playerImage.src = 'assets/player.png'; // Assuming player.png is in an 'assets' folder
    enemyImage.src = 'assets/enemy.png';   // Assuming enemy.png is in an 'assets' folder
}

// Start the asset loading process
loadGameAssets();
