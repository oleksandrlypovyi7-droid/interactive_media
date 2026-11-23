let player;
let enemy;
let coin;

let score = 0;
let gameOver = false;
let audioCtx = null;

const BASE_ENEMY_SPEED = 120; // px/сек
const SPEED_STEP = 10;        // +10 px/сек за кожні +5 очок
const DRAG_THRESHOLD = 6;     // просторовий поріг drag у пікселях
const PLAYER_KEY_SPEED = 240; // px/сек для стрілок / WASD

function setup() {
  createCanvas(640, 420);
  resetGame();
}

function resetGame() {
  score = 0;
  gameOver = false;

  player = {
    x: width * 0.3,
    y: height * 0.5,
    r: 18,
    isPressed: false,
    isDragging: false,
    pressX: 0,
    pressY: 0,
    offsetX: 0,
    offsetY: 0
  };

  enemy = {
    x: width * 0.8,
    y: height * 0.5,
    r: 22
  };

  spawnCoin();
}

function spawnCoin() {
  const margin = 36;
  coin = {
    x: random(margin, width - margin),
    y: random(margin, height - margin),
    r: 12
  };
}

function getEnemySpeed() {
  const milestones = Math.floor(score / 5);
  return BASE_ENEMY_SPEED + milestones * SPEED_STEP;
}

function playCoinSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(990, now + 0.09);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

function draw() {
  background(22);
  const dt = deltaTime / 1000;

  if (!gameOver) {
    updatePlayerKeyboard(dt);
    updateEnemy(dt);
    checkCoinPickup();
    checkEnemyCollision();
  }

  // Монета
  fill(255, 204, 0);
  noStroke();
  circle(coin.x, coin.y, coin.r * 2);

  // Ворог-переслідувач (червоне коло)
  fill(235, 55, 55);
  stroke(255, 140, 140);
  strokeWeight(2);
  circle(enemy.x, enemy.y, enemy.r * 2);

  // Гравець
  fill(70, 150, 255);
  stroke(player.isDragging ? color(255) : color(160, 210, 255));
  strokeWeight(2);
  circle(player.x, player.y, player.r * 2);

  // HUD
  noStroke();
  fill(240);
  textSize(15);
  textAlign(LEFT, TOP);
  text(`Очки: ${score}   |   Швидкість ворога: ${getEnemySpeed()} px/сек`, 14, 12);

  if (gameOver) {
    fill(0, 0, 0, 165);
    rect(0, 0, width, height);

    fill(255, 80, 80);
    textAlign(CENTER, CENTER);
    textSize(34);
    text('GAME OVER', width / 2, height / 2 - 24);

    fill(255);
    textSize(18);
    text(`Фінальний рахунок: ${score}`, width / 2, height / 2 + 14);

    fill(200);
    textSize(14);
    text('Натисніть SPACE або клікніть, щоб почати знову', width / 2, height / 2 + 46);
  }
}

function updatePlayerKeyboard(dt) {
  let vx = 0;
  let vy = 0;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) vx -= 1;  // A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) vx += 1; // D
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) vy -= 1;    // W
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) vy += 1;  // S

  if (vx !== 0 || vy !== 0) {
    const len = Math.hypot(vx, vy);
    player.x = constrain(player.x + (vx / len) * PLAYER_KEY_SPEED * dt, player.r, width - player.r);
    player.y = constrain(player.y + (vy / len) * PLAYER_KEY_SPEED * dt, player.r, height - player.r);
  }
}

function updateEnemy(dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 0.001) {
    const speed = getEnemySpeed();
    enemy.x += (dx / distance) * speed * dt;
    enemy.y += (dy / distance) * speed * dt;
  }
}

function checkCoinPickup() {
  const d = dist(player.x, player.y, coin.x, coin.y);
  if (d <= player.r + coin.r) {
    score += 1;
    playCoinSound();
    spawnCoin();
  }
}

function checkEnemyCollision() {
  const d = dist(player.x, player.y, enemy.x, enemy.y);
  if (d <= player.r + enemy.r) {
    gameOver = true;
    player.isPressed = false;
    player.isDragging = false;
  }
}

function mousePressed() {
  if (gameOver) {
    resetGame();
    return;
  }

  if (dist(mouseX, mouseY, player.x, player.y) <= player.r + 6) {
    player.isPressed = true;
    player.isDragging = false;
    player.pressX = mouseX;
    player.pressY = mouseY;
    player.offsetX = mouseX - player.x;
    player.offsetY = mouseY - player.y;
  }
}

function mouseDragged() {
  if (gameOver || !player.isPressed) return;

  const moved = dist(player.pressX, player.pressY, mouseX, mouseY);
  if (!player.isDragging && moved >= DRAG_THRESHOLD) {
    player.isDragging = true;
  }

  if (player.isDragging) {
    player.x = constrain(mouseX - player.offsetX, player.r, width - player.r);
    player.y = constrain(mouseY - player.offsetY, player.r, height - player.r);
  }
}

function mouseReleased() {
  player.isPressed = false;
  player.isDragging = false;
}

function keyPressed() {
  if (keyCode === 32 && gameOver) { // Space
    resetGame();
  }
}