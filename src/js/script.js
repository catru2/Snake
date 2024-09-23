  const board = document.getElementById('game-board');
  const instructionText = document.getElementById('instruction-text');
  const logo = document.getElementById('logo');
  const score = document.getElementById('score');
  const highScoreText = document.getElementById('highScore');

  const gridSize = 20;
  let snake = [{ x: 10, y: 10 }];
  let food = {};
  let highScore = 0;
  let direction = 'right';
  let gameSpeedDelay = 200;
  let gameStarted = false;
  let isDead = false;
  let gameInterval;
  let gameCounter = 0;
  let isProcessingFood = false;

  const snakeWorker = new Worker('./src/js/workers/snakeWorker.js');
  const foodWorker = new Worker('./src/js/workers/foodWorker.js');
  let counterWorker = new Worker('./src/js/workers/counterWorker.js');

  snakeWorker.onmessage = (e) => {
    if (!isDead) {   
      snake.unshift(e.data);
      snake.pop();
      draw();
    }
  };

  foodWorker.onmessage = (e) => {
    if (gameStarted) {
      food = e.data;
      drawFood();
      isProcessingFood = false;
    }
  };

  counterWorker.onmessage = (e) => {
    gameCounter = e.data;
    score.textContent = gameCounter.toString().padStart(3, '0');
  };

  const createGameElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  };

  const setPosition = (element, position) => {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
  };

  const draw = () => {
    board.innerHTML = '';
    drawSnake();
    drawFood();
    updateScore();
  };

  const drawSnake = () => {
    snake.forEach((segment) => {
      const snakeElement = createGameElement('div', 'snake');
      setPosition(snakeElement, segment);
      board.appendChild(snakeElement);
    });
  };

  const drawFood = () => {
    if (gameStarted) {
      const foodElement = createGameElement('div', 'food');
      setPosition(foodElement, food);
      board.appendChild(foodElement);
    }
  };

  const move = () => {
    if (!isDead) {
      snakeWorker.postMessage({ direction, snake });
    }
  };

  const checkCollision = () => {
    const head = snake[0];

    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
      resetGame();
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        resetGame();
      }
    }

    if (head.x === food.x && head.y === food.y) {
      snake.push({ ...snake[snake.length - 1] });
      counterWorker.postMessage('increment');
      increaseSpeed();
      draw(); 

      if (!isProcessingFood) {
        foodWorker.postMessage({}); 
        isProcessingFood = true;
      }

      restartGameInterval();
    }
  };

  const increaseSpeed = () => {
    if (gameSpeedDelay > 150) gameSpeedDelay -= 5;
    else if (gameSpeedDelay > 100) gameSpeedDelay -= 3;
    else if (gameSpeedDelay > 50) gameSpeedDelay -= 2;
    else if (gameSpeedDelay > 25) gameSpeedDelay -= 1;
  };

  const restartGameInterval = () => {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      move();
      checkCollision();
      draw();
    }, gameSpeedDelay);
  };

  const startGame = () => {
    isDead = false;
    gameStarted = true;
    instructionText.style.display = 'none';
    logo.style.display = 'none';

    counterWorker.postMessage({});
    foodWorker.postMessage({});
    isProcessingFood = true;

    restartGameInterval();
  };

  const resetGame = () => {
    isDead = true;
    updateHighScore();
    stopGame();

    snake = [{ x: 10, y: 10 }];
    board.innerHTML = '';
    foodWorker.postMessage({});
    direction = 'right';
    gameSpeedDelay = 200;
    isProcessingFood = true;

    stopCounter();
    updateScore();
  };

  const stopGame = () => {
    clearInterval(gameInterval);
    stopCounter();
    gameStarted = false;

    board.innerHTML = '';
    instructionText.style.display = 'block';
    logo.style.display = 'block';
  };

  const handleKeyPress = (event) => {
    if (!gameStarted && (event.code === 'Space' || event.key === ' ')) {
      startGame();
    } else if (gameStarted && !isDead) {
      switch (event.key) {
        case 'ArrowUp':
          if (direction !== 'down') direction = 'up';
          break;
        case 'ArrowDown':
          if (direction !== 'up') direction = 'down';
          break;
        case 'ArrowLeft':
          if (direction !== 'right') direction = 'left';
          break;
        case 'ArrowRight':
          if (direction !== 'left') direction = 'right';
          break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyPress);

  const stopCounter = () => {
    counterWorker.terminate();
    counterWorker = new Worker('./src/js/workers/counterWorker.js');
    counterWorker.onmessage = (e) => {
      gameCounter = e.data;
      score.textContent = gameCounter.toString().padStart(3, '0');
    };
  };

  const updateScore = () => {
    const currentScore = snake.length - 1;
    score.textContent = currentScore.toString().padStart(3, '0');
  };

  const updateHighScore = () => {
    const currentScore = snake.length - 1;
    if (currentScore > highScore) {
      highScore = currentScore;
      highScoreText.textContent = highScore.toString().padStart(3, '0');
    }
    highScoreText.style.display = 'block';
  };