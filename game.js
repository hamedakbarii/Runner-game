// sounds
const coinSound = new Audio("sounds/coin.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const bgm = new Audio("sounds/bgm.mp3");
bgm.loop = true;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
    x: Math.random() * 750 + 25,
    y: Math.random() * 550 + 25,
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

  // limit the player to the canvas
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // move the enemy towards the player
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  enemy.x += (dx / dist) * enemy.speed;
  enemy.y += (dy / dist) * enemy.speed;

  // player collides with coins
  for (let coin of coins) {
    if (!coin.collected && isColliding(player, coin)) {
      coin.collected = true;
      score += 10;
      bgm.volume = 0.1;
      coinSound.play();
    }
  }

  // player collides with enemy = lose
  if (isColliding(player, enemy)) {
    gameOver = true;
    hitSound.play();
    bgm.volume = 0.1;
    bgm.pause();
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // coins
  for (let coin of coins) {
    if (!coin.collected) {
      ctx.fillStyle = coin.color;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // enemy
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  // score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  // lose
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Tahoma";
    ctx.fillText("You Lose! 🙃", 300, 300);
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
    draw(); // show the last state
  }
}

gameLoop();
