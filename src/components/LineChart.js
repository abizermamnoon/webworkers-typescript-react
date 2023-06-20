import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react"
import { ProfileType } from "../App";
// import { CrimeEnum } from "../longProcesses/enums";
import "./styles.css"

// type Props = {
//     list: Array<ProfileType>;
//   };

const LineChart = ({ list }) => {
  const [data, setData] = useState(list);
  const [xAxisParam, setXAxisParam] = useState("");
  const [columnOptions, setColumnOptions] = useState([]);
  const [yAxisParams, setYAxisParams] = useState([]);
  const [smooth, setSmooth] = useState([]);
  const [stack, setStack] = useState("");
  const [areaStyle, setAreaStyle] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [showSmooth, setShowSmooth] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const [showxAxis, setShowxAxis] = useState(false);
  const [xAxisType, setXAxisType] = useState("");
  const [hideControls, setHideControls] = useState(false);
  const [sortedData, setSortedData] = useState({});
  const [seriesCount, setSeriesCount] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [groupEnabled, setGroupEnabled] = useState(false);

  useEffect(() => {
    const ordersData = list;
    setData(ordersData);

    // Extract column names from the orders data
    if (ordersData.length > 0) {
      const columns = Object.keys(ordersData[0]);
      setColumnOptions(columns);
      setXAxisParam(""); // Set default x-axis parameter as blank
      sortData(ordersData, "");
    }
  }, [list]);

  useEffect(() => {
    sortData(data, xAxisParam, yAxisParams);
  }, [data, xAxisParam, yAxisParams]);

  const sortData = (data, xAxisParam, yAxisParams) => {
    if (!yAxisParams || yAxisParams.length === 0) {
      return; // Exit early if yAxisParams is undefined or empty
    }
    if (type === "pie") {
      const groupedData = {};
    data.forEach((entry, index) => {
      const groupKey = entry[yAxisParams];
  
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {};
        yAxisParams.forEach(yAxisParam => {
          groupedData[groupKey][yAxisParam] = 0;
        });
      }
  
      yAxisParams.forEach(yAxisParam => {
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
  
    setSortedData({ xAxisData, yAxisData });
  }
    else if (groupEnabled) {
    const groupedData = {};
    data.forEach(entry => {
      const groupKey = entry[xAxisParam];
  
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {};
        yAxisParams.forEach(yAxisParam => {
          groupedData[groupKey][yAxisParam] = 0;
        });
      }
  
      yAxisParams.forEach(yAxisParam => {
        groupedData[groupKey][yAxisParam] += entry[yAxisParam];
      });
    });
  
    const sorted = Object.entries(groupedData).sort((a, b) => a[0] - b[0]);
    const xAxisData = sorted.map(([key]) => key);
    const yAxisData = sorted.map(([key, value]) => {
      const data = [];
  
      yAxisParams.forEach(yAxisParam => {
        data.push(value[yAxisParam]);
      });
  
      return data;
    });
  
    setSortedData({ xAxisData, yAxisData });
  } else{
    const sorted = data
      .filter((entry, index) => index % 10 === 0)
      .sort((a, b) => a[xAxisParam] - b[xAxisParam]);
      const xAxisData = sorted.map((entry) => entry[xAxisParam]);
      const yAxisData = sorted.map((entry) => {
        const data = [];
    
        yAxisParams.forEach(yAxisParam => {
          data.push(entry[yAxisParam]);
        });
    
        return data;
      });
    
      setSortedData({ xAxisData, yAxisData });
  }
  };

  useEffect(() => {
    console.log('sorted data:', sortedData);
  }, [sortedData]);

  const getOptions = () => {
    if (!sortedData || !sortedData.yAxisData) {
      return {}; // Exit early if sortedData or yAxisParams is not available
    }
  
    const xAxisData = sortedData.xAxisData;
    const yAxisData = sortedData.yAxisData;
  
    let series = [];
    let legendData = [];
  
    if (type === "pie") {
      series = [
        {
          name: "Group Size",
          data: yAxisData.map((data, index) => ({
            name: xAxisData[index],
            value: data.reduce((acc, value) => acc + value, 0),
          })),
          type: "pie",
          radius: "50%", // Set the radius of the pie chart
          label: {
            show: false
          },
        },
      ];
    } else {
      yAxisParams.forEach((yAxisParam, i) => {
        series.push({
          name: yAxisParam,
          data: yAxisData.map((data) => data[i]),
          type: type,
          smooth: smooth[0] || false,
          stack: stack,
          areaStyle: {
            opacity: areaStyle ? 0.7 : 0,
          },
        });
        legendData.push(yAxisParam);
      });
    }
  
    return {
      title: {
        text: title,
      },
      legend: {
        show: true
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      xAxis: {
        show: type === "pie" ? false : true,
        type: "category",
        data: type === "pie" ? [] : xAxisData,
        axisTick: {
          show: true,
        },
      },
      yAxis: {
        type: "value",
      },
      toolbox: {
        feature: {
          saveAsImage: {
            type: "canvas",
          },
          dataZoom: {
            yAxisIndex: "none",
          },
          restore: {},
        },
      },
      series: series,
    };
  };

  useEffect(() => {
    setShowLegend(yAxisParams.length > 0);
  }, [yAxisParams]);

  const handleXAxisChange = (value) => {
    setXAxisParam(value);
  };

  const handleYAxisChange = (value, index) => {
    setYAxisParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = value;
      return updatedParams;
    });
  };

  const handleHideControls = () => {
    setHideControls(true);
  };

  const handleUnhideControls = () => {
    setHideControls(false);
  };

  const handleSmooth = (seriesIndex, e) => {
    const newSmooth = [...smooth];
    newSmooth[seriesIndex] = e.target.value === "true";
    setSmooth(newSmooth);
  };

  const handleStackChange = (value) => {
    setStack(value);
  };

  const handleXAxisType = (e) => {
    setXAxisType(e.target.value);
  };

  const handleAreaStyleChange = (value) => {
    setAreaStyle(value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSeriesCount = (value) => {
    setSeriesCount(value);
  };

  const handleAddSeries = () => {
    setSeriesCount((prevCount) => prevCount + 1);
  };

  const handleRemoveSeries = () => {
    if (seriesCount > 1) {
      setSeriesCount((prevCount) => prevCount - 1);
    }
  };

  const handleTypeChange = (event) => {
    const selectedType = event.target.value;
    setType(selectedType);

    if (selectedType === "line") {
      setShowSmooth(true);
      setShowStack(true);
      setShowxAxis(true);
    } else if (selectedType === "bar") {
      setShowSmooth(false);
      setShowStack(true);
      setShowxAxis(true);
    } else if (selectedType === "pie") {
      setShowSmooth(false);
      setShowStack(false);
      setShowxAxis(false);
    } else {
      setShowSmooth(false);
      setShowStack(false);
      setShowxAxis(false);
    }
  };

  return (
    <div className="box-container">
      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        <label htmlFor="type">Chart Type:</label>
        <select
          id="type"
          value={type}
          onChange={handleTypeChange}
          style={{ width: "200px" }}
        >
          <option value="">Blank</option>
          <option value="line">line</option>
          <option value="bar">bar</option>
          <option value="pie">pie</option>
        </select>
      </div>

      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        <label htmlFor="title">Chart Title:</label>
        <input
          id="title"
          value={title}
          onChange={handleTitleChange}
          style={{ width: "200px" }}
        />
      </div>

      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        {showxAxis && (
          <>
            <label htmlFor="xAxisParam">X-Axis:</label>
            <select
              onChange={(e) => handleXAxisChange(e.target.value)}
            >
              <option>Blank</option>
              {columnOptions.map((column, index) => (
                <option key={index} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        <label htmlFor="groupCheckbox">Group by:</label>
        <input
          id="groupCheckbox"
          type="checkbox"
          checked={groupEnabled}
          onChange={(e) => setGroupEnabled(e.target.checked)}
        />
      </div>

      <div className="box-chart">
        {Array.from({ length: seriesCount }, (_, index) => index).map(
          (index) => (
            <div className="column-options" key={index}>
              <label>Series {index + 1}:</label>
              <select
                onChange={(e) => handleYAxisChange(e.target.value, index)}
              >
                <option>Blank</option>
                {columnOptions.map((column, index) => (
                  <option key={index} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )
        )}
      </div>

      <div className="box-chart">
        <label>Series Count:</label>
        <button onClick={handleRemoveSeries}>-</button>
        <span>{seriesCount}</span>
        <button onClick={handleAddSeries}>+</button>
      </div>

      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        {showStack && (
          <>
            <label htmlFor="stack">Stack:</label>
            <select
              id="stack"
              value={stack}
              onChange={handleStackChange}
              style={{ width: "200px" }}
            >
              <option value="">None</option>
              <option value="Total">Total</option>
            </select>
            <label htmlFor="areaStyle">Area Style:</label>
            <input
              id="areaStyle"
              type="checkbox"
              checked={areaStyle}
              onChange={(e) => handleAreaStyleChange(e.target.checked)}
              style={{ marginLeft: "10px" }}
            />
          </>
        )}
      </div>

      <div className={`box-chart ${hideControls ? "hide-controls" : ""}`}>
        {showSmooth && (
          <>
            <label>Smooth:</label>
            <select
              value={smooth[0] || false}
              onChange={(e) => handleSmooth(0, e)}
              style={{ marginLeft: "10px" }}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </>
        )}
      </div>

      <div>
        {hideControls ? (
          <button onClick={handleUnhideControls}>Unhide Controls</button>
        ) : (
          <button onClick={handleHideControls}>Hide Controls</button>
        )}
      </div>

      <div className="box-chart">
        <ReactEcharts option={getOptions()} style={{ height: "400px", width: "1000px" }} />
      </div>
    </div>
  );
};

export default LineChart;