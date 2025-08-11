// sounds
const coinSound = new Audio("sounds/coin.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const bgm = new Audio("sounds/bgm.mp3");
bgm.loop = true;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");

// touch controls
document
  .getElementById("up")
  .addEventListener("touchstart", () => (keys["ArrowUp"] = true));
document
  .getElementById("up")
  .addEventListener("touchend", () => (keys["ArrowUp"] = false));

document
  .getElementById("down")
  .addEventListener("touchstart", () => (keys["ArrowDown"] = true));
document
  .getElementById("down")
  .addEventListener("touchend", () => (keys["ArrowDown"] = false));

document
  .getElementById("left")
  .addEventListener("touchstart", () => (keys["ArrowLeft"] = true));
document
  .getElementById("left")
  .addEventListener("touchend", () => (keys["ArrowLeft"] = false));

document
  .getElementById("right")
  .addEventListener("touchstart", () => (keys["ArrowRight"] = true));
document
  .getElementById("right")
  .addEventListener("touchend", () => (keys["ArrowRight"] = false));

window.addEventListener("deviceorientation", (e) => {
  if (e.gamma > 10) keys["ArrowRight"] = true; // tilted right
  else keys["ArrowRight"] = false;

  if (e.gamma < -10) keys["ArrowLeft"] = true; // tilted left
  else keys["ArrowLeft"] = false;

  if (e.beta > 10) keys["ArrowDown"] = true; // به جلو خم شده
  else keys["ArrowDown"] = false;

  if (e.beta < -10) keys["ArrowUp"] = true; // به عقب خم شده
  else keys["ArrowUp"] = false;
});

// Game Dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const player = {
  x: 50,
  y: 50,
  size: 30,
  color: "lime",
  speed: 4,
};

const coins = [];
for (let i = 0; i < 5; i++) {
  coins.push({
    x: Math.random() * (GAME_WIDTH - 50) + 25,
    y: Math.random() * (GAME_HEIGHT - 50) + 25,
    size: 15,
    color: "gold",
    collected: false,
  });
}

const enemy = {
  x: 700,
  y: 100,
  size: 30,
  color: "red",
  speed: 2,
};

let keys = {};
let score = 0;
let gameOver = false;

document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y));

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  enemy.x += (dx / dist) * enemy.speed;
  enemy.y += (dy / dist) * enemy.speed;

  for (let coin of coins) {
    if (!coin.collected && isColliding(player, coin)) {
      coin.collected = true;
      score += 10;
      bgm.volume = 0.1;
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

  if (isColliding(player, enemy)) {
    gameOver = true;
    hitSound.play();
    bgm.volume = 0.1;
    bgm.pause();
    restartBtn.style.display = "block";
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

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  for (let coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = coin.color;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Tahoma";
    ctx.textAlign = "center";
    ctx.fillText("You Lose! 🙃", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.textAlign = "left";
  }
}

function gameLoop() {
  document.addEventListener(
    "keydown",
    () => {
      bgm.play();
    },
    { once: true }
  );

  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();
  }
}

restartBtn.addEventListener("click", () => {
  player.x = GAME_WIDTH * 0.05;
  player.y = GAME_HEIGHT * 0.05;
  score = 0;
  gameOver = false;

  coins.forEach((coin) => {
    coin.x = Math.random() * (GAME_WIDTH - 50) + 25;
    coin.y = Math.random() * (GAME_HEIGHT - 50) + 25;
    coin.collected = false;
  });

  enemy.x = GAME_WIDTH * 0.85;
  enemy.y = GAME_HEIGHT * 0.15;

  restartBtn.style.display = "none";
  gameLoop();
});

gameLoop();
