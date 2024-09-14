const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let startTime = Date.now();  // Track the start time
let totalTime = 0;

const playerImg = new Image();
playerImg.src = 'spaceship.jpeg'; // Replace with the actual path to your spaceship image

const enemyImg = new Image();
enemyImg.src = 'enemy.jpeg'; // Replace with the actual path to your enemy image

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,  // Adjust to the size of your image
    speed: 5,
    dx: 0,
    destroyed: false,
};

let bullets = [];
let enemies = [];
let enemySpeed = 2; // Initial speed boost
let enemyRows = 5;
let enemyCols = 8;
let gameOver = false;

// Create enemies
function createEnemies() {
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: col * 60 + 50,
                y: row * 60 + 30,  // Adjust spacing as needed
                width: 35,  // 30% of the spaceship width (50 * 0.3)
                height: 35, // 30% of the spaceship height (50 * 0.3)
                dx: enemySpeed,
            });
        }
    }
}

// Draw player spaceship using an image
function drawPlayer() {
    if (!player.destroyed) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }
}

// Draw enemies using images
function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Draw bullets (keeping bullets as rectangles)
function drawBullets() {
    ctx.fillStyle = "#FFFF00";
    bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Move player
function movePlayer() {
    if (!player.destroyed) {
        player.x += player.dx;

        // Prevent player from going off the canvas
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }
}

// Move bullets
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= 5;

        // Remove bullet if it goes off-screen
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

// Move enemies
function moveEnemies() {
    let hitWall = false;

    enemies.forEach((enemy) => {
        enemy.x += enemy.dx;

        // If enemy hits canvas edge, reverse direction and move down
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            hitWall = true;
        }
    });

    if (hitWall) {
        enemies.forEach((enemy) => {
            enemy.dx *= -1.5;  // Increase speed by 50% when hitting the wall
            enemy.y += 10;
        });
    }

    // Progressive speed increase as enemies decrease
    let speedMultiplier = 2.5 + ((enemyRows * enemyCols - enemies.length) / (enemyRows * enemyCols)) * 2; // Increase speed as enemies are killed
    enemies.forEach((enemy) => {
        enemy.dx = Math.sign(enemy.dx) * enemySpeed * speedMultiplier; // Keep direction and adjust speed
    });
}

// Collision detection between bullet and enemy
function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Remove bullet and enemy on collision
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
            }
        });
    });
}

// Handle shooting bullets
function shoot() {
    if (!player.destroyed) {
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
        });
    }
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Display win screen
function showWinScreen() {
    clearCanvas();
    totalTime = Math.floor((Date.now() - startTime) / 1000);  // Calculate time in seconds
    const winScreen = document.getElementById("win-screen");
    winScreen.innerHTML = `<p>You Win!<br>Total Time: ${totalTime} seconds</p>
                           <button id="restartButton">Restart</button>`;
    winScreen.style.display = "block";
    document.getElementById("restartButton").addEventListener("click", restartGame);
}

// Display lose screen
function showLoseScreen() {
    clearCanvas();
    totalTime = Math.floor((Date.now() - startTime) / 1000);  // Calculate time in seconds
    const loseScreen = document.getElementById("win-screen");
    loseScreen.innerHTML = `<p>You Lose!<br>Total Time: ${totalTime} seconds</p>
                            <button id="restartButton">Restart</button>`;
    loseScreen.style.display = "block";
    document.getElementById("restartButton").addEventListener("click", restartGame);
}

// Hide win/lose screen
function hideWinLoseScreen() {
    const screen = document.getElementById("win-screen");
    screen.style.display = "none";
}

// Check for win condition
function checkWin() {
    if (enemies.length === 0) {
        gameOver = true;
        showWinScreen();
    }
}

// Check for lose condition
function checkLose() {
    enemies.forEach((enemy) => {
        if (enemy.y + enemy.height >= player.y) {
            player.destroyed = true;
            gameOver = true;
            showLoseScreen();
        }
    });

    if (!player.destroyed) {
        enemies.forEach((enemy) => {
            if (enemy.y + enemy.height >= canvas.height) {
                gameOver = true;
                showLoseScreen();
            }
        });
    }
}

// Restart the game
function restartGame() {
    enemySpeed = 2; // Reset initial speed
    enemyRows = 5;
    enemyCols = 8;
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 50;
    player.destroyed = false;
    bullets = [];
    enemies = [];
    createEnemies();
    hideWinLoseScreen();
    startTime = Date.now();  // Reset the timer
    gameOver = false;
    update();
}

// Update game frame
function update() {
    if (!gameOver) {
        clearCanvas();
        drawPlayer();
        drawEnemies();
        drawBullets();
        movePlayer();
        moveBullets();
        moveEnemies();
        detectCollisions();
        checkWin();
        checkLose();

        requestAnimationFrame(update);
    }
}

// Event listeners for player movement and shooting
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        player.dx = player.speed;
    } else if (e.key === "ArrowLeft") {
        player.dx = -player.speed;
    }
    if (e.key === " ") {
        shoot();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        player.dx = 0;
    }
});

// Initialize game
createEnemies();
update();
