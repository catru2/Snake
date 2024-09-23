onmessage = function() {
    const gridSize = 20;
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    postMessage({ x, y });
  };