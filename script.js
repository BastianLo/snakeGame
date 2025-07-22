const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');

const gridSize = 20; // Size of each snake segment and food item
let snake = [{ x: 10, y: 10 }]; // Initial snake position (in grid coordinates)
let food = {};
let dx = 0; // Horizontal velocity
let dy = 0; // Vertical velocity
let score = 0;
let gameInterval;
let gameRunning = false;

// Generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    // Ensure food does not spawn on the snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            generateFood(); // Regenerate if it spawns on the snake
            return;
        }
    }
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = 'darkgreen'; // Optional: add border to segments
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = 'darkred';
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check for wall collision
    if (
        head.x < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y < 0 ||
        head.y >= canvas.height / gridSize
    ) {
        gameOver();
        return;
    }

    // Check for self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood(); // Generate new food
    } else {
        snake.pop(); // Remove tail if no food eaten
    }

    draw();
}

// Handle keyboard input
document.addEventListener('keydown', e => {
    if (!gameRunning) return; // Only allow input if game is running

    const keyPressed = e.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (keyPressed === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -1;
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = 1;
    } else if (keyPressed === 'ArrowLeft' && !goingRight) {
        dx = -1;
        dy = 0;
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        dx = 1;
        dy = 0;
    }
});

// Game over function
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
    startButton.textContent = "Play Again";
    startButton.style.display = 'block'; // Show start button again
}

// Initialize and start the game
function startGame() {
    snake = [{ x: 10, y: 10 }]; // Reset snake position
    dx = 0; // Reset direction
    dy = 0; // Reset direction
    score = 0;
    scoreDisplay.textContent = score;
    generateFood();
    draw();
    gameRunning = true;
    startButton.style.display = 'none'; // Hide start button
    gameInterval = setInterval(update, 100); // Game speed (milliseconds)
}

startButton.addEventListener('click', startGame);

// Initial setup when page loads
// startButton.style.display = 'block'; // Ensure button is visible on load
// This will be handled by the HTML structure itself.
// draw initial empty canvas
ctx.fillStyle = '#333';
ctx.fillRect(0, 0, canvas.width, canvas.height);