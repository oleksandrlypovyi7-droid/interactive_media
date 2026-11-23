const GAME_DURATION = 30;

let score = 0;
let timeLeft = GAME_DURATION;
let isPlaying = false;
let timerId = null;
let bestScore = Number(localStorage.getItem('clickerBestScore')) || 0;

// Створення елементів гри
const app = document.createElement('div');
app.style.cssText = 'font-family: sans-serif; max-width: 600px; margin: 40px auto; text-align: center;';

const hud = document.createElement('div');
hud.style.cssText = 'display: flex; justify-content: space-around; font-size: 20px; margin-bottom: 12px;';

const scoreEl = document.createElement('span');
const timeEl = document.createElement('span');
const bestEl = document.createElement('span');

const board = document.createElement('div');
board.style.cssText = 'position: relative; width: 600px; height: 400px; border: 2px solid #333; background: #181818; color: #fff; overflow: hidden;';

const statusEl = document.createElement('div');
statusEl.style.cssText = 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; pointer-events: none;';

const target = document.createElement('button');
target.type = 'button';
target.style.cssText = 'position: absolute; width: 48px; height: 48px; border-radius: 50%; border: none; background: #ff4d4d; cursor: pointer; display: none;';

hud.append(scoreEl, timeEl, bestEl);
board.append(statusEl, target);
app.append(hud, board);
document.body.append(app);

function renderStats() {
  scoreEl.textContent = `Бали: ${score}`;
  timeEl.textContent = `Час: ${timeLeft} с`;
  bestEl.textContent = `Рекорд: ${bestScore}`;
}

function moveTarget() {
  const maxX = board.clientWidth - target.offsetWidth;
  const maxY = board.clientHeight - target.offsetHeight;
  target.style.left = `${Math.floor(Math.random() * maxX)}px`;
  target.style.top = `${Math.floor(Math.random() * maxY)}px`;
}

function startGame() {
  isPlaying = true;
  score = 0;
  timeLeft = GAME_DURATION;
  statusEl.textContent = '';
  target.style.display = 'block';
  renderStats();
  moveTarget();

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    renderStats();
    if (timeLeft <= 0) {
      stopGame('Час вийшов!');
    }
  }, 1000);
}

function stopGame(message = 'Гру зупинено') {
  isPlaying = false;
  clearInterval(timerId);
  target.style.display = 'none';

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('clickerBestScore', String(bestScore));
  }

  renderStats();
  statusEl.textContent = `${message} Результат: ${score}. Натисніть Пробіл для старту.`;
}

target.addEventListener('click', () => {
  if (!isPlaying) return;
  score += 1;
  renderStats();
  moveTarget();
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (isPlaying) {
      stopGame('Гру зупинено');
    } else {
      startGame();
    }
  }
});

renderStats();
statusEl.textContent = 'Натисніть Пробіл, щоб почати гру';