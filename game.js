// Sounds
const coinSound = new Audio("sounds/coin.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const bgm = new Audio("sounds/bgm.mp3");
bgm.loop = true;

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Game variables
let keys = {};
let score = 0;
let gameOver = false;
let timeLeft = 30;
let timerInterval;
let highScore = localStorage.getItem("highScore") || 0;
let countdown = 0; // شمارش معکوس قبل از شروع بازی

// 📏 Game Dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// 🟢 Player & 🔴 Enemy
const player = { x: 50, y: 50, size: 30, width: 50, height: 50, speed: 4 };
const enemy = { x: 700, y: 100, size: 30, width: 50, height: 50, speed: 2 };

// 🟡 Coins
const coins = [];
function spawnCoins(n) {
  coins.length = 0;
  for (let i = 0; i < n; i++) {
    coins.push({
      x: Math.random() * (GAME_WIDTH - 50) + 25,
      y: Math.random() * (GAME_HEIGHT - 50) + 25,
      size: 15,
      collected: false,
    });
  }
}
spawnCoins(5);

// Keyboard controls
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// 📱 Touch controls
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

// 📱 Gyro controls
window.addEventListener("deviceorientation", (e) => {
  keys["ArrowRight"] = e.gamma > 10;
  keys["ArrowLeft"] = e.gamma < -10;
  keys["ArrowDown"] = e.beta > 10;
  keys["ArrowUp"] = e.beta < -10;
});

// Update
function update() {
  // حرکت بازیکن
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));

  // تعقیب دشمن
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  enemy.x += (dx / dist) * enemy.speed;
  enemy.y += (dy / dist) * enemy.speed;

  // جمع کردن سکه
  for (let coin of coins) {
    if (!coin.collected && isColliding(player, coin)) {
      coin.collected = true;
      score += 10;
      const sound = coinSound.cloneNode();
      sound.play();
      coins.push({
        x: Math.random() * (GAME_WIDTH - 50) + 25,
        y: Math.random() * (GAME_HEIGHT - 50) + 25,
        size: 15,
        collected: false,
      });
    }
  }

  // برخورد با دشمن
  if (isColliding(player, enemy)) {
    endGame();
  }
}

// Collision check
function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.width > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
}

// Stars background
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * GAME_WIDTH,
  y: Math.random() * GAME_HEIGHT,
  size: Math.random() * 2,
  speed: Math.random() * 1 + 0.5,
}));

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "white";
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.speed;
    if (star.y > GAME_HEIGHT) {
      star.y = 0;
      star.x = Math.random() * GAME_WIDTH;
    }
  });
}

// Characters
const playerImg = new Image();
playerImg.src = "./images/player.png";
const enemyImg = new Image();
enemyImg.src = "./images/enemy.png";

// Draw
function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawBackground();

  // Coins
  for (let coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Player & Enemy
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

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

// Game loop
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();
  }
}

// Start game (with countdown)
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

  countdown = 3; // start countdown

  const countdownInterval = setInterval(() => {
    draw();
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      countdown > 0 ? countdown : "Go!",
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2
    );

    if (countdown === 0) {
      clearInterval(countdownInterval);

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
    countdown--;
  }, 1000);
}

// End game
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

// Start first game
startGame();
