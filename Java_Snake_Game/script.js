const canvas = document.getElementById("GameCanvas");
const ctx = canvas.getContext('2d');


const gridSize = 10; 
let snake = [{x: 160, y:160 },{x: 150,y:160},{x:140, y:160}];   //starting plot points for snake
let food = {x: 420, y:220}; //initial starting point for food 
let direction = {x: gridSize, y:0}; //initial direction, since it uses gridsize, it will move right at the start 10px
let score= 0;
let gameInterval; 
let isGameOver = false; // variable used when to reset the game
let gameStarted = false; // variable used to call when to start the game

function startGame() {
    //initialize game Variables
    snake = [{x: 160, y:160 },{x: 150,y:160},{x:140, y:160}];
    food = {x: 420, y:220};
    direction = {x: gridSize, y:0};
    score = 0;
    isGameOver=false;
    gameStarted = true;
    clearInterval(gameInterval)
    gameInterval = setInterval(gameLoop, 100)  // starts the game loop

    //Remove any existing click to start Message
    drawGame()
}

function endGame() {
    clearInterval(gameInterval); // stops the game loop
    isGameOver=true;
    drawGame();
}

function changeDirection(event) {
    if (isGameOver) return;

    if (event.key === 'ArrowUp' && direction.y === 0) {
        direction = { x: 0, y: -gridSize };
    } else if (event.key === 'ArrowDown' && direction.y === 0) {
        direction = { x: 0, y: gridSize };
    } else if (event.key === 'ArrowLeft' && direction.x === 0) {
        direction = { x: -gridSize, y: 0 };
    } else if (event.key === 'ArrowRight' && direction.x === 0) { // <- Fixed this line
        direction = { x: gridSize, y: 0 };
    }
}

function detectCollision() {
    const head = snake[0];
    // detect wall collision below
    if (head.x <0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height){
        return true;
    }
    //detects self collision
    for (let i = 1; i<snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y){
            return true;
        }
    }
    return false;
}
function eatFood() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        snake.push({}) // adds a new segment to the snake
        //generate food location
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    }
}


function gameLoop() {
    if (detectCollision()) {
        endGame();
        return;
    }
    //Move the Snake
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head); // adds a new head to the snake

    eatFood();
    
    if (!isGameOver) {
        snake.pop(); //removes the last segment of the snake; if not, game over
        
    }
    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clears canvas

    //draw the snake
    snake.forEach((segment, index) => {
    if (index === 0) {
        ctx.fillStyle = 'red';
    }
    else {
        ctx.fillStyle = 'blue';
    }
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });


//make food yellow
    ctx.fillStyle= 'yellow';
    ctx.beginPath(), ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize/ 2, 0, Math.PI * 2), ctx.fill();

//draw the score
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial';
    ctx.fillText('Score: '+ score, 10, 30);

//If the game is over, show a message

if (isGameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 -85, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Score' + score, canvas.width /2 -40, canvas.height / 2 +30); //show score
    ctx.fillText('Click to Restart', canvas.width / 2 -75, canvas.height /2 + 60);
}
else if (!gameStarted){
    //shows the click to start message if the game is not started
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Click to Start', canvas.width / 2 - 85, canvas.height /2);
    }
}

window.addEventListener('keydown', changeDirection);

// Event listener for click the canvas to start or restart the game
canvas.addEventListener('click', () => {
    if (isGameOver) {
        startGame()
    }
    else if (!gameStarted){
        startGame();
    }
});


//the function that starts it all, initialize the whole thing on startup
drawGame()