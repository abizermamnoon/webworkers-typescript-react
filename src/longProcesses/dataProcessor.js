/* eslint-disable no-restricted-globals */
// dataProcessor.js

self.onmessage = function (e) {
    const { action, data: { data, xAxisParam, yAxisParams, groupEnabled, type } } = e.data;
  
    if (action === "sortData") {
  
      if (!yAxisParams || yAxisParams.length === 0) {
        return; // Exit early if yAxisParams is undefined or empty
      }
  
      let sortedData = {};
  
      if (type === "pie") {
        const groupedData = {};
        data.forEach((entry, index) => {
          const groupKey = entry[yAxisParams];
  
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {};
            yAxisParams.forEach((yAxisParam) => {
              groupedData[groupKey][yAxisParam] = 0;
            });
          }
  
          yAxisParams.forEach((yAxisParam) => {
            groupedData[groupKey][yAxisParam] += 1;
          });
        });
  
        const sorted = Object.entries(groupedData).sort((a, b) => a[0] - b[0]);
        const xAxisData = sorted.map(([key]) => key);
        const yAxisData = sorted.map(([key, value]) => {
          const data = [];
  
          yAxisParams.forEach((yAxisParam, index) => {
            data.push(value[yAxisParam]);
          });
  
          return data;
        });
  
        sortedData = { xAxisData, yAxisData };
      } else if (groupEnabled) {
        const groupedData = {};
        data.forEach((entry) => {
          const groupKey = entry[xAxisParam];
  
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {};
            yAxisParams.forEach((yAxisParam) => {
              groupedData[groupKey][yAxisParam] = 0;
            });
          }
  
          yAxisParams.forEach((yAxisParam) => {
            groupedData[groupKey][yAxisParam] += entry[yAxisParam];
          });
        });
  
        const sorted = Object.entries(groupedData).sort((a, b) => a[0] - b[0]);
        const xAxisData = sorted.map(([key]) => key);
        const yAxisData = sorted.map(([key, value]) => {
          const data = [];
  
          yAxisParams.forEach((yAxisParam) => {
            data.push(value[yAxisParam]);
          });
  
          return data;
        });
  
        sortedData = { xAxisData, yAxisData };
      } else {
        const sorted = data
        //   .filter((entry, index) => index % 10 === 0)
          .sort((a, b) => {
            const valueA = String(a[xAxisParam]);
            const valueB = String(b[xAxisParam]);
            return valueA.localeCompare(valueB);
          });
        const xAxisData = sorted.map((entry) => entry[xAxisParam]);
        const yAxisData = sorted.map((entry) => {
          const data = new Array(yAxisParams.length);
  
          yAxisParams.forEach((yAxisParam, index) => {
            data[index] = entry[yAxisParam];
          });
  
          return data;
        });
  
        sortedData = { xAxisData, yAxisData };
      }
  
      self.postMessage({ action: "dataSorted", data: sortedData });
    }
  };