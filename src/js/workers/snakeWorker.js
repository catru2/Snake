onmessage = function(e) {
    const direction = e.data.direction;  
    const snake = e.data.snake;  
  

    let snakeHead = { x: snake[0].x, y: snake[0].y };
  
 
    switch (direction) {
      case 'up':
        snakeHead.y--;
        break;
      case 'down':
        snakeHead.y++;
        break;
      case 'left':
        snakeHead.x--;
        break;
      case 'right':
        snakeHead.x++;
        break;
    }
  
    
    postMessage(snakeHead);
  };