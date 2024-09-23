let counter = 0;
onmessage = function(e) {
  if (e.data === 'increment') {
    counter++; 
    postMessage(counter); 
  } else if (e.data === 'reset') {
    counter = 0; 
  }
};