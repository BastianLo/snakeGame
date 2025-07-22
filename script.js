const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let player;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let score = 0;
let gameOver = false;

const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1;
const ENEMY_DROP_SPEED = 20;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_SPACING = 50;

// Player
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.color = 'lime';
        this.dx = 0; // movement direction
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;

        // Prevent player from going off-screen
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }

    shoot() {
        playerBullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y, -BULLET_SPEED, 'lime'));
    }
}

// Bullet
class Bullet {
    constructor(x, y, dy, color) {
        this.width = 5;
        this.height = 10;
        this.x = x;
        this.y = y;
        this.dy = dy; // vertical speed
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.dy;
    }
}

// Enemy
class Enemy {
    constructor(x, y) {
        this.width = 40;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.color = 'red';
        this.dx = ENEMY_SPEED;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
    }

    shoot() {
        enemyBullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y + this.height, ENEMY_BULLET_SPEED, 'yellow'));
    }
}

function init() {
    player = new Player();
    createEnemies();
    gameLoop();
}

function createEnemies() {
    for (let r = 0; r < ENEMY_ROWS; r++) {
        for (let c = 0; c < ENEMY_COLS; c++) {
            enemies.push(new Enemy(50 + c * ENEMY_SPACING, 50 + r * ENEMY_SPACING));
        }
    }
}

function update() {
    if (gameOver) return;

    player.update();

    // Update player bullets
    playerBullets = playerBullets.filter(bullet => {
        bullet.update();
        return bullet.y > 0;
    });

    // Update enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.update();
        return bullet.y < canvas.height;
    });

    // Update enemies
    let hitWall = false;
    enemies.forEach(enemy => {
        enemy.update();
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            hitWall = true;
        }
    });

    if (hitWall) {
        enemies.forEach(enemy => {
            enemy.dx *= -1; // Reverse horizontal direction
            enemy.y += ENEMY_DROP_SPEED; // Drop down
            if (enemy.y + enemy.height > player.y) {
                gameOver = true; // Enemies reached player
            }
        });
    }

    // Enemy shooting (randomly)
    if (Math.random() < 0.02 && enemies.length > 0) { // Adjust probability for shooting
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        randomEnemy.shoot();
    }

    // Collision Detection
    // Player bullet and enemy collision
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Collision
                playerBullets.splice(bIndex, 1); // Remove bullet
                enemies.splice(eIndex, 1); // Remove enemy
                score += 10;
                document.getElementById('score').innerText = score;

                // Check for game win
                if (enemies.length === 0) {
                    gameOver = true;
                    document.getElementById('gameOver').innerText = 'YOU WIN!';
                }
            }
        });
    });

    // Enemy bullet and player collision
    enemyBullets.forEach((bullet, bIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            // Collision
            enemyBullets.splice(bIndex, 1); // Remove bullet
            gameOver = true;
        }
    });

    // Enemy and player collision
    enemies.forEach(enemy => {
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            
            gameOver = true;
        }
    });

    if (gameOver) {
        document.getElementById('gameOver').style.display = 'block';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    player.draw();
    playerBullets.forEach(bullet => bullet.draw());
    enemyBullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input Handling
document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
        player.dx = -PLAYER_SPEED;
    } else if (e.key === 'ArrowRight') {
        player.dx = PLAYER_SPEED;
    } else if (e.key === ' ') { // Spacebar for shooting
        player.shoot();
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
});

init();
