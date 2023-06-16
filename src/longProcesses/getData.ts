/* eslint-disable no-restricted-globals */
import { GetDataType, listPageSize, ProfileListType } from "../App";
// import { profiles } from "../data";
import axios from "axios";
import { processList } from "./enums";

self.onmessage = (e: MessageEvent<string>) => {
  const data = JSON.parse(e.data) as GetDataType;

  if (data.action !== processList.getData) {
    return;
  }
  if (data.period === "initial") {
    axios
      .get("http://localhost:5000")  //, { params: { page: data.thePageNumber } })
      .then((response) => {
        const items = response.data;
        console.log("List:", items); // Print the list

        // const totalPages = Math.ceil(items.length / listPageSize);

        const profileList: ProfileListType = {
          loading: false,
          list: items, // getItemsForPage(items, data.thePageNumber),
          page: data.thePageNumber,
          // totalPages: totalPages,
        };

        self.postMessage(JSON.stringify(profileList));
      })
      .catch((error) => {
        console.error(error);
        self.postMessage(JSON.stringify({ loading: false, list: [], page: 1 }));
      });
  }

  if (
    data.period === "pageNumber" ||
    data.period === "next" ||
    data.period === "prev"
  ) {
    axios
      .get("http://localhost:5000", { params: { page: data.thePageNumber } })
      .then((response) => {
        // console.log("File is compressed:", response.headers["content-encoding"]);
        const items = response.data;

        // const nextPageNumber =
        //   data.period === "next" ? data.thePageNumber + 1 : data.thePageNumber - 1;

        const profileList: ProfileListType = {
          loading: false,
          list: items, // getItemsForPage(items, nextPageNumber),
          page: data.thePageNumber,// nextPageNumber,
          //totalPages: Math.ceil(items.length / listPageSize),
        };

        self.postMessage(JSON.stringify(profileList));
      })
      .catch((error) => {
        console.error(error);
        self.postMessage(JSON.stringify({ loading: false, list: [], page: 1 }));
      });
  }
};

// function getItemsForPage(items: any[], pageNumber: number): any[] {
//   const startIndex = (pageNumber - 1) * listPageSize;
//   const endIndex = startIndex + listPageSize;
//   return items.slice(startIndex, endIndex);
// }

export {};