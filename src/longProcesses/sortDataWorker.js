/* eslint-disable no-restricted-globals */
self.addEventListener('message', async (event) => {
    const { xAxisParam, yAxisParams, type, interval } = event.data;
    console.log('xAxisParam:', xAxisParam);
    console.log('yAxisParams:', yAxisParams);
    console.log('type:', type);
    console.log('interval:', interval);
  
    try {
      const response = await fetch('http://localhost:5000/sortData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xAxisParam, yAxisParams, type, interval }),
      });
  
      const sortedData = await response.json();
      console.log('sortedData:', sortedData);
  
      self.postMessage(sortedData);
    } catch (error) {
      self.postMessage({ error: 'An error occurred' });
    }
  });
  