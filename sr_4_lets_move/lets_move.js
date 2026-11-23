const FRAME_W = 88;
const FRAME_H = 88;

const BASE_ENEMY_SPEED = 120; // px/сек
const SPEED_STEP = 10;        // +10 px/сек за кожні +5 очок
const DRAG_THRESHOLD = 6;     // просторовий поріг drag (px)

// Конфігурація 3 анімацій + індивідуальний hitbox під кожну
const ANIM_CONFIG = {
  idle: {
    label: 'Стояти',
    fps: 4,
    framesCount: 4,
    moveSpeed: 0,
    // Hitbox: коло (у локальних координатах до масштабування)
    hitbox: { type: 'circle', offsetX: 0, offsetY: 4, r: 22 }
  },
  walk: {
    label: 'Крокувати',
    fps: 11,
    framesCount: 6,
    moveSpeed: 170,
    // Hitbox: прямокутник
    hitbox: { type: 'rect', offsetX: -19, offsetY: -24, w: 38, h: 56 }
  },
  run: {
    label: 'Бігти',
    fps: 15,
    framesCount: 6,
    moveSpeed: 270,
    // Hitbox: нижчий і ширший прямокутник під нахилений корпус під час бігу
    hitbox: { type: 'rect', offsetX: -23, offsetY: -15, w: 46, h: 46 }
  }
};

const animations = {
  idle: [],
  walk: [],
  run: []
};

let player;
let enemy;
let coin;

let currentAnim = 'walk';
let frameIndex = 0;
let frameTimerMs = 0;
let flipX = false;

let score = 0;
let gameOver = false;
let audioCtx = null;

// UI-елементи
let scaleSlider;
let scaleValueSpan;
let flipButton;
let showHitboxCheckbox;

function setup() {
  createCanvas(680, 440);
  generateAllAnimations();
  createControlsUI();
  resetGame();
}

function createControlsUI() {
  const bar = createDiv()
    .style('margin-top', '10px')
    .style('display', 'flex')
    .style('flex-wrap', 'wrap')
    .style('gap', '14px')
    .style('align-items', 'center')
    .style('font-family', 'sans-serif');

  createSpan('Масштаб:').parent(bar);
  scaleSlider = createSlider(0.6, 2.0, 1.0, 0.05).parent(bar);
  scaleValueSpan = createSpan('1.00x').parent(bar);

  flipButton = createButton('Flip (F)').parent(bar);
  flipButton.mousePressed(toggleFlip);

  showHitboxCheckbox = createCheckbox('Показати hitbox', true).parent(bar);
}

function resetGame() {
  score = 0;
  gameOver = false;
  currentAnim = 'walk';
  frameIndex = 0;
  frameTimerMs = 0;
  flipX = false;

  player = {
    x: width * 0.28,
    y: height * 0.52,
    isPressed: false,
    isDragging: false,
    pressX: 0,
    pressY: 0,
    offsetX: 0,
    offsetY: 0
  };

  enemy = {
    x: width * 0.82,
    y: height * 0.52,
    r: 20
  };

  spawnCoin();
}

function spawnCoin() {
  const margin = 42;
  coin = {
    x: random(margin, width - margin),
    y: random(68, height - margin),
    r: 12
  };
}

function getEnemySpeed() {
  return BASE_ENEMY_SPEED + Math.floor(score / 5) * SPEED_STEP;
}

function setAnimation(name) {
  if (!ANIM_CONFIG[name]) return;
  if (currentAnim !== name) {
    currentAnim = name;
    frameIndex = 0;
    frameTimerMs = 0;
  }
}

function toggleFlip() {
  flipX = !flipX;
}

// --- Програмна генерація кадрів (без зовнішніх файлів) ---

function generateAllAnimations() {
  for (let i = 0; i < ANIM_CONFIG.idle.framesCount; i++) {
    animations.idle.push(createIdleFrame(i, ANIM_CONFIG.idle.framesCount));
  }
  for (let i = 0; i < ANIM_CONFIG.walk.framesCount; i++) {
    animations.walk.push(createWalkFrame(i, ANIM_CONFIG.walk.framesCount));
  }
  for (let i = 0; i < ANIM_CONFIG.run.framesCount; i++) {
    animations.run.push(createRunFrame(i, ANIM_CONFIG.run.framesCount));
  }
}

function createIdleFrame(idx, total) {
  const g = createGraphics(FRAME_W, FRAME_H);
  g.clear();
  const phase = (idx / total) * TWO_PI;
  const breath = sin(phase) * 2.5;
  const cx = FRAME_W / 2;
  const cy = FRAME_H / 2 + 8;

  g.stroke(60, 75, 105);
  g.strokeWeight(6);
  g.strokeCap(ROUND);
  g.line(cx - 9, cy + 6, cx - 10, cy + 24);
  g.line(cx + 9, cy + 6, cx + 10, cy + 24);

  g.noStroke();
  g.fill(70, 145, 245);
  g.rectMode(CENTER);
  g.rect(cx, cy - 4 + breath * 0.4, 24, 24, 6);

  g.fill(255, 214, 170);
  g.circle(cx, cy - 23 + breath, 20);
  g.fill(25);
  g.circle(cx + 5, cy - 24 + breath, 3.5);

  return g;
}

function createWalkFrame(idx, total) {
  const g = createGraphics(FRAME_W, FRAME_H);
  g.clear();
  const phase = (idx / total) * TWO_PI;
  const swing = sin(phase) * 12;
  const bob = abs(cos(phase)) * -2.5;
  const cx = FRAME_W / 2;
  const cy = FRAME_H / 2 + 8 + bob;

  g.stroke(45, 60, 85);
  g.strokeWeight(5.5);
  g.strokeCap(ROUND);
  g.line(cx, cy - 10, cx - swing * 0.7, cy + 4);
  g.line(cx, cy + 6, cx - swing, cy + 24);

  g.noStroke();
  g.fill(60, 185, 130);
  g.rectMode(CENTER);
  g.rect(cx, cy - 4, 24, 24, 6);

  g.fill(255, 214, 170);
  g.circle(cx + 2, cy - 23, 20);
  g.fill(25);
  g.circle(cx + 7, cy - 24, 3.5);

  g.stroke(75, 95, 130);
  g.strokeWeight(6);
  g.line(cx, cy + 6, cx + swing, cy + 24);
  g.line(cx, cy - 10, cx + swing * 0.7, cy + 4);

  return g;
}

function createRunFrame(idx, total) {
  const g = createGraphics(FRAME_W, FRAME_H);
  g.clear();
  const phase = (idx / total) * TWO_PI;
  const stride = sin(phase) * 18;
  const lift = cos(phase) * 7;
  const bob = abs(sin(phase)) * -4;
  const cx = FRAME_W / 2;
  const cy = FRAME_H / 2 + 10 + bob;

  g.push();
  g.translate(cx, cy);
  g.rotate(radians(15));

  g.stroke(50, 65, 90);
  g.strokeWeight(5.5);
  g.strokeCap(ROUND);
  g.line(0, 5, -stride, 21 - max(0, lift));

  g.noStroke();
  g.fill(245, 155, 50);
  g.rectMode(CENTER);
  g.rect(0, -5, 26, 22, 6);

  g.fill(255, 214, 170);
  g.circle(3, -23, 20);
  g.fill(25);
  g.circle(8, -24, 3.5);

  g.stroke(85, 105, 145);
  g.strokeWeight(6);
  g.line(0, 5, stride, 21 - max(0, -lift));

  g.pop();
  return g;
}

// --- Звук збору монети ---

function playCoinSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();

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

// --- Головний цикл ---

function draw() {
  background(22);
  const dt = deltaTime / 1000;
  const s = scaleSlider.value();
  scaleValueSpan.html(`${s.toFixed(2)}x`);

  const cfg = ANIM_CONFIG[currentAnim];
  const frames = animations[currentAnim];

  // Оновлення кадру анімації за її власним FPS
  const frameDurationMs = 1000 / cfg.fps;
  frameTimerMs += deltaTime;
  while (frameTimerMs >= frameDurationMs) {
    frameTimerMs -= frameDurationMs;
    frameIndex = (frameIndex + 1) % frames.length;
  }

  if (!gameOver) {
    updatePlayerKeyboard(dt, cfg.moveSpeed);
    updateEnemy(dt);

    if (checkCircleHitboxCollision(coin.x, coin.y, coin.r, s)) {
      score += 1;
      playCoinSound();
      spawnCoin();
    }

    if (checkCircleHitboxCollision(enemy.x, enemy.y, enemy.r, s)) {
      gameOver = true;
      player.isPressed = false;
      player.isDragging = false;
    }
  }

  // Монета
  fill(255, 204, 0);
  noStroke();
  circle(coin.x, coin.y, coin.r * 2);

  // Ворог-переслідувач (червоне коло)
  fill(235, 55, 55);
  stroke(255, 145, 145);
  strokeWeight(2);
  circle(enemy.x, enemy.y, enemy.r * 2);

  // Персонаж гравця (з урахуванням масштабу і Flip)
  push();
  translate(player.x, player.y);
  scale(flipX ? -s : s, s);
  imageMode(CENTER);
  image(frames[frameIndex], 0, 0);

  if (showHitboxCheckbox.checked()) {
    drawLocalHitbox(cfg.hitbox);
  }
  pop();

  drawHud(cfg);

  if (gameOver) {
    drawGameOverOverlay();
  }
}

function drawLocalHitbox(hb) {
  push();
  noFill();
  stroke(255, 230, 70);
  strokeWeight(2);
  if (hb.type === 'circle') {
    circle(hb.offsetX, hb.offsetY, hb.r * 2);
  } else {
    rectMode(CORNER);
    rect(hb.offsetX, hb.offsetY, hb.w, hb.h);
  }
  pop();
}

// Перевірка колізії кола (монета / ворог) з поточним hitbox гравця (з урахуванням масштабу та Flip)
function checkCircleHitboxCollision(cx, cy, cr, s) {
  const hb = ANIM_CONFIG[currentAnim].hitbox;
  const dir = flipX ? -1 : 1;

  if (hb.type === 'circle') {
    const hx = player.x + hb.offsetX * dir * s;
    const hy = player.y + hb.offsetY * s;
    const hr = hb.r * s;
    return dist(cx, cy, hx, hy) <= cr + hr;
  } else {
    const w = hb.w * s;
    const h = hb.h * s;
    const rx = flipX
      ? player.x - (hb.offsetX + hb.w) * s
      : player.x + hb.offsetX * s;
    const ry = player.y + hb.offsetY * s;

    const closestX = constrain(cx, rx, rx + w);
    const closestY = constrain(cy, ry, ry + h);
    return dist(cx, cy, closestX, closestY) <= cr;
  }
}

function updatePlayerKeyboard(dt, moveSpeed) {
  let vx = 0;
  let vy = 0;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) vx -= 1;  // A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) vx += 1; // D
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) vy -= 1;    // W
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) vy += 1;  // S

  if (vx < 0) flipX = true;
  if (vx > 0) flipX = false;

  // Якщо гравець стоїть у режимі "1 — стояти" (moveSpeed === 0), але тисне стрілки — перемикаємо на ходьбу
  if ((vx !== 0 || vy !== 0) && moveSpeed === 0) {
    setAnimation('walk');
    moveSpeed = ANIM_CONFIG.walk.moveSpeed;
  }

  if (vx !== 0 || vy !== 0) {
    const len = Math.hypot(vx, vy);
    player.x = constrain(player.x + (vx / len) * moveSpeed * dt, 30, width - 30);
    player.y = constrain(player.y + (vy / len) * moveSpeed * dt, 55, height - 30);
  }
}

function updateEnemy(dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const d = Math.hypot(dx, dy);

  if (d > 0.001) {
    const speed = getEnemySpeed();
    enemy.x += (dx / d) * speed * dt;
    enemy.y += (dy / d) * speed * dt;
  }
}

function drawHud(cfg) {
  noStroke();
  fill(240);
  textAlign(LEFT, TOP);
  textSize(14);
  text(
    `Очки: ${score}  |  Ворог: ${getEnemySpeed()} px/с  |  Анімація: ${cfg.label} (${cfg.fps} FPS)  |  Hitbox: ${cfg.hitbox.type}`,
    12,
    10
  );

  fill(175);
  textSize(12);
  text(
    '[1] Стояти (4 FPS)  [2] Крокувати (11 FPS)  [3] Бігти (15 FPS)  [F] Flip  |  Рух: стрілки / WASD або миша',
    12,
    30
  );
}

function drawGameOverOverlay() {
  fill(0, 0, 0, 170);
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
  text('Натисніть SPACE або клікніть, щоб зіграти знову', width / 2, height / 2 + 46);
}

// --- Події миші та клавіатури ---

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  if (gameOver) {
    resetGame();
    return;
  }

  const s = scaleSlider.value();
  if (dist(mouseX, mouseY, player.x, player.y) <= 36 * s) {
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

  if (!player.isDragging && dist(player.pressX, player.pressY, mouseX, mouseY) >= DRAG_THRESHOLD) {
    player.isDragging = true;
  }

  if (player.isDragging) {
    const newX = constrain(mouseX - player.offsetX, 30, width - 30);
    if (newX < player.x - 0.5) flipX = true;
    if (newX > player.x + 0.5) flipX = false;

    player.x = newX;
    player.y = constrain(mouseY - player.offsetY, 55, height - 30);
  }
}

function mouseReleased() {
  player.isPressed = false;
  player.isDragging = false;
}

function keyPressed() {
  if (keyCode === 32 && gameOver) { // Space
    resetGame();
    return;
  }

  if (key === '1') setAnimation('idle');
  else if (key === '2') setAnimation('walk');
  else if (key === '3') setAnimation('run');
  else if (key === 'f' || key === 'F' || key === 'ф' || key === 'Ф') toggleFlip();
}