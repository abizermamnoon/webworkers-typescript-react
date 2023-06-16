import React, { useEffect, useMemo, useState } from "react";
import Loader from "./components/Loader";
import Pagination from "./components/Pagination";
import Table from "./components/Table";
import Line from "./components/LineChart";
import { processList } from "./longProcesses/enums";

type LengthCountType = {
  loading: boolean;
  value: number;
};

export type ProfileType = {
  primary_type: string;
  location: string;
  Arrest: number,
  Domestic: number,
  Beat: number,
  Year: number,
  Latitude: number,
  Longitude: number,
  date: string,
  time: string,
  number: number,
  district: number,
  area: number,
  code: number,
  value: number,
  index: number,
};

export type ProfileListType = {
  loading: boolean;
  list: unknown & Array<ProfileType>;
  page: number;
  // totalPages: number;
};

export type GetDataType = {
  action: string;
  period: "initial" | "next" | "prev" | "pageNumber";
  thePageNumber: number;
};

export const listPageSize = 10000;

const App = () => {
  const counter: Worker = useMemo(
    () => new Worker(new URL("./longProcesses/count.ts", import.meta.url)),
    []
  );
  const getData: Worker = useMemo(
    () => new Worker(new URL("./longProcesses/getData.ts", import.meta.url)),
    []
  );

  const [lengthCount, setLengthCount] = useState<LengthCountType>({
    loading: true,
    value: 0,
  });
  const [profileList, setProfileList] = useState<ProfileListType>({
    loading: true,
    list: [],
    page: 1,
    // totalPages: 0,
  });

  const handlePageNumber = (userSelectedPage: number) => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "pageNumber",
        thePageNumber: userSelectedPage,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };
  const prevHandler = (userSelectedPage: number) => {
    if (profileList.page === 1) {
      return;
    }

    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "prev",
        thePageNumber: userSelectedPage - 1,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
  };
  const nextHandler = (userSelectedPage: number, thePageLength: number) => {
    if (userSelectedPage < thePageLength) {
      if (window.Worker) {
        const request = {
          action: processList.getData,
          period: "next",
          thePageNumber: userSelectedPage + 1,
        } as GetDataType;

        getData.postMessage(JSON.stringify(request));
      }
    }
  };

  useEffect(() => {
    if (window.Worker) {
      counter.postMessage(processList.count);
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      counter.onmessage = (e: MessageEvent<string>) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };
    }
  }, [counter]);

  useEffect(() => {
    if (window.Worker) {
      const request = {
        action: processList.getData,
        period: "initial",
        thePageNumber: profileList.page,
      } as GetDataType;

      getData.postMessage(JSON.stringify(request));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.Worker) {
      getData.onmessage = (e: MessageEvent<string>) => {
        const response = JSON.parse(e.data) as unknown as ProfileListType;
        console.log({ response });

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
    }
  }, [getData]);

  return (
    <main className="main-container">
      <section className="count">
        Total count of Profiles is{" "}
        <b>{lengthCount.loading ? <Loader size={14} /> : lengthCount.value}</b>
      </section>
      <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <Line list={profileList.list} />
            {/* <Pagination
              page={profileList.page}
              pages=  {Math.ceil(lengthCount.value / listPageSize)} // {lengthCount.value / listPageSize} 
              
              pageClick={(pageNumber) => {
                handlePageNumber(pageNumber);
              }}
              
              prevHandler={() => prevHandler(profileList.page)}
              nextHandler={() => nextHandler(profileList.page, Math.ceil(lengthCount.value / listPageSize))}

            />
            {console.log('pages:', lengthCount.value / listPageSize)} */}
          </>
        )}
      </section>
    </main>
  );
};

export default App;
