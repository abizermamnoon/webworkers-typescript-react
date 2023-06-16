import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react"
import { ProfileType } from "../App";
// import { CrimeEnum } from "../longProcesses/enums";
// import "./styles.css"

type Props = {
    list: Array<ProfileType>;
  };

const Line = ({ list }: Props) => {

    const option = {
    toolbox: {
        feature: {
        saveAsImage: {
            type: 'canvas'
        }
      }
    },
    xAxis: {
        type: 'category',
        data: list.map(entry => entry.index),
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
        data: list.map(entry => entry.index),
        type: 'line'
        }
    ]
};

useEffect(() => {
    console.log("Chart rendered"); // Print statement indicating the chart is rendered
}, []);


return (
    <div style={{ width: "100%", height: "400px" }}>
    <ReactEcharts 
        option={option} 
        style={{ width: "100%", height: "400px" }} 
    />
    </div>
    );
};

export default Line;