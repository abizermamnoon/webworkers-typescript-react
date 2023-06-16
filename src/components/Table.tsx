import React from "react";
import { ProfileType } from "../App";
import { CrimeEnum } from "../longProcesses/enums";

type Props = {
  list: Array<ProfileType>;
};

const Table = ({ list }: Props) => {
  console.log("list:", list);
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{CrimeEnum.primary_type}</th>
            <th>{CrimeEnum.location}</th>
            <th>{CrimeEnum.Arrest}</th>
            <th>{CrimeEnum.Domestic}</th>
            <th>{CrimeEnum.Beat}</th>
            <th>{CrimeEnum.Year}</th>
            <th>{CrimeEnum.Latitude}</th>
            <th>{CrimeEnum.Longitude}</th>
            <th>{CrimeEnum.date}</th>
            <th>{CrimeEnum.time}</th>
            <th>{CrimeEnum.number}</th>
            <th>{CrimeEnum.district}</th>
            <th>{CrimeEnum.area}</th>
            <th>{CrimeEnum.code}</th>
            <th>{CrimeEnum.value}</th>
            <th>{CrimeEnum.index}</th>
          </tr>
        </thead>
        <tbody>          
          {list.length > 0 &&
            list.map((item, index: number) => {
              return (
                <tr key={item?.index}>
                  <td>{index + 1}</td>
                  <td>{item?.primary_type}</td>
                  <td>{item?.location}</td>
                  <td>{item?.Arrest}</td>
                  <td>{item?.Domestic}</td>
                  <td>{item?.Beat}</td>
                  <td>{item?.Year}</td>
                  <td>{item?.Latitude}</td>
                  <td>{item?.Longitude}</td>
                  <td>{item?.date}</td>
                  <td>{item?.time}</td>
                  <td>{item?.number}</td>
                  <td>{item?.district}</td>
                  <td>{item?.area}</td>
                  <td>{item?.code}</td>
                  <td>{item?.value}</td>
                  <td>{item?.index}</td>

                  
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
