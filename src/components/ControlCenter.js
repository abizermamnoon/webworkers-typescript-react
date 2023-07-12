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
import { FaMinus } from 'react-icons/fa';
import * as AiIcons from "react-icons/ai";
import axios from 'axios';
import Scroll from "../container/Scroll/Scroll";
import ReactTable, { ReactTableDefaults } from "react-table";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

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
  left: ${({ control }) => (control ? "auto" : "-100%")};
  right: 0;
  top: 0;
  z-index: 10;
`;
 
const ControlWrap = styled.div`
  width: 100%;
  position: relative;
`;

const ControlCenter = ({ list }) => {
    const [data, setData] = useState(list);
    const [xAxisParam, setXAxisParam] = useState("");
    const [columnOptions, setColumnOptions] = useState([]);
    const [columnTypes, setColumnTypes] = useState([]);
    const [yAxisParams, setYAxisParams] = useState([]);
    const [type, setType] = useState("");
    const [showxAxis, setShowxAxis] = useState(false);
    const [showSeries, setShowSeries] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [sortedData, setSortedData] = useState({});
    const [interval, setInterval] = useState("");
    const [SummaryStat, setSummaryStat] = useState("");
    const [resStat, setResStat] = useState({});
    const [chartId, setChartId] = useState(1);
    const [chartIdList, setChartIdList] = useState([1]);
    const [charts, setCharts] = useState([]);
    const [dataProcessed, setDataProcessed] = useState(false);
    const [layouts, setLayouts] = useState({ lg: [] });
    const [control, setControl] = useState(false);
    const showControl = () => setControl(!control);
    const [stored, setStored] = useState({});
    const [selectedChartId, setSelectedChartId] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [SeriesOption, setSeriesOption] = useState("");
    
    useEffect(() => {
        if (list && list.length > 0) {
            const ordersData = list;
            
            setData(ordersData);
        
            // Extract column names from the orders data
            const columns = Object.keys(ordersData[0]);
            setColumnOptions(columns);
            // Retrieve column types from the server
            axios
            .post("http://localhost:5000/coltype")
            .then(response => {
              // Handle the response from the backend
              console.log("Column Types:", response.data);
              setColumnTypes(response.data);
            })
            .catch(error => {
              console.error("Error retrieving Column Types:", error);
            });

          sortData(ordersData, "");
        }
      }, [list]);
    
    useEffect(() => { 
      if (type && type !== 'table') {  
      let timeoutId;

      const handleSortData = () => {
        sortData(xAxisParam, yAxisParams.filter(param => param !== undefined), type, interval);
        clearTimeout(timeoutId);
      };

      timeoutId = setTimeout(handleSortData, 3000);

      return () => clearTimeout(timeoutId);
    }}, [xAxisParam, yAxisParams, type, interval]);
    
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

        console.log('stored:', stored);
        
      const handleXAxisChange = (value) => {
          setXAxisParam(value);
        };

      const handleSeriesOptionChange = (value) => {
        setSeriesOption(value);
      };
    
      const handleYAxisChange = (value, index) => {
        if (yAxisParams[index] === value) {
          // If the clicked chart icon is already active, make it inactive
          setYAxisParams((prevParams) => {
            const updatedParams = [...prevParams];
            updatedParams[index] = undefined; // Deselect the series option
            return updatedParams;
          });
        } else {
        setYAxisParams((prevParams) => {
          const updatedParams = [...prevParams];
          if (value !== undefined && columnTypes[value] === 'int' && (type !== 'pie')) {
            updatedParams[index] = value;
          } else if (value !== undefined && type === 'pie') { 
            updatedParams[index] = value 
          } else {
            // Show error message when the selected series column is not of type "int"
            alert("Series options must be of type float");
          }
          return updatedParams //.filter((param) => param !== undefined);
        });
      }
      };
    
      const handleIntervalChange = (value) => {
        setInterval(value);
      };

      const handleStatChange = (value) => {
        setSummaryStat(value);
        if (value) {
        axios
        .post("http://localhost:5000/summarystat", { value,  SeriesOption })
        .then(response => {
          // Handle the response from the backend
          console.log("Summary Stats:", response.data);
          setResStat(response.data)
          setDataProcessed(true)
        })
        .catch(error => {
          console.error("Error retrieving Column Types:", error);
        });
      }
      };

      useEffect(() => {
        console.log('result:', resStat);
      }, [resStat]);

      // Function to handle layout change
      const handleLayoutChange = (newLayout) => {
        setLayouts((prevLayouts) => ({ ...prevLayouts, lg: newLayout }));
      };

      const handleAddChartChange = () => {
        if (type !== 'table') {  
          const newChart = {
            chartId: chartId,
            sortedData: sortedData,
            xAxisParam: xAxisParam,
            yAxisParam: yAxisParams,
            type: type,
          };
          setStored((prevStored) => ({
            ...prevStored,
            [chartId]: {
              xAxisParam: xAxisParam,
              yAxisParams: yAxisParams,
              type: type,
              interval: interval,
            },
          }));
          setXAxisParam("");
          setYAxisParams([]);
          setType("");
          setInterval("");   
          setCharts((prevCharts) => [...prevCharts, newChart]);
          setChartId((prevId) => prevId + 1);
          setChartIdList((prevList) => [...prevList, chartId + 1]);
          setDataProcessed(false);
      } else if ( type === 'table') {
        const newChart = {
          chartId: chartId,
          resStat: resStat,
          SeriesOption: SeriesOption,
          SummaryStat: SummaryStat,
          type: type,
        };
        setStored((prevStored) => ({
          ...prevStored,
          [chartId]: {
            SeriesOption: SeriesOption,
            SummaryStat: SummaryStat,
            type: type,
          },
        }));
        setType("");
        setSeriesOption("")
        setSummaryStat("")
        setCharts((prevCharts) => [...prevCharts, newChart]);
        setChartId((prevId) => prevId + 1);
        setChartIdList((prevList) => [...prevList, chartId + 1]);
        setDataProcessed(false);
      }    
      };

      useEffect(() => {
        console.log('charts:', charts);
      }, [resStat]);

      const handleChartIdChange = (event) => {
        const selectedId = parseInt(event.target.value);
        setSelectedChartId(selectedId);
        if (stored[selectedId] && type !== 'table') {
          const { xAxisParam, yAxisParams, title, type, interval } = stored[selectedId];   
          setXAxisParam(xAxisParam);
          setYAxisParams(yAxisParams);
          setType(type);
          setInterval(interval);
        } else if (stored[selectedId] && type === 'table') {
          const { SeriesOption, SummaryStat, type } = stored[selectedId];
          setSeriesOption(SeriesOption);
          // setSummaryStat(SummaryStat);
          setType(type);
        }
      };

      const handleTypeChange = (selectedType) => {       
        setType(selectedType);   
        if (selectedType === "line") {
          setShowxAxis(true);
          setShowSeries(true);
          setShowStats(false);
        } else if (selectedType === "bar") {
          setShowxAxis(true);
          setShowSeries(true);
          setShowStats(false);
        } else if (selectedType === "pie") {
          setShowxAxis(false);
          setShowSeries(true);
          setShowStats(false);
        } else {
          setShowxAxis(false);
          setShowSeries(false)
          setShowStats(true);
        }
       
      };

      const handleSelectTable = () => {
        setShowTable(true);
      };
      
      const handleHideTable = () => {
        setShowTable(false);
      };

      const handleResetChart = () => {
        if (type !== 'table') {
          setXAxisParam("");
          setYAxisParams([]);
          setType("");
          setInterval("");
          setSelectedChartId(null)
          setDataProcessed(false);
        } else if (type === 'table') {
          setType("");
          setSeriesOption("")
          setSummaryStat("")
          setSelectedChartId(null)
          setDataProcessed(false);
        }
      };

      const handleRemoveChart = (chartId) => {
        setCharts((prevCharts) => prevCharts.filter((chart) => chart.chartId !== chartId));
        setStored((prevStored) => {
          const updatedStored = { ...prevStored };
          delete updatedStored[chartId];
          return updatedStored;
        });
        setChartIdList((prevList) => prevList.filter((id) => id !== chartId));

        setXAxisParam("");
        setYAxisParams([]);
        setType("");
        setInterval("");
        setType("");
        setSeriesOption("")
        setSummaryStat("")
        setSelectedChartId(null)
      };

      const handleUpdateChartChange = () => {
        
        handleRemoveChart(selectedChartId)

        if (type !== 'table') {
          const newChart = {
            chartId: chartId,
            sortedData: sortedData,
            xAxisParam: xAxisParam,
            yAxisParam: yAxisParams,
            type: type,
          };
      
          setCharts((prevCharts) => [...prevCharts, newChart]);
          setChartId((prevId) => prevId + 1);
          setChartIdList((prevList) => [...prevList, chartId + 1]);
          setDataProcessed(false);

          setStored((prevStored) => ({
            ...prevStored,
            [chartId]: {
              xAxisParam: xAxisParam,
              yAxisParams: yAxisParams,
              type: type,
              interval: interval,
            },
          }));

          setXAxisParam("");
          setYAxisParams([]);
          setType("");
          setInterval("");
          setSelectedChartId(null)
        } else if (type === 'table') {
          const newChart = {
            chartId: chartId,
            resStat: resStat,
            SeriesOption: SeriesOption,
            SummaryStat: SummaryStat,
            type: type,
          };
          setStored((prevStored) => ({
            ...prevStored,
            [chartId]: {
              SeriesOption: SeriesOption,
              SummaryStat: SummaryStat,
              type: type,
            },
          }));
          setType("");
          setSeriesOption("")
          setSummaryStat("")
          setCharts((prevCharts) => [...prevCharts, newChart]);
          setChartId((prevId) => prevId + 1);
          setChartIdList((prevList) => [...prevList, chartId + 1]);
          setSelectedChartId(null)
          setDataProcessed(false);
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
        <Scroll>     
        <AiIcons.AiOutlineClose onClick={showControl} style={{ position: "absolute", top: 0, right: 0 }}/>      
  
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
          <div className={`chart-icon ${type === "table" ? "active" : ""}`} onClick={() => handleTypeChange("table")}>
          <input type="checkbox" checked={type === "table"} onChange={() => handleTypeChange("table")}/>
            Table
          </div>
      </div>
    
            {showxAxis && (
              <>
                <label htmlFor="xAxisParam">X-Axis:</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${xAxisParam === column ? "active" : ""}`} onClick={() => handleXAxisChange(column)}>
                      <input type="checkbox" checked={xAxisParam === column} onChange={() => handleXAxisChange(column)}/>
                      {column} ({columnTypes[column]})
                    </div>
                  ))}
                </div>
              </>
            )}

            {showStats && (
              <>
                <label>Columns</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${SeriesOption === column ? "active" : ""}`} onClick={() => handleSeriesOptionChange(column)}>
                      <input type="checkbox" checked={SeriesOption === column} onChange={() => handleSeriesOptionChange(column)}/>
                      {column} ({columnTypes[column]})
                    </div>
                  ))}
                </div>
              </>
            )}

          {showStats && SeriesOption !== "" && ( 
            <>
            <label>Summary Stat:</label>
            <div className="icon-container">
            <div className={`chart-icon ${SummaryStat === "count" ? "active" : ""}`} onClick={() => handleStatChange("count")}>
              <input type="checkbox" checked={SummaryStat === "count"} onChange={() => handleStatChange("count")}/>
                Count
            </div>
            <div className={`chart-icon ${SummaryStat === "median" ? "active" : ""}`} onClick={() => handleStatChange("median")}>
              <input type="checkbox" checked={SummaryStat === "median"} onChange={() => handleStatChange("median")}/>
                Median
            </div>
            <div className={`chart-icon ${SummaryStat === "average" ? "active" : ""}`} onClick={() => handleStatChange("average")}>
              <input type="checkbox" checked={SummaryStat === "average"} onChange={() => handleStatChange("average")}/>
                Average
            </div>
            <div className={`chart-icon ${SummaryStat === "sum" ? "active" : ""}`} onClick={() => handleStatChange("sum")}>
              <input type="checkbox" checked={SummaryStat === "sum"} onChange={() => handleStatChange("sum")}/>
                Sum
            </div>
            <div className={`chart-icon ${SummaryStat === "unique" ? "active" : ""}`} onClick={() => handleStatChange("unique")}>
              <input type="checkbox" checked={SummaryStat === "unique"} onChange={() => handleStatChange("unique")}/>
                Unique Count
            </div>
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
          {showSeries && (
              <>
                <label htmlFor="yAxisParams">Series</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${ yAxisParams[index] === column && ((columnTypes[column] === 'int' && type !== 'pie') || yAxisParams[index] === column && type === 'pie') ? "active" : ""}`} onClick={() => handleYAxisChange(column, index)}>
                      <input type="checkbox" checked={yAxisParams[index] === column && ((type === 'pie') || yAxisParams[index] === column && (columnTypes[column] === 'int' && type !== 'pie'))} onChange={() => handleYAxisChange(column, index)} />
                      {column} ({columnTypes[column]})
                    </div>
                  ))}
                </div>
              </> 
            )}

            {dataProcessed && (
            <button onClick={handleAddChartChange}>Add Chart</button>     
            )}

            {dataProcessed && (
          <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
            Data processed...
          </div>
          )}
            
            {selectedChartId !== null && (
                <button onClick={handleUpdateChartChange}>Update Chart</button>
            )}  

            { selectedChartId !== null && (
                <button onClick={handleResetChart}>Reset</button>
            )}  
          
          {type && type !== 'table' && (
          <Popup
            trigger={<button>Show Table</button>}
            position="right center"
            modal
            nested
            open={showTable}
            onClose={handleHideTable}
          >
            {(close) => (
              <div>             
                <button onClick={close}>Close</button>               
                <Table />
                </div>                        
            )}
          </Popup>
          )}         
            </Scroll>

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
            // draggableHandle=".chart-wrapper" // Specify the handle element for dragging
            draggableCancel=".disable-drag"
          >
          {charts.map((chart) => {
            if (chart.type !== 'table') {
              return (
                <div
                  key={chart.chartId}
                  className="chart-border"
                  data-grid={{ w: 2, h: 2, x: 0, y: 0 }}
                >
                  <Chart
                    key={chart.chartId}
                    chartId={chart.chartId}
                    sortedData={chart.sortedData}
                    xAxisParam={chart.xAxisParam}
                    yAxisParam={chart.yAxisParam.filter(
                      (param) => param !== undefined && columnTypes[param] === "int"
                    )}
                    title={chart.title}
                    type={chart.type}
                    onRemoveChart={handleRemoveChart}
                    onSelectChart={setSelectedChartId} 
                    onChartID={handleChartIdChange}           
                  />
                </div>
              );
            } else {
              return (
                <div
                  key={chart.chartId}
                  className="chart-border"
                  data-grid={{ w: 1.5, h: 1, x: 0, y: 0 }}
                >
                  <SummaryStatistic
                    key={chart.chartId}
                    chartId={chart.chartId}
                    resStat={chart.resStat}
                    SeriesOption={chart.SeriesOption}
                    type={chart.type}
                    SummaryStat={chart.SummaryStat}
                    onRemoveChart={handleRemoveChart}
                    onSelectChart={setSelectedChartId} 
                    onChartID={handleChartIdChange}   
                  />
                </div>
              );
            }
          })}       
    </ResponsiveGridLayout>
    </div>
)};

const SummaryStatistic = ({
  chartId,
  resStat,
  SeriesOption,
  type,
  SummaryStat,
  onRemoveChart,
  onSelectChart,
  onChartID,

}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (SummaryStat) {
        setIsReady(true);
    }
  }, [SeriesOption, SummaryStat, resStat]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Backspace") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);

  if (!isReady ) {
    return null; // Don't render the chart if the necessary variables are not ready
  }

  const handleSelectChart = () => {
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
  };

  return (
        
    <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }}>
      {Object.entries(resStat).map(([key, value]) => (
            <div key={key} className="chart-wrapper">
              <span
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline"
                }}
              >
                {key}
              </span>
          <span style={{ fontSize: "1.2em" }}>{value}</span>
        </div>
      ))}
    </div> 
  );
}


const Chart = ({ 
  // generateChart,
  chartId,
  sortedData,
  xAxisParam,
  yAxisParam,  
  type,
  onRemoveChart,
  onSelectChart,
  onChartID,
}) => {

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
      if (yAxisParam) {
          setIsReady(true);
      }
  }, [xAxisParam, yAxisParam, sortedData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Backspace") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);


  if (!isReady ) {
      return null; // Don't render the chart if the necessary variables are not ready
  }

  const handleSelectChart = () => {
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
  };
  
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
      
       
      <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }}>
        
        <ReactEcharts 
          option={getOptions()} 
          style={{ height: "100%", width: "100%" }} 
          chartId={chartId}
        />

      </div>
      
      
    );
};

const Table = () => {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
    .post("http://localhost:5000/chartData")
    .then(response => {
      const tableData = response.data
      createTable(tableData);
      console.log('Received tableData:', tableData);
    })
    .catch(error => {
      console.error("Error retrieving Table Data:", error);
    });
  }

  const createTable = tableData => {
    console.log("Received tableData:", tableData);
    if (tableData && tableData.columns && tableData.data) {
      setColumns(tableData.columns);
      setData(tableData.data);
    } else {
        console.error("Invalid tableData format:", tableData);
    }
  };

  return (
    <div>
    
    <ReactTable
      filterable
      data={data}
      columns={columns}
      // column={columnDefaults}
      style={{
          height: "800px" // This will force the table body to overflow and scroll, since there is not enough room
      }}
      className="-striped -highlight pa3"
    />
  
   
    </div>
  );
};

export { ControlCenter, Chart, Table };


