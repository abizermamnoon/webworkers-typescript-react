/* eslint-disable no-restricted-globals */
import axios from "axios";
import { processList } from "./enums";

self.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.action !== processList.getData) {
    return;
  }

  if (data.period === "initial") {
    axios
      .get("http://localhost:5000")
      .then((response) => {
        console.log("Response received:", response);
        const items = response.data
        console.log("List:", items); // Print the list

      const profileList = {
        loading: false,
        list: items,
        page: data.thePageNumber,
      };

      self.postMessage(JSON.stringify(profileList));
    })
    .catch((error) => {
      console.error(error);
      self.postMessage(
        JSON.stringify({ loading: false, list: [], page: 1 })
      );
    });
}
};

export {};