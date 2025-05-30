const canvas = document.getElementById('game');   // grab the canvas
const context = canvas.getContext('2d');          // 2d context for drawing

// Base resolution for scaling
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

resizeCanvas();   // initial resize
window.addEventListener('resize', () => location.reload()); // reload on resize to reset

// Calculate scale factors after canvas size is set
const scaleX = canvas.width / BASE_WIDTH;
const scaleY = canvas.height / BASE_HEIGHT;
const scale = Math.min(scaleX, scaleY);

// Platform sizes and starting location
const platformWidth = 65 * scale;
const platformHeight = 20 * scale;
const platformStart = canvas.height - 50 * scale;
// movement variables
const baseSpeed = 3;
const moveSpeed = Math.min(baseSpeed * scaleX, 10);
const gravity = 0.33 * scale;
const drag = 0.3 * scale;
const bounceVelocity = -13.5 * scale;
const maxJumpHeight = (bounceVelocity * bounceVelocity) / (2 * gravity);
const maxSafePlatformGap = maxJumpHeight * 0.9;
// text variables
const fontSize = Math.floor(canvas.height * 0.3);
// status variables
let isPaused = false;
// score Variables
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let playerDir = 0;
let keydown = false;
// Platform Variables
let x;            // helper variable for platform generation
let minPlatformSpace = 15 * scale;
let maxPlatformSpace = 20 * scale;
let platforms = [{
  x: canvas.width / 2 - platformWidth / 2,
  y: platformStart
}];
// Character Variables
let doodle;     // will hold the player character object
let prevDoodleY;  // declare here but assign later after doodle is created

function drawPlatform(platform){
  context.fillStyle = platform.despawn ? 'red' : 'green';
  context.fillRect(platform.x, platform.y, platformWidth, platformHeight);
}

function handlePlatformCollision(platform) {
  if (
    doodle.dy > 0 &&
    prevDoodleY + doodle.height <= platform.y &&
    doodle.x < platform.x + platformWidth &&
    doodle.x + doodle.width > platform.x &&
    doodle.y < platform.y + platformHeight &&
    doodle.y + doodle.height > platform.y
  ) {
    doodle.y = platform.y - doodle.height;
    doodle.dy = bounceVelocity;

    if (platform.despawn) {
      platform.bounced = true;
    }
  }
}
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function togglePause() {
  isPaused = !isPaused;
  const pauseMenu = document.getElementById("pauseMenu");
  if (pauseMenu) {
    pauseMenu.style.display = isPaused ? 'block' : 'none';
  }
}

function clearGame() {
  highScore = 0;
  resetGame();
  togglePause();
}

function resetGame() {
  // Reset doodle position and velocity
  doodle.x = canvas.width / 2 - 20 * scale;
  doodle.y = platformStart - 70 * scale;
  doodle.dx = 0;
  doodle.dy = 0;
  score = 0;
  // Reset platforms array
  platforms = [{
    x: canvas.width / 2 - platformWidth / 2,
    y: platformStart
  }];
  let y = platformStart;
  minPlatformSpace = 15 * scale;
  maxPlatformSpace = 20 * scale;
  while (y > 0) {
    y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);
    x = random(25 * scale, canvas.width - 25 * scale - platformWidth);
    platforms.push({
      x,
      y,
      despawn: score > 0 && Math.random() < 0.5,
      bounced: false
    });
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function platformCreation() {
  let y = platformStart;
  while (y > 0) {
    y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);
    do {
      x = random(25 * scale, canvas.width - 25 * scale - platformWidth);
    } while (
      y > canvas.height / 2 &&
      x > canvas.width / 2 - platformWidth * 1.5 &&
      x < canvas.width / 2 + platformWidth / 2
    );
    platforms.push({
      x,
      y,
      despawn: score > 0 && Math.random() < 0.5,
      bounced: false
    });
  }
}

function CharacterCreation() {
  doodle = {
    width: 40 * scale,
    height: 60 * scale,
    x: canvas.width / 2 - 20 * scale,
    y: platformStart - 60 * scale,
    dx: 0,
    dy: 0
  };
  prevDoodleY = doodle.y;  // Initialize prevDoodleY only after doodle is defined
}

function drawCharacter(){
  context.fillStyle = 'yellow';
  context.fillRect(doodle.x, doodle.y, doodle.width, doodle.height);
}

function wrapScreenCharacter(){
  // Wrap around screen horizontally
  if (doodle.x + doodle.width < 0) doodle.x = canvas.width;
  else if (doodle.x > canvas.width) doodle.x = -doodle.width;
}

function updateScoreDisplay(){
  // Score Styles
  context.fillStyle = 'black';
  context.font = `${20 * scale}px Arial`;
  context.textAlign = 'center';
  // draw score
  context.fillText(`Score: ${score}`, 60 * scale, 30 * scale);
  context.fillText(`High Score: ${highScore}`, canvas.width - 150, 30 * scale);
}

function updateHighScore(){
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

function loop() {
  requestAnimationFrame(loop);
  if (isPaused) return;
//remove any existing info on screen
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Gravity
  doodle.dy += gravity;
  // Scroll platforms if doodle is rising above midpoint
  if (doodle.y < canvas.height / 2 && doodle.dy < 0) {
    platforms.forEach(p => p.y += -doodle.dy);
//if platforms go off the bottom of the screen
    while (platforms[platforms.length - 1].y > 0) {
      score += 10;
      platforms.push({
        x: random(25 * scale, canvas.width - 25 * scale - platformWidth),
        y: platforms[platforms.length - 1].y - (platformHeight + random(minPlatformSpace, maxPlatformSpace)),
        despawn: score > 0 && Math.random() < 0.5,
        bounced: false
      });
      minPlatformSpace += 0.1 * scale;
      maxPlatformSpace += 0.1 * scale;
      minPlatformSpace = Math.min(minPlatformSpace, maxSafePlatformGap * 0.8);
      maxPlatformSpace = Math.min(maxPlatformSpace, maxSafePlatformGap);
    }
  } else {
    doodle.y += doodle.dy;
  }

  // Apply horizontal drag
  if (!keydown) {
    if (playerDir < 0) {
      doodle.dx += drag;
      if (doodle.dx > 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    } else if (playerDir > 0) {
      doodle.dx -= drag;
      if (doodle.dx < 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    }
  }

  doodle.x += doodle.dx;

  wrapScreenCharacter();

  platforms.forEach(handlePlatformCollision);
  platforms.forEach(drawPlatform);

  drawCharacter();

  prevDoodleY = doodle.y;

  platforms = platforms.filter(p => p.y < canvas.height && !(p.despawn && p.bounced));

  if (doodle.y > canvas.height) {
    resetGame();
  }

  updateScoreDisplay();
  updateHighScore();
}
// Controls
document.addEventListener('keydown', function (e) {
  if (e.key === "ArrowLeft" || e.key === "a") {
    keydown = true;
    playerDir = -1;
    doodle.dx = -moveSpeed;
  } else if (e.key === "ArrowRight" || e.key === "d") {
    keydown = true;
    playerDir = 1;
    doodle.dx = moveSpeed;
  } else if (e.key === " " || e.key === "Spacebar") {
    doodle.dy = bounceVelocity;
  } else if (e.key === "Escape") {
    togglePause();
  }
});

// Touch support
canvas.addEventListener('touchstart', function (e) {
  keydown = true;
  const touch = e.touches[0];
  const touchX = touch.clientX;

  if (touchX < canvas.width / 2) {
    playerDir = -1;
    doodle.dx = -moveSpeed;
  } else {
    playerDir = 1;
    doodle.dx = moveSpeed;
  }
});

canvas.addEventListener('touchend', function () {
  keydown = false;
});

document.addEventListener('keyup', () => keydown = false);

// Buttons
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resumeGame').addEventListener('click', togglePause);
  document.getElementById('restartGame').addEventListener('click', () =>{ resetGame(); togglePause()});
  document.getElementById('resetGame').addEventListener('click', clearGame);
});

// Initialize game state
CharacterCreation();
resetGame();
requestAnimationFrame(loop);
