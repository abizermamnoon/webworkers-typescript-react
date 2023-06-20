/* eslint-disable no-restricted-globals */
// import { profiles } from "../data";
import { processList } from "./enums";
import axios from 'axios';
import React, { useEffect, useState } from "react";

self.onmessage = (e) => {
  if (e.data === processList.count) {
    // Fetch data from the backend
    axios.get("http://localhost:5000") // Replace with your backend API endpoint
      .then(response => {
        const ordersData = response.data;
        const findLength = ordersData.length;
        self.postMessage(findLength);
      })
      .catch(error => {
        console.error(error);
      });
  }
};

export {};