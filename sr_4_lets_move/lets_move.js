
const COLS = 6;
const ROWS = 3; // 0: stand (1), 1: walk (2), 2: run (3)
const FW = 36, FH = 40;

let state = 1;
let frameIndex = 0;
let frameTimer = 0;
let facing = 1; // 1 = вправо, -1 = вліво
let x, y;
let flipBtn, scaleSlider;

const STATES = {
  0: { name: 'stand', fps: 4,  speed: 0,   hit: { w: 14, h: 30, ox: 0, oy: 1 } },
  1: { name: 'walk',  fps: 11, speed: 140, hit: { w: 18, h: 29, ox: 1, oy: 1 } },
  2: { name: 'run',   fps: 15, speed: 250, hit: { w: 22, h: 25, ox: 2, oy: 3 } }
};

function setup() {
  createCanvas(720, 420);
  textFont('Verdana');
  textSize(13);

  buildCharacterSheet();

  x = width / 2;
  y = height / 2;

  flipBtn = createButton('Flip (F)');
  flipBtn.position(10, 10);
  flipBtn.mousePressed(toggleFlip);

  scaleSlider = createSlider(1, 4.5, 3, 0.5);
  scaleSlider.position(95, 12);
}

function buildCharacterSheet() {
  sheet = createGraphics(COLS * FW, ROWS * FH);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const phase = (col / COLS) * TWO_PI;
      const cx = FW / 2;

      let bob = 0;
      let lean = 0;
      let legSwing = 0;
      let armSwing = 0;

      if (row === 0) {
        bob = sin(phase) * 1.2;
        armSwing = sin(phase) * 2.5;
      } else if (row === 1) {
        bob = -abs(sin(phase)) * 2.5;
        lean = 1.5;
        legSwing = sin(phase) * 8;
        armSwing = -sin(phase) * 7;
      } else {
        bob = -abs(sin(phase)) * 4.5;
        lean = 4.5;
        legSwing = sin(phase) * 13;
        armSwing = -sin(phase) * 12;
      }

      const hipY = 23 + bob;
      const shoulderY = hipY - 9;
      const headY = shoulderY - 7;
      const headX = cx + lean * 1.1;
      const shoulderX = cx + lean * 0.8;
      const hipX = cx + lean * 0.3;

      sheet.push();
      sheet.translate(col * FW, row * FH);
      sheet.strokeCap(ROUND);

      // Задня нога та задня рука
      sheet.stroke(40, 45, 55);
      sheet.strokeWeight(3);
      sheet.line(hipX, hipY, hipX - legSwing, hipY + 12);
      sheet.line(shoulderX, shoulderY + 1, shoulderX - armSwing, shoulderY + 10);

      // Тулуб (колір залежить від режиму 1 / 2 / 3)
      sheet.noStroke();
      if (row === 0) sheet.fill(70, 145, 235);
      if (row === 1) sheet.fill(45, 185, 155);
      if (row === 2) sheet.fill(235, 110, 50);
      sheet.rectMode(CENTER);
      sheet.rect((shoulderX + hipX) / 2, (shoulderY + hipY) / 2, 10, 11, 3);

      // Передня нога
      sheet.stroke(25, 30, 40);
      sheet.strokeWeight(3.2);
      sheet.line(hipX, hipY, hipX + legSwing, hipY + 12);

      // Голова та око
      sheet.noStroke();
      sheet.fill(250, 214, 175);
      sheet.circle(headX, headY, 11);
      sheet.fill(20);
      sheet.circle(headX + 2.8, headY - 1, 2.2);

      // Передня рука
      sheet.stroke(250, 214, 175);
      sheet.strokeWeight(2.8);
      sheet.line(shoulderX, shoulderY + 1, shoulderX + armSwing, shoulderY + 10);

      sheet.pop();
    }
  }
}

function draw() {
  background(240);

  const cfg = STATES[state];
  const dt = (deltaTime || 16.67) / 1000;
  const scaleK = scaleSlider.value();

  frameTimer += dt;
  const frameDuration = 1 / cfg.fps;
  if (frameTimer >= frameDuration) {
    frameTimer %= frameDuration;
    frameIndex = (frameIndex + 1) % COLS;
  }

  let dx = 0;
  let dy = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { dx -= 1; facing = -1; }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { dx += 1; facing = 1; }
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) { dy -= 1; }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { dy += 1; }

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    x += (dx / len) * cfg.speed * dt;
    y += (dy / len) * cfg.speed * dt;
  }

  x = constrain(x, 26 * scaleK, width - 26 * scaleK);
  y = constrain(y, 28 * scaleK, height - 28 * scaleK);

  const sx = frameIndex * FW;
  const sy = state * FH;
  const dw = FW * scaleK;
  const dh = FH * scaleK;

  push();
  translate(x, y);
  scale(facing, 1);
  image(sheet, -dw / 2, -dh / 2, dw, dh, sx, sy, FW, FH);

  noFill();
  stroke(210, 35, 35);
  strokeWeight(1.8);
  rectMode(CENTER);
  rect(cfg.hit.ox * scaleK, cfg.hit.oy * scaleK, cfg.hit.w * scaleK, cfg.hit.h * scaleK);
  pop();

  noStroke();
  fill(25);
  text('[1] Stand (4 FPS)  |  [2] Walk (11 FPS)  |  [3] Run (15 FPS)  |  [F] Flip', 10, 48);
  text(
    `State: ${cfg.name} (${cfg.fps} FPS) | Frame: ${frameIndex + 1}/${COLS} | Facing: ${facing === 1 ? 'right' : 'left'} | Scale: ${scaleK}x`,
    10,
    height - 16
  );
}

function keyPressed() {
  if (key === '1') setState(0);
  else if (key === '2') setState(1);
  else if (key === '3') setState(2);
  else if (key === 'f' || key === 'F') toggleFlip();
}

function setState(nextState) {
  if (state !== nextState) {
    state = nextState;
    frameIndex = 0;
    frameTimer = 0;
  }
}

function toggleFlip() {
  facing *= -1;
}