import React, { useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react"
import "./styles.css"
const ControlCenter = ({ list }) => {
    const [data, setData] = useState(list);
    const [xAxisParam, setXAxisParam] = useState("");
    const [columnOptions, setColumnOptions] = useState([]);
    const [yAxisParams, setYAxisParams] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [showxAxis, setShowxAxis] = useState(false);
    const [hideControls, setHideControls] = useState(false);
    const [sortedData, setSortedData] = useState({});
    const [seriesCount, setSeriesCount] = useState(1);
    const [interval, setInterval] = useState("");
    const [chartId, setChartId] = useState(1);
    const [chartIdList, setChartIdList] = useState([1]);
    const [charts, setCharts] = useState([]);
    // const [generateChart, setGenerateChart] = useState(true);
    const [shouldSortData, setShouldSortData] = useState(false);
    const [dataProcessed, setDataProcessed] = useState(false);
    useEffect(() => {
        if (list && list.length > 0) {
            const ordersData = list;
            
            setData(ordersData);
        
            // Extract column names from the orders data
            const columns = Object.keys(ordersData[0]);
            setColumnOptions(columns);
            sortData(ordersData, "");
          }
        }, [list]);
    
    useEffect(() => {   
      
        sortData(xAxisParam, yAxisParams, type, interval);
        
    }, [shouldSortData, xAxisParam, yAxisParams, type, interval]);
    
        const counter = new Worker(new URL("../longProcesses/sortDataWorker.js", import.meta.url));
        
        const sortData = useCallback((xAxisParam, yAxisParams, type, interval) => {
            counter.postMessage({ xAxisParam, yAxisParams, type, interval });
        
            counter.onmessage = (event) => {
            const sortedData = event.data;
        
            setSortedData(sortedData);
            if (sortedData.yAxisData && yAxisParams.length === sortedData.yAxisData[0].length) {
              setDataProcessed(true);
            }
            };
        }, []);
  
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
    
      const handleIntervalChange = (value) => {
        setInterval(value);
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

      const handleChartIdChange = () => {
        const newChart = {
          chartId: chartId,
          sortedData: sortedData,
          xAxisParam: xAxisParam,
          yAxisParam: yAxisParams,
          title: title,
          type: type,
        };
        setCharts((prevCharts) => [...prevCharts, newChart]);
        setChartId((prevId) => prevId + 1);
        setChartIdList((prevList) => [...prevList, chartId + 1]);
        setXAxisParam("");
        setYAxisParams([]);
        setTitle("");
        setType("");
        setInterval("");
      };

      const handleTypeChange = (event) => {
        const selectedType = event.target.value;
        setType(selectedType);
    
        if (selectedType === "line") {
          setShowxAxis(true);
        } else if (selectedType === "bar") {
          setShowxAxis(true);
        } else if (selectedType === "pie") {
          setShowxAxis(false);
        } else {
          setShowxAxis(false);
        }
       
      };
      
      return (
        <div className="box-container">
          
          <div className='box-chart'>
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
    
          <div className='box-chart'>
            <label htmlFor="title">Chart Title:</label>
            <input
              id="title"
              value={title}
              onChange={handleTitleChange}
              style={{ width: "200px" }}
            />
          </div>
    
          <div className='box-chart'>
            {showxAxis && (
              <>
                <label htmlFor="xAxisParam">X-Axis:</label>
                <select
                  onChange={(e) => handleXAxisChange(e.target.value)}
                >
                  <option key = '' value=''>Blank</option>
                  {columnOptions.map((column, index) => (
                    <option key={index} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
    
          <div className='box-chart'>
          {xAxisParam === "datetime" && (
            <>
              <label>Interval:</label>
              <select value={interval} onChange={(e) => handleIntervalChange(e.target.value)}>
              <option key = '' value=''></option>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </>
          )}
          </div>
    
        <div className="box-chart">
          {Array.from({ length: Math.ceil(seriesCount / 3) }, (_, rowIndex) => (
            <div className="row-options" key={rowIndex}>
              {Array.from({ length: 3 }, (_, colIndex) => colIndex + rowIndex * 3).map(
                (index) =>
                  index < seriesCount && (
                    <div className="column-options" key={index}>
                      <label>Series {index + 1}:</label>
                      <select
                        onChange={(e) => handleYAxisChange(e.target.value, index)}
                      >
                        <option key = '' value=''>Blank</option>
                        {columnOptions.map((column, columnIndex) => (
                          <option key={columnIndex} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
              )}
            </div>
          ))}
        </div>
    
          <div className="box-chart">
            <label>Series Count:</label>
            <button onClick={handleRemoveSeries}>-</button>
            <span>{seriesCount}</span>
            <button onClick={handleAddSeries}>+</button>
          </div>

          <div>
            <button onClick={handleChartIdChange}>Add Chart</button>     
          </div>

          <div>
            <label htmlFor="chartId">Chart ID:</label>
            <select id="chartId">
              {chartIdList.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {dataProcessed && (
          <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
            Data processed...
          </div>
)}
          {charts.map((chart) => (
          <Chart
            // generateChart={generateChart}
            key={chart.chartId}
            chartId={chart.chartId}
            sortedData={chart.sortedData}
            xAxisParam={chart.xAxisParam}
            yAxisParam={chart.yAxisParam}
            title={chart.title}
            type={chart.type}
          />
        ))}    
      </div>
    );
};

const Chart = ({ 
  // generateChart,
  chartId,
  sortedData,
  xAxisParam,
  yAxisParam,  
  title,
  type
}) => {

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
      if (yAxisParam) {
          setIsReady(true);
      }
  }, [xAxisParam, yAxisParam, sortedData]);

  if (!isReady) {
      return null; // Don't render the chart if the necessary variables are not ready
  }
  
  const getOptions = () => {
    if (!sortedData || !sortedData.yAxisData) {
      return {}; // Exit early if sortedData or yAxisParams is not available
    }
  
    const xAxisData = sortedData.xAxisData;
    const yAxisData = sortedData.yAxisData;
    console.log('xAxisData:', xAxisData)
    console.log('yAxisData:', yAxisData)
  
    let series = [];
    let legendData = [];
  
    if (type === "pie") {
      series = [
        {
          data: yAxisData.map((data, index) => ({
            name: xAxisData[index],
            value: yAxisData[index],
          })),
          type: "pie",
          radius: "50%", // Set the radius of the pie chart
          label: {
            show: true
          },
          labelLine: {
            show: true, // Show the label line
            length: 15, // Set the length of the label line
            length2: 30, // Set the second length of the label line
          },
        },
      ];
    } else {
        yAxisParam.forEach((yAxisParam, i) => {
        series.push({
          name: yAxisParam,
          data: yAxisData.map((data) => data[i]),
          type: type,
          label: {
            show: true
          },
          emphasis: {
            disabled: true
          },
          silent: true,
          animation: false,
        });
        legendData.push(yAxisParam);
      });
    }
  
    return {
      title: {
        text: title,
      },
      legend: {
        show: type === "pie" ? false : true,
      },
      tooltip: {
        show: type === "pie" ? true : false,
        trigger: type === "pie" ? 'item' : 'none',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      xAxis: {
        silent: true,
        triggerEvent: false,
        show: type === "pie" ? false : true,
        type: "category",
        data: type === "pie" ? [] : xAxisData,
        axisTick: {
          show: true,
        },
      },
      yAxis: {
        silent: true,
        type: "value",
      },
      series: series,
    };
  };
  
    return (
      <>
        <div style={{ width: "100%", height: '400px' }}>
        {/* {(
          generateChart && ( */}
              <ReactEcharts 
                option={getOptions()} 
                style={{ height: "400px", width: "100%" }} 
                chartId={chartId}
              />
          {/* )
        )} */}
        </div>
        
        <div>Chart ID: {chartId}</div>
      </>
    );
};

export { ControlCenter, Chart };


