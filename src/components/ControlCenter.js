import React, { useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react"
import "./styles.css"
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styled from "styled-components";
import { IconContext } from "react-icons/lib";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Nav = styled.div`
  background: white;
  height: 30px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
 
const ControlNav = styled.nav`
  background: white;
  width: 200px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 4;
  left: ${({ control }) => (control ? "1" : "-100%")};
  z-index: 10;
`;
 
const ControlWrap = styled.div`
  width: 100%;
`;

const ControlCenter = ({ list }) => {
    const [data, setData] = useState(list);
    const [xAxisParam, setXAxisParam] = useState("");
    const [columnOptions, setColumnOptions] = useState([]);
    const [yAxisParams, setYAxisParams] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [showxAxis, setShowxAxis] = useState(false);
    const [sortedData, setSortedData] = useState({});
    const [interval, setInterval] = useState("");
    const [chartId, setChartId] = useState(1);
    const [chartIdList, setChartIdList] = useState([1]);
    const [charts, setCharts] = useState([]);
    const [dataProcessed, setDataProcessed] = useState(false);
    const [layouts, setLayouts] = useState({ lg: [] });
    const [control, setControl] = useState(false);
    const showControl = () => setControl(!control);

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
      let timeoutId;

      const handleSortData = () => {
        sortData(xAxisParam, yAxisParams.filter(param => param !== undefined), type, interval);
        clearTimeout(timeoutId);
      };

      timeoutId = setTimeout(handleSortData, 3000);

      return () => clearTimeout(timeoutId);
    }, [xAxisParam, yAxisParams, type, interval]);
    
        const counter = new Worker(new URL("../longProcesses/sortDataWorker.js", import.meta.url));
        
        const sortData = useCallback((xAxisParam, yAxisParams, type, interval) => {
            counter.postMessage({ xAxisParam, yAxisParams, type, interval });
        
            counter.onmessage = (event) => {
            const sortedData = event.data;
        
            setSortedData(sortedData);
            if (type === "pie") {
              setDataProcessed(true);
            } else if (sortedData.yAxisData && yAxisParams.length === sortedData.yAxisData[0].length) {
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
          if (value !== undefined) {
            updatedParams[index] = value 
          } 
          return updatedParams //.filter((param) => param !== undefined);
        });
      };
    
      const handleIntervalChange = (value) => {
        setInterval(value);
      };

      // Function to handle layout change
      const handleLayoutChange = (newLayout) => {
        setLayouts((prevLayouts) => ({ ...prevLayouts, lg: newLayout }));
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
        setDataProcessed(false);
      };

      const handleTypeChange = (selectedType) => {
        
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
        <div className='box-container'>
        <IconContext.Provider value={{ color: "black" }}>
        <Nav>
          
            <FaIcons.FaBars onClick={showControl} />
          
       </Nav>
       <ControlNav control={control}>
          <ControlWrap>       
              <AiIcons.AiOutlineClose onClick={showControl} />          
        <label htmlFor="type">Chart Type</label>
          <div className="icon-container">
          <div className={`chart-icon ${type === "line" ? "active" : ""}`} onClick={() => handleTypeChange("line")}>
          <input type="checkbox" checked={type === "line"} onChange={() => handleTypeChange("line")}/>
            Line 
          </div>
          <div className={`chart-icon ${type === "bar" ? "active" : ""}`} onClick={() => handleTypeChange("bar")}>
          <input type="checkbox" checked={type === "bar"} onChange={() => handleTypeChange("bar")}/>
            Bar
          </div>
          <div className={`chart-icon ${type === "pie" ? "active" : ""}`} onClick={() => handleTypeChange("pie")}>
          <input type="checkbox" checked={type === "pie"} onChange={() => handleTypeChange("pie")}/>
            Pie
          </div>
      </div>
    
            {showxAxis && (
              <>
                <label htmlFor="xAxisParam">X-Axis:</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${xAxisParam === column ? "active" : ""}`} onClick={() => handleXAxisChange(column)}>
                      <input type="checkbox" checked={xAxisParam === column} onChange={() => handleXAxisChange(column)}/>
                      {column}
                    </div>
                  ))}
                </div>
              </>
            )}
          
          {xAxisParam === "datetime" && (
            <>
              <label>Interval:</label>
              <div className="icon-container">
              <div className={`chart-icon ${interval === "daily" ? "active" : ""}`} onClick={() => handleIntervalChange("daily")}>
                <input type="checkbox" checked={interval === "daily"} onChange={() => handleIntervalChange("daily")}/>
                  Daily
              </div>
              <div className={`chart-icon ${interval === "monthly" ? "active" : ""}`} onClick={() => handleIntervalChange("monthly")}>
                <input type="checkbox" checked={interval === "monthly"} onChange={() => handleIntervalChange("monthly")}/>
                  Monthly
              </div>
              <div className={`chart-icon ${interval === "yearly" ? "active" : ""}`} onClick={() => handleIntervalChange("yearly")}>
                <input type="checkbox" checked={interval === "yearly"} onChange={() => handleIntervalChange("yearly")}/>
                  Yearly
              </div>
              </div>
            </>
          )}
          
              <>
                <label htmlFor="yAxisParams">Series</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${yAxisParams[index] === column ? "active" : ""}`} onClick={() => handleYAxisChange(column, index)}>
                      <input type="checkbox" checked={yAxisParams[index] === column} onChange={() => handleYAxisChange(column, index)}/>
                      {column}
                    </div>
                  ))}
                </div>
              </> 
    
            <button onClick={handleChartIdChange}>Add Chart</button>     

            <label htmlFor="chartId">Chart ID:</label>
            <select id="chartId">
              {chartIdList.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          
          {dataProcessed && (
          <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
            Data processed...
          </div>
          )}
        </ControlWrap>
        </ControlNav>
      </IconContext.Provider>
         
          <ResponsiveGridLayout
            className="layout"
            layouts={{ layouts }} // Initial layout based on the 'lg' breakpoint
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={1200} // Width of the grid container
            onLayoutChange={handleLayoutChange}
            draggableHandle=".chart-wrapper" // Specify the handle element for dragging
            draggableCancel=".disable-drag"
          >
          {charts.map((chart) => (
            <div
            key={chart.chartId}
            className="chart-wrapper"
            data-grid={{ w: 6, h: 1, x: 0, y: 0 }}
            >
          <Chart
            // generateChart={generateChart}
            key={chart.chartId}
            chartId={chart.chartId}
            sortedData={chart.sortedData}
            xAxisParam={chart.xAxisParam}
            yAxisParam={chart.yAxisParam.filter(param => param !== undefined)}
            title={chart.title}
            type={chart.type}
          />
        </div>
        ))}
      </ResponsiveGridLayout>
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
    console.log('yAxisParam:', yAxisParam)
  
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
            show: true,
            formatter: '{b} :{d}%',
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
      legend: {
        show: type === "pie" ? false : true,
      },
      tooltip: {
        show: type === "pie" ? true : false,
        trigger: type === "pie" ? 'item' : 'none',
        formatter: '{b} : {c} ({d}%)'
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
        <ReactEcharts 
          option={getOptions()} 
          style={{ height: "100%", width: "100%" }} 
          chartId={chartId}
        />
        {/* <div>Chart ID: {chartId}</div> */}
      </>
    );
};

export { ControlCenter, Chart };


