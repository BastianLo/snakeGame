
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartInstructions = document.getElementById('restartInstructions');
const shopButton = document.getElementById('shopButton');
const shopModal = document.getElementById('shopModal');
const closeModal = document.querySelector('.close-button');
const currentScoreDisplay = document.getElementById('currentScoreDisplay');
const buyDoubleShotBtn = document.getElementById('buyDoubleShot');
const buyFireRateBtn = document.getElementById('buyFireRate');
const doubleShotCostDisplay = document.getElementById('doubleShotCost');
const fireRateCostDisplay = document.getElementById('fireRateCost');
const fireRateLevelDisplay = document.getElementById('fireRateLevel');
const maxFireRateLevelDisplay = document.getElementById('maxFireRateLevel');


// Game settings
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3;
const ENEMY_DESCENT_SPEED = 15; // How much enemies move down after reaching edge
let INITIAL_ENEMY_SPEED = 1;

// Upgrade costs
const DOUBLE_SHOT_COST = 500;
const FIRE_RATE_BASE_COST = 200;
const MAX_FIRE_RATE_LEVEL = 5;
const FIRE_RATE_COOLDOWN_REDUCTION_PER_LEVEL = 50; // ms

// Game state variables
let player;
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let score = 0;
let gameOver = false;
let gameLoopId; // To store requestAnimationFrame ID for stopping
let keys = {}; // To track pressed keys

// Difficulty scaling
let enemySpeedMultiplier = 1;
let currentEnemySpeed = INITIAL_ENEMY_SPEED;
let enemiesPerRow = 5; // Initial number of enemies
let enemyRows = 3; // Initial number of rows
let spawnInterval = 3000; // Time in ms between enemy spawns
let lastEnemySpawnTime = 0;
let level = 0; // Tracks difficulty level

// Player Fire Rate
let playerFireCooldown = 300; // milliseconds
let lastPlayerFireTime = 0;

// Upgrades
let hasDoubleShot = false;
let fireRateLevel = 0;


// Game Entities
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.color = 'lime';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= PLAYER_SPEED;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += PLAYER_SPEED;
        }
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Bullet {
    constructor(x, y, color, speed, type) {
        this.width = 5;
        this.height = 15;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.type = type; // 'player' or 'enemy'
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Enemy {
    constructor(x, y) {
        this.width = 40;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.color = 'red';
        this.direction = 1; // 1 for right, -1 for left
        this.fireCooldown = Math.random() * 2000 + 1000; // 1 to 3 seconds
        this.lastFireTime = Date.now();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += currentEnemySpeed * this.direction;

        // Check for boundary collision and change direction
        if (this.x + this.width > canvas.width || this.x < 0) {
            this.direction *= -1; // Reverse direction
            this.y += ENEMY_DESCENT_SPEED; // Move down
        }

        // Enemy firing
        if (Date.now() - this.lastFireTime > this.fireCooldown) {
            enemyBullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 'orange', -ENEMY_BULLET_SPEED, 'enemy'));
            this.lastFireTime = Date.now();
            this.fireCooldown = Math.random() * 2000 + 1000; // Reset cooldown
        }
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Helper function for AABB collision detection
function areColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game Initialization
function init() {
    // Reset all game state variables
    player = new Player();
    playerBullets = [];
    enemies = [];
    enemyBullets = [];
    score = 0;
    gameOver = false;
    keys = {};

    // Reset difficulty
    enemySpeedMultiplier = 1;
    currentEnemySpeed = INITIAL_ENEMY_SPEED;
    enemiesPerRow = 5;
    enemyRows = 3;
    spawnInterval = 3000;
    lastEnemySpawnTime = Date.now(); // Initialize for immediate spawn or controlled delay
    level = 0;

    // Reset upgrades
    hasDoubleShot = false;
    fireRateLevel = 0;
    playerFireCooldown = 300; // Reset to default

    scoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';
    restartInstructions.style.display = 'none';
    shopModal.style.display = 'none'; // Ensure shop is closed on restart

    updateShopUI(); // Update shop state on init
    spawnEnemies(); // Spawn initial wave of enemies
}

// Game Loop
function gameLoop(timestamp) {
    if (gameOver) {
        cancelAnimationFrame(gameLoopId);
        return;
    }

    const deltaTime = timestamp - (gameLoop.lastFrameTime || timestamp);
    gameLoop.lastFrameTime = timestamp;

    update(timestamp); // Pass timestamp to update for spawn logic
    draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Update game state
function update(timestamp) {
    player.update();

    // Player bullets update and removal
    playerBullets = playerBullets.filter(bullet => {
        bullet.update();
        return bullet.y > 0; // Keep bullets on screen
    });

    // Enemy bullets update and removal
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.update();
        return bullet.y < canvas.height; // Keep bullets on screen
    });

    // Enemy update and spawning
    enemies.forEach(enemy => enemy.update());

    // Continuous enemy spawning and difficulty scaling
    if (timestamp - lastEnemySpawnTime > spawnInterval) {
        spawnEnemies();
        lastEnemySpawnTime = timestamp;
        level++; // Increment level for difficulty tracking

        // Increase difficulty
        currentEnemySpeed = INITIAL_ENEMY_SPEED * (1 + level * 0.1); // Speed increases per level
        if (level % 5 === 0) { // Every 5 levels, increase enemies per row
            enemiesPerRow++;
            if (enemiesPerRow > 10) enemiesPerRow = 10; // Cap max enemies per row
        }
        spawnInterval = Math.max(1000, spawnInterval - 50); // Decrease spawn interval, with a min
    }


    // Collision detection
    // Player bullets vs. Enemies
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (areColliding(bullet.getRect(), enemy.getRect())) {
                playerBullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 100;
                scoreDisplay.textContent = `Score: ${score}`;
                updateShopUI(); // Update score in shop
            }
        });
    });

    // Enemy bullets vs. Player
    enemyBullets.forEach((bullet, bIndex) => {
        if (areColliding(bullet.getRect(), player.getRect())) {
            enemyBullets.splice(bIndex, 1);
            endGame(false); // Player hit, game over
        }
    });

    // Enemies vs. Player
    enemies.forEach(enemy => {
        if (areColliding(enemy.getRect(), player.getRect())) {
            endGame(false); // Enemy hit player, game over
        }
        if (enemy.y + enemy.height > canvas.height) {
            endGame(false); // Enemy reached bottom, game over
        }
    });

    // Win condition (if any, currently endless, so no win condition here)
    // If (enemies.length === 0 && level > X) might be a win for a level-based game.
}

// Draw game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    player.draw();
    playerBullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    enemyBullets.forEach(bullet => bullet.draw());
}

// Spawn a wave of enemies
function spawnEnemies() {
    const startX = 50;
    const startY = 50;
    const enemySpacing = 60;

    for (let r = 0; r < enemyRows; r++) {
        for (let i = 0; i < enemiesPerRow; i++) {
            const x = startX + i * enemySpacing;
            const y = startY + r * enemySpacing;
            enemies.push(new Enemy(x, y));
        }
    }
}

// Game Over
function endGame(win) {
    gameOver = true;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = `Final Score: ${score}`;
    restartInstructions.style.display = 'block';
    // Optionally display win/lose message
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && !gameOver) { // Spacebar to fire
        const currentTime = Date.now();
        if (currentTime - lastPlayerFireTime > playerFireCooldown) {
            if (hasDoubleShot) {
                playerBullets.push(new Bullet(player.x + player.width / 4, player.y, 'lime', BULLET_SPEED, 'player'));
                playerBullets.push(new Bullet(player.x + player.width * 3 / 4, player.y, 'lime', BULLET_SPEED, 'player'));
            } else {
                playerBullets.push(new Bullet(player.x + player.width / 2, player.y, 'lime', BULLET_SPEED, 'player'));
            }
            lastPlayerFireTime = currentTime;
        }
    }

    if ((e.key === 'R' || e.key === 'r') && gameOver) { // Only restart if game is over
        restartGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Shop Logic
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'block';
    updateShopUI();
});

closeModal.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === shopModal) {
        shopModal.style.display = 'none';
    }
});

buyDoubleShotBtn.addEventListener('click', () => {
    if (!hasDoubleShot && score >= DOUBLE_SHOT_COST) {
        score -= DOUBLE_SHOT_COST;
        hasDoubleShot = true;
        scoreDisplay.textContent = `Score: ${score}`;
        updateShopUI();
    } else if (hasDoubleShot) {
        alert('Double Shot already purchased!');
    } else {
        alert('Not enough score!');
    }
});

buyFireRateBtn.addEventListener('click', () => {
    const currentFireRateCost = FIRE_RATE_BASE_COST * (fireRateLevel + 1);
    if (fireRateLevel < MAX_FIRE_RATE_LEVEL && score >= currentFireRateCost) {
        score -= currentFireRateCost;
        fireRateLevel++;
        playerFireCooldown = Math.max(50, playerFireCooldown - FIRE_RATE_COOLDOWN_REDUCTION_PER_LEVEL); // Cap minimum cooldown
        scoreDisplay.textContent = `Score: ${score}`;
        updateShopUI();
    } else if (fireRateLevel >= MAX_FIRE_RATE_LEVEL) {
        alert('Max Fire Rate level reached!');
    } else {
        alert('Not enough score!');
    }
});

function updateShopUI() {
    currentScoreDisplay.textContent = `Current Score: ${score}`;

    // Double Shot
    doubleShotCostDisplay.textContent = DOUBLE_SHOT_COST;
    if (hasDoubleShot) {
        buyDoubleShotBtn.textContent = 'Double Shot (Purchased)';
        buyDoubleShotBtn.disabled = true;
        buyDoubleShotBtn.style.backgroundColor = '#555';
    } else {
        buyDoubleShotBtn.textContent = `Double Shot (${DOUBLE_SHOT_COST} Score)`;
        buyDoubleShotBtn.disabled = score < DOUBLE_SHOT_COST;
        buyDoubleShotBtn.style.backgroundColor = score >= DOUBLE_SHOT_COST ? '#28a745' : '#ccc';
    }

    // Fire Rate
    const nextFireRateCost = FIRE_RATE_BASE_COST * (fireRateLevel + 1);
    fireRateCostDisplay.textContent = nextFireRateCost;
    fireRateLevelDisplay.textContent = fireRateLevel;
    maxFireRateLevelDisplay.textContent = MAX_FIRE_RATE_LEVEL;

    if (fireRateLevel >= MAX_FIRE_RATE_LEVEL) {
        buyFireRateBtn.textContent = 'Increased Fire Rate (Max Level)';
        buyFireRateBtn.disabled = true;
        buyFireRateBtn.style.backgroundColor = '#555';
    } else {
        buyFireRateBtn.textContent = `Increased Fire Rate (${nextFireRateCost} Score) - Level ${fireRateLevel}/${MAX_FIRE_RATE_LEVEL}`;
        buyFireRateBtn.disabled = score < nextFireRateCost;
        buyFireRateBtn.style.backgroundColor = score >= nextFireRateCost ? '#007bff' : '#ccc';
    }
}

function restartGame() {
    init();
    requestAnimationFrame(gameLoop); // Restart the game loop
}

// Initial game setup
init();
requestAnimationFrame(gameLoop);
