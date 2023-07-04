/* eslint-disable no-restricted-globals */
// getTable.js
import axios from "axios";

self.addEventListener("message", event => {
    console.log("Web worker initiated");
    const data = event.data;
  
    fetch("http://localhost:5000/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: data })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Data received from backend:", data); // Print statement for received data
        self.postMessage(data);
      })
      .catch(error => {
        console.log("Error occurred:", error); // Print statement for error
        self.postMessage({ error: error.message });
      });
  });
  
export {};