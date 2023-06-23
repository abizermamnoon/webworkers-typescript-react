/* eslint-disable no-restricted-globals */
self.addEventListener('message', async (event) => {
    const { xAxisParam, yAxisParams, groupEnabled, type } = event.data;
  
    try {
      const response = await fetch('http://localhost:5000/sortData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xAxisParam, yAxisParams, groupEnabled, type }),
      });
  
      const sortedData = await response.json();
  
      self.postMessage(sortedData);
    } catch (error) {
      self.postMessage({ error: 'An error occurred' });
    }
  });
  