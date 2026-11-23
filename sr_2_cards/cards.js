let card;
const DRAG_THRESHOLD = 6; 
const KEY_STEP = 10;      

function setup() {
  createCanvas(600, 400);

  card = {
    x: width / 2 - 60,
    y: height / 2 - 40,
    w: 120,
    h: 80,
    isPressed: false,
    isDragging: false,
    pressStartX: 0,
    pressStartY: 0,
    offsetX: 0,
    offsetY: 0
  };
}

function draw() {
  background(24);

  handleKeyboardMove();

  push();
  if (card.isDragging) {
    fill(76, 175, 80);
    stroke(200, 255, 200);
    strokeWeight(2);
  } else if (isMouseOverCard()) {
    fill(66, 135, 245);
    noStroke();
  } else {
    fill(230, 80, 80);
    noStroke();
  }
  rect(card.x, card.y, card.w, card.h, 10);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(card.isDragging ? 'Dragging' : 'Картка', card.x + card.w / 2, card.y + card.h / 2);
  pop();

  fill(200);
  textAlign(LEFT, TOP);
  textSize(13);
  text(`Поріг drag: ${DRAG_THRESHOLD}px | Стрілки: рух X/Y | Стан: ${getStateName()}`, 12, 12);
}

function handleKeyboardMove() {
  let dx = 0;
  let dy = 0;

  if (keyIsDown(LEFT_ARROW)) dx -= KEY_STEP;
  if (keyIsDown(RIGHT_ARROW)) dx += KEY_STEP;
  if (keyIsDown(UP_ARROW)) dy -= KEY_STEP;
  if (keyIsDown(DOWN_ARROW)) dy += KEY_STEP;

  if (dx !== 0 || dy !== 0) {
    card.x = constrain(card.x + dx, 0, width - card.w);
    card.y = constrain(card.y + dy, 0, height - card.h);
  }
}

function mousePressed() {
  if (isMouseOverCard()) {
    card.isPressed = true;
    card.isDragging = false;
    card.pressStartX = mouseX;
    card.pressStartY = mouseY;
    card.offsetX = mouseX - card.x;
    card.offsetY = mouseY - card.y;
  }
}

function mouseDragged() {
  if (!card.isPressed) return;

  const distMoved = dist(card.pressStartX, card.pressStartY, mouseX, mouseY);

  if (!card.isDragging && distMoved >= DRAG_THRESHOLD) {
    card.isDragging = true;
  }

  if (card.isDragging) {
    card.x = constrain(mouseX - card.offsetX, 0, width - card.w);
    card.y = constrain(mouseY - card.offsetY, 0, height - card.h);
  }
}

function mouseReleased() {
  card.isPressed = false;
  card.isDragging = false;
}

function isMouseOverCard() {
  return (
    mouseX >= card.x &&
    mouseX <= card.x + card.w &&
    mouseY >= card.y &&
    mouseY <= card.y + card.h
  );
}

function getStateName() {
  if (card.isDragging) return 'Dragging';
  if (card.isPressed) return 'Pressed';
  if (isMouseOverCard()) return 'Hover';
  return 'Idle';
}