// sounds
const coinSound = new Audio("sounds/coin.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const bgm = new Audio("sounds/bgm.mp3");
bgm.loop = true;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");

let keys = {};
let score = 0;
let gameOver = false;
let timeLeft = 30;
let timerInterval;
let highScore = localStorage.getItem("highScore") || 0;

// Game Dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const player = { x: 50, y: 50, size: 30, color: "lime", speed: 4 };
const enemy = { x: 700, y: 100, size: 30, color: "red", speed: 2 };

const coins = [];
function spawnCoins(n) {
  coins.length = 0;
  for (let i = 0; i < n; i++) {
    coins.push({
      x: Math.random() * (GAME_WIDTH - 50) + 25,
      y: Math.random() * (GAME_HEIGHT - 50) + 25,
      size: 15,
      color: "gold",
      collected: false,
    });
  }
}
spawnCoins(5);

// Keyboard controls
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Touch controls
["up", "down", "left", "right"].forEach((dir) => {
  document
    .getElementById(dir)
    .addEventListener(
      "touchstart",
      () => (keys[`Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}`] = true)
    );
  document
    .getElementById(dir)
    .addEventListener(
      "touchend",
      () => (keys[`Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}`] = false)
    );
});

// Gyro controls
window.addEventListener("deviceorientation", (e) => {
  keys["ArrowRight"] = e.gamma > 10;
  keys["ArrowLeft"] = e.gamma < -10;
  keys["ArrowDown"] = e.beta > 10;
  keys["ArrowUp"] = e.beta < -10;
});

function update() {
  // Move player
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y));

  // Enemy follows player
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  enemy.x += (dx / dist) * enemy.speed;
  enemy.y += (dy / dist) * enemy.speed;

  // Coin collection
  for (let coin of coins) {
    if (!coin.collected && isColliding(player, coin)) {
      coin.collected = true;
      score += 10;
      coinSound.play();
      coins.push({
        x: Math.random() * (GAME_WIDTH - 50) + 25,
        y: Math.random() * (GAME_HEIGHT - 50) + 25,
        size: 15,
        color: "gold",
        collected: false,
      });
    }
  }

  // Collision with enemy
  if (isColliding(player, enemy)) {
    endGame();
  }
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Coins
  for (let coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = coin.color;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Enemy
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("High Score: " + highScore, 10, 50);

  ctx.textAlign = "right";
  ctx.fillText("Time: " + timeLeft, GAME_WIDTH - 10, 25);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.fillText("Score: " + score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    ctx.fillText(
      "High Score: " + highScore,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 100
    );
  }
}

function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();
  }
}

function startGame() {
  score = 0;
  timeLeft = 30;
  gameOver = false;
  spawnCoins(5);
  player.x = 50;
  player.y = 50;
  enemy.x = 700;
  enemy.y = 100;
  restartBtn.style.display = "none";

  bgm.currentTime = 0;
  bgm.play();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  gameLoop();
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  bgm.pause();
  hitSound.play();
  restartBtn.style.display = "block";
}

restartBtn.addEventListener("click", startGame);

// Start game on first key press
document.addEventListener(
  "keydown",
  () => {
    startGame();
  },
  { once: true }
);
