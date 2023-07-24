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
import essos from '../themes/essos.js';
import westeros from '../themes/westeros.js'
import infographic from '../themes/infographic.js';
import shine from '../themes/shine.js';


const ResponsiveGridLayout = WidthProvider(Responsive);

const Nav = styled.div`
  background: white;
  display: flex;
  justify-content: flex-end;
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
    const [title, setTitle] = useState("");
    const [PageTitle, setPageTitle] = useState("");
    const [SubTitle, setSubTitle] = useState("");
    const [showDatetime, setShowDatetime] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [sortedData, setSortedData] = useState({});
    const [interval, setInterval] = useState("");
    const [Stack, setStack] = useState('');
    const [showStack, setShowStack] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [showInterval, setShowInterval] = useState(false);
    const [SummaryStat, setSummaryStat] = useState("");
    const [resStat, setResStat] = useState({});
    const [chartId, setChartId] = useState(1);
    const [chartIdList, setChartIdList] = useState([1]);
    const [charts, setCharts] = useState([]);
    const [dataProcessed, setDataProcessed] = useState(false);
    const [layouts, setLayouts] = useState({ lg: [] });
    const [control, setControl] = useState(true);
    const showControl = () => setControl(!control);
    const [stored, setStored] = useState({});
    const [selectedChartId, setSelectedChartId] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [SeriesOption, setSeriesOption] = useState("");
    const [columns, setColumns] = useState([]);
    const [TabData, setTabData] = useState([]);
    const [Theme, setTheme] = useState('');
    const [showTheme, setShowTheme] = useState(false);
    const [ThemeChange, setThemeChange] = useState();
    const [copiedText, setCopiedText] = useState('');
    
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

      timeoutId = setTimeout(handleSortData, 100);

      return () => clearTimeout(timeoutId);
    }}, [xAxisParam, yAxisParams, type, interval]);
    
        const counter = new Worker(new URL("../longProcesses/sortDataWorker.js", import.meta.url));
        
        const sortData = useCallback((xAxisParam, yAxisParams, type, interval) => {
            counter.postMessage({ xAxisParam, yAxisParams, type, interval });
        
            counter.onmessage = (event) => {
            const sortedData = event.data;
        
            setSortedData(sortedData);
            if (type === 'pie' || type === 'boxplot' || type === 'donut' || type === 'heatmap') {
              setDataProcessed(true);
            } else if (sortedData.yAxisData && yAxisParams.length === sortedData.yAxisData[0].length) {
              setDataProcessed(true);
            } 
          };
  
        }, []);
              
        console.log('stored:', stored);
    
        useEffect(() => {
          if (Object.keys(sortedData).length !== 0 && type === 'chartable') {
            fetchData();
          }
        }, [sortedData]);
    
      const fetchData = () => {
        axios
        .post("http://localhost:5000/chartData", {
          xAxisParam,
          yAxisParams,
          type,
          interval,
        })
        .then(response => {
          const tableData = response.data
          createTable(tableData);
          console.log('Received tableData:', tableData);
          setDataProcessed(true)
        })
        .catch(error => {
          console.error("Error retrieving Table Data:", error);
        });
      }

      const createTable = tableData => {
        console.log("Received tableData:", tableData);
        if (tableData && tableData.columns && tableData.data) {
          setColumns(tableData.columns);
          setTabData(tableData.data);
          console.log('Table has been created');
        } else {
          console.error("Invalid tableData format:", tableData);
        }
      };

      useEffect(() => {
        console.log('TabData:', TabData);
        console.log('columns:', columns);
      }, [TabData, columns]);

      const handleXAxisChange = (value) => {
          setXAxisParam(value);
          setDataProcessed(false)
          const isDatetime = columnTypes[value] === "datetime";
          setShowDatetime(isDatetime);
          if (type === 'heatmap' && columnTypes[value] !== "datetime"){
            alert("Heatmap takes only datetime values");
          }
        };

        const handleTextCopy = (text) => {
          setCopiedText(text);
        };

      const handleThemeChange = (value) => {
        setTheme(value)
        if (value === 'essos') {
          setThemeChange(essos)
        } else if (value === 'westeros') {
          setThemeChange(westeros)
        } else if (value === 'infographic') {
          setThemeChange(infographic)
        } else if (value === 'shine') {
          setThemeChange(shine)
        }
      };

      useEffect(() => {
        console.log('Theme:', Theme);
        console.log('Theme Change:', ThemeChange);
      }, [Theme, ThemeChange]);

      useEffect(() => {
        if (type === 'pie' || type === 'donut' || type === 'heatmap' || type === 'boxplot') {
          setThemeChange(ThemeChange ?? essos)
        } else if (type === 'line' || type === 'scatter'){
          setThemeChange(ThemeChange ?? westeros)
        } 
      }, [type, ThemeChange]);

      useEffect(() => {
    
        const handleClickOutsideChartContainer = (event) => {
          const chartContainer = document.querySelector('.box-container');
          if (chartContainer && !chartContainer.contains(event.target)) {
            if (selectedChartId !== null) {
              handleResetChart();
              setSelectedChartId(null);
            }
          }
        };
    
        document.addEventListener("click", handleClickOutsideChartContainer);
    
        return () => {
          document.removeEventListener("click", handleClickOutsideChartContainer);
        };
      }, [selectedChartId]);

      const handleSeriesOptionChange = (value) => {
        setSeriesOption(value);
        setDataProcessed(false)
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
          } else if (value !== undefined && type === 'pie' || value !== undefined && type === 'chartable' || value !== undefined && type === 'donut') { 
            updatedParams[index] = value 
          } else {
            // Show error message when the selected series column is not of type "int"
            alert("Series options must be of type float");
          }
          return updatedParams //.filter((param) => param !== undefined);
        });
      }
      setDataProcessed(false)
      };
    
      const handleIntervalChange = (value) => {
        setInterval(value);
        setDataProcessed(false)
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
        if (type !== 'table' && type !== 'chartable' && type !== 'textbox') {
          const newChart = {
            chartId: chartId,
            sortedData: sortedData,
            title: title,
            subtitle: SubTitle,
            xAxisParam: xAxisParam,
            yAxisParam: yAxisParams,
            type: type,
            interval: interval,
            theme: ThemeChange,
            stack: Stack,
          };
          setStored((prevStored) => ({
            ...prevStored,
            [chartId]: {
              xAxisParam: xAxisParam,
              yAxisParams: yAxisParams,
              title: title,
              subtitle: SubTitle,
              type: type,
              interval: interval,
              theme: Theme,
              stack: Stack,
            },
          }));
          setXAxisParam("");
          setYAxisParams([]);
          setType("");
          setTitle("");
          setSubTitle("")
          setInterval("");   
          setCharts((prevCharts) => [...prevCharts, newChart]);
          setChartId((prevId) => prevId + 1);
          setChartIdList((prevList) => [...prevList, chartId + 1]);
          setDataProcessed(false);
          setTheme('');
          setThemeChange();
          setStack('');
          setShowDatetime(false)
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
      } else if (type === 'chartable') {
          const newChart = {
            chartId: chartId,
            title: title,
            subtitle: SubTitle,
            TabData: TabData,
            columns: columns,
            xAxisParam: xAxisParam,
            yAxisParam: yAxisParams,
            type: type,
            interval: interval,
          };
          setStored((prevStored) => ({
            ...prevStored,
            [chartId]: {
              xAxisParam: xAxisParam,
              yAxisParams: yAxisParams,
              title: title,
              subtitle: SubTitle,
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
          setShowDatetime(false)
      } else if (type === 'textbox') {
        const newChart = {
          chartId: chartId,
          type: type,
          copiedText: copiedText,
        };
        setStored((prevStored) => ({
          ...prevStored,
          [chartId]: {
            type: type,
            copiedText: copiedText,
          },
        }));
        
        setCharts((prevCharts) => [...prevCharts, newChart]);
        setChartId((prevId) => prevId + 1);
        setChartIdList((prevList) => [...prevList, chartId + 1]); 
      }
      };

      useEffect(() => {
        console.log('charts:', charts);
      }, [resStat]);

      const handleChartIdChange = (event) => {
        const selectedId = parseInt(event.target.value);
        setSelectedChartId(selectedId);
        console.log('selectedChartID:', event)
        if (stored[selectedId]) {
          const { xAxisParam, yAxisParams, type, interval, theme, SeriesOption, fontStyle, fontSize, copiedText, stack, title, subtitle } = stored[selectedId];   
          setTitle(title)
          setSubTitle(subtitle)
          setXAxisParam(xAxisParam ?? '');
          setYAxisParams(yAxisParams ?? []);
          setType(type ?? '');
          setInterval(interval ?? '');
          setTheme(theme)
          setSeriesOption(SeriesOption ?? '');
          setCopiedText(copiedText ?? '')
          setStack(stack ?? '')
        } 
      };

      useEffect(() => {
        console.log('title:', title)
      }, [title]);
      
      useEffect(() => {
        console.log('sub title:', SubTitle)
      }, [SubTitle]);

      const handleTypeChange = (selectedType) => {       
        setType(selectedType);   
        setDataProcessed(false)
        if (selectedType === "line" || selectedType === "bar") {
          setShowxAxis(true);
          setShowSeries(true);
          setShowStats(false);
          setShowStack(true)
          setShowTheme(true)
          setShowTitle(true)
          setShowInterval(true)
        } else if (selectedType === "pie" || selectedType === "donut" || selectedType === "boxplot") {
          setShowxAxis(false);
          setShowSeries(true);
          setShowStats(false);
          setShowStack(false);
          setShowTheme(true)
          setShowTitle(true)
          setShowInterval(false)
        } else if (selectedType === "table") {
          setShowxAxis(false);
          setShowSeries(false);
          setShowStats(true);
          setShowTitle(false)
          setShowStack(false)
          setShowTheme(false)
          setShowInterval(false)
        } else if (selectedType === "chartable") {
          setShowxAxis(true);
          setShowSeries(true)
          setShowStats(false);
          setShowTable(true)
          setShowStack(false)
          setShowTheme(false)
          setShowTitle(true)
          setShowInterval(true)
        } else if (selectedType === "heatmap") {
          setShowxAxis(true);
          setShowSeries(true)
          setShowStats(false);
          setShowStack(false)
          setShowTitle(true)
          setShowTheme(true)
          setShowInterval(true)
        } else if (selectedType === "textbox") {
          setShowxAxis(false);
          setShowSeries(false);
          setShowStats(false);
          setShowStack(false)
          setShowTheme(false)
          setShowTitle(false)
          setShowInterval(false)
        } else if ( selectedType === "scatter" ) {
          setShowxAxis(true);
          setShowSeries(true);
          setShowStats(false);
          setShowStack(false)
          setShowTheme(true)
          setShowTitle(true)
          setShowInterval(true)
        }
      };

      const handleResetChart = () => {
        
          setXAxisParam("");
          setYAxisParams([]);
          setType("");
          setInterval("");
          setSelectedChartId(null)
          setDataProcessed(false);
          setTheme('');
          setSeriesOption("");
          setSummaryStat("");
        
      };

      const handleHideTable = () => {
        setShowTable(false);
      };

      const handleStackChange = (value) => {
        setStack(value);
      };

      const handlePageTitleChange = (e) => {
        setPageTitle(e.target.value);
      };

      const handleTitleChange = (e) => {
        setTitle(e.target.value);
      };

      const handleSubTitleChange = (e) => {
        setSubTitle(e.target.value);
      };

      const handleRemoveChart = (chartId) => {
        setCharts((prevCharts) => prevCharts.filter((chart) => chart.chartId !== selectedChartId));
        setStored((prevStored) => {
          const updatedStored = { ...prevStored };
          delete updatedStored[selectedChartId];
          return updatedStored;
        });
        setChartIdList((prevList) => prevList.filter((id) => id !== selectedChartId));

        setXAxisParam("");
        setYAxisParams([]);
        setType("");
        setInterval("");
        setSeriesOption("")
        setSummaryStat("")
        setTheme("")
        setSelectedChartId(null)
        setDataProcessed(false)
        setTitle("")
        setSubTitle("")
        setStack("")
      };

      const handleUpdateChartChange = async () => {
        await handleRemoveChart(selectedChartId);
        
        handleAddChartChange()
        
      };

      return (
        <>
        <Nav>
          <input
              id="PageTitle"
              value={PageTitle}
              onChange={handlePageTitleChange}   
              style={{ width: "100%", borderBottom: "1px solid black", border: "none", fontSize: "30px", fontFamily: "Helvetica, Arial, sans-serif", // Use an attractive font family
              fontWeight: "bold", // Make the text bold for emphasis
              letterSpacing: "1px", // Add slight letter spacing for a stylish look
              lineHeight: "1.2", // Adjust line height for better readability
              color: "#333"
       }} // Set the font color for better contrast}}
            />
          
            <button onClick={showControl}>Control Center</button>  
          </Nav>
        <div className='box-container' >
        
        <IconContext.Provider value={{ color: "black" }}>
       
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
          <div className={`chart-icon ${type === "scatter" ? "active" : ""}`} onClick={() => handleTypeChange("scatter")}>
          <input type="checkbox" checked={type === "scatter"} onChange={() => handleTypeChange("scatter")}/>
            Scatter
          </div>
          <div className={`chart-icon ${type === "donut" ? "active" : ""}`} onClick={() => handleTypeChange("donut")}>
          <input type="checkbox" checked={type === "donut"} onChange={() => handleTypeChange("donut")}/>
            Doughnut
          </div>
          <div className={`chart-icon ${type === "table" ? "active" : ""}`} onClick={() => handleTypeChange("table")}>
          <input type="checkbox" checked={type === "table"} onChange={() => handleTypeChange("table")}/>
            Card
          </div>
          <div className={`chart-icon ${type === "chartable" ? "active" : ""}`} onClick={() => handleTypeChange("chartable")}>
          <input type="checkbox" checked={type === "chartable"} onChange={() => handleTypeChange("chartable")}/>
            Chart Table
          </div>
          <div className={`chart-icon ${type === "boxplot" ? "active" : ""}`} onClick={() => handleTypeChange("boxplot")}>
          <input type="checkbox" checked={type === "boxplot"} onChange={() => handleTypeChange("boxplot")}/>
            Box Plot
          </div>
          <div className={`chart-icon ${type === "heatmap" ? "active" : ""}`} onClick={() => handleTypeChange("heatmap")}>
          <input type="checkbox" checked={type === "heatmap"} onChange={() => handleTypeChange("heatmap")}/>
            Heat Map
          </div>
          <div className={`chart-icon ${type === "textbox" ? "active" : ""}`} onClick={() => handleTypeChange("textbox")}>
          <input type="checkbox" checked={type === "textbox"} onChange={() => handleTypeChange("textbox")}/>
            Text Box
          </div>
      </div>

      {showTitle && (
          <>
            <label htmlFor="title">Chart Title:</label>
            <input
              id="title"
              value={title}
              onChange={handleTitleChange}
              style={{ width: "200px" }}
            />
          </>
        )}
        {showTitle && (
          <>
            <label htmlFor="title">Chart Sub Title:</label>
            <input
              id="title"
              value={SubTitle}
              onChange={handleSubTitleChange}
              style={{ width: "200px" }}
            />
          </> 
        )}

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
          
          {showDatetime && showInterval && (
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
          {showSeries && columnOptions && (
              <>
                <label htmlFor="yAxisParams">Series</label>
                <div className="icon-container">
                  {columnOptions.map((column, index) => (
                    <div key={index} className={`chart-icon ${ yAxisParams[index] === column && ((columnTypes[column] === 'int' && type !== 'pie') || yAxisParams[index] === column && type === 'pie' || yAxisParams[index] === column && type === 'chartable' || yAxisParams[index] === column && type === 'donut') ? "active" : ""}`} onClick={() => handleYAxisChange(column, index)}>
                      <input type="checkbox" checked={yAxisParams[index] === column && ((type === 'pie') || yAxisParams[index] === column && (columnTypes[column] === 'int' && type !== 'pie') || yAxisParams[index] === column && type === 'chartable' || yAxisParams[index] === column && type === 'donut')} onChange={() => handleYAxisChange(column, index)} />
                      {column} ({columnTypes[column]})
                    </div>
                  ))}
                </div>
              </> 
          )}

            {showStack && (
              <>
              <label>Stack:</label>
              <div className="icon-container">
                <div className={`chart-icon ${Stack === "Total" ? "active" : ""}`} onClick={() => handleStackChange("Total")}>
                  <input type="checkbox" checked={Stack === "Total"} onChange={() => handleStackChange("Total")}/>
                    Total
                </div>
                <div className={`chart-icon ${Stack === "" ? "active" : ""}`} onClick={() => handleStackChange("")}>
                  <input type="checkbox" checked={Stack === ""} onChange={() => handleStackChange("")}/>
                    None
                </div>
              </div>
              </>
            )}    

          {showTheme && (
          <>
          <label htmlFor="type">Theme</label>
          <div className="icon-container">
            <div className={`chart-icon ${Theme === "essos" ? "active" : ""}`} onClick={() => handleThemeChange("essos")}>
              <input type="checkbox" checked={Theme === "essos"} onChange={() => handleThemeChange("essos")}/>
              Essos 
            </div>
            <div className={`chart-icon ${Theme === "westeros" ? "active" : ""}`} onClick={() => handleThemeChange("westeros")}>
              <input type="checkbox" checked={Theme === "westeros"} onChange={() => handleThemeChange("westeros")}/>
              Westeros 
            </div>
            <div className={`chart-icon ${Theme === "infographic" ? "active" : ""}`} onClick={() => handleThemeChange("infographic")}>
              <input type="checkbox" checked={Theme === "infographic"} onChange={() => handleThemeChange("infographic")}/>
              infographic 
            </div>
            <div className={`chart-icon ${Theme === "shine" ? "active" : ""}`} onClick={() => handleThemeChange("shine")}>
              <input type="checkbox" checked={Theme === "shine"} onChange={() => handleThemeChange("shine")}/>
              Shine 
            </div>
          </div>
          </>
          )}
   
            <button onClick={handleAddChartChange}>Add Chart</button>     
           
            {dataProcessed && (
          <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
            Data processed...
          </div>
          )}
            
            {selectedChartId !== null && (
                <button onClick={handleUpdateChartChange}>Update Chart</button>
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
            if (chart.type !== 'table' && chart.type !== 'chartable' && chart.type !== 'textbox') {
              return (
                <div
                  key={chart.chartId}
                  className={`chart-border ${selectedChartId === chartId ? "selected-chart" : ""}`}
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
                    subtitle={chart.subtitle}
                    type={chart.type}
                    theme={chart.theme}
                    onRemoveChart={handleRemoveChart}
                    onSelectChart={setSelectedChartId} 
                    onChartID={handleChartIdChange} 
                    stack={chart.stack}
                    onResetChart={handleResetChart}         
                  />
                </div>
              );
            } else if (chart.type === 'table') {
              return (
                <div
                  key={chart.chartId}
                  className="stat-border"
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
                    onResetChart={handleResetChart}    
                  />
                </div>
              );
            } else if (chart.type === 'chartable') {
              return (
                <div
                  key={chart.chartId}
                  className="table-border"
                  data-grid={{ w: 2, h: 2, x: 0, y: 0 }}
                >
                  <Scroll>
                    <Table
                      key={chart.chartId}
                      chartId={chart.chartId}
                      title={chart.title}
                      subtitle={chart.subtitle}
                      TabData={chart.TabData}
                      xAxisParam={chart.xAxisParam}
                      yAxisParam={chart.yAxisParam.filter(
                        (param) => param !== undefined && columnTypes[param] === "int"
                      )}
                      columns={chart.columns}
                      type={chart.type}
                      interval={chart.interval}
                      onRemoveChart={handleRemoveChart}
                      onSelectChart={setSelectedChartId} 
                      onChartID={handleChartIdChange}
                      onResetChart={handleResetChart} 
                    />
                  </Scroll>
              </div>
            )
          } else if (chart.type === 'textbox') {
            return (
              <div
                key={chart.chartId}
                className="stat-border"
                data-grid={{ w: 1.5, h: 1, x: 0, y: 0 }}
              >
                <Text
                  key={chart.chartId}
                  chartId={chart.chartId}
                  onRemoveChart={handleRemoveChart}
                  onSelectChart={setSelectedChartId} 
                  onChartID={handleChartIdChange} 
                  onTextCopy={handleTextCopy}
                  onResetChart={handleResetChart} 
                />
              </div>
            );
          }
        })}     
    </ResponsiveGridLayout>
    </div>
    </>
)};

const Text = ({
  chartId,
  onRemoveChart,
  onSelectChart,
  onChartID,
  onTextCopy,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [Text, setText] = useState('')
  const [SubText, setSubText] = useState('')
  const [selectedChartId, setSelectedChartId] = useState(null);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onTextCopy(newText);
  };

  const handleSubTextChange = (e) => {
    const newText = e.target.value;
    setSubText(newText);
    onTextCopy(newText);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Delete") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);

  useEffect(() => {
    document.addEventListener("text", handleTextChange);
    console.log('copied text:', Text)
    return () => {
      document.removeEventListener("text", handleTextChange);
    };
  }, [chartId, onTextCopy]);

  const handleSelectChart = () => {
    setSelectedChartId((prevChartId) => (prevChartId === chartId ? null : chartId));
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
  };

  const textStyle = {
    height: "70%",
    width: "100%",
    fontWeight: "bold",
    fontSize: Text.length > 15 ? `${Math.max(30 - (Text.length - 15) * 2, 14)}px` : "30px",
    color: "black",
    whiteSpace: "pre-wrap",
    border: 'none',
  };

  const subTextStyle = {
    height: "30%",
    width: "100%",
    fontSize: SubText.length > 25 ? `${Math.max(15 - (SubText.length - 25) * 0.5, 8)}px` : "15px",
    color: "grey",
    wordWrap: "break-word",
    border: 'none',
  };


  return (
    <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }} className={`stat-border ${selectedChartId === chartId ? "selected-chart" : ""}`}>  
      <input
        id="Text"
        value={Text}
        onChange={handleTextChange}
        style={textStyle}
      />   
      <input
        id="SubText"
        value={SubText}
        onChange={handleSubTextChange}
        style={subTextStyle}
      />  
    </div>
  );
}

const SummaryStatistic = ({
  chartId,
  resStat,
  SeriesOption,
  type,
  SummaryStat,
  onRemoveChart,
  onSelectChart,
  onChartID,
  onResetChart,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState(null);

  useEffect(() => {
    if (SummaryStat) {
        setIsReady(true);
    }
  }, [SeriesOption, SummaryStat, resStat]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Delete") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);

  useEffect(() => {
    if (selectedChartId === null) {
      onResetChart();
    }
}, [selectedChartId]);

  if (!isReady ) {
    return null; // Don't render the chart if the necessary variables are not ready
  }

  const handleSelectChart = () => {
    setSelectedChartId((prevChartId) => (prevChartId === chartId ? null : chartId));
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
  };

  return (
        
    <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }} className={`stat-border ${selectedChartId === chartId ? "selected-chart" : ""}`}> 
      {Object.entries(resStat).map(([key, value]) => (
            <div key={key} className="chart-wrapper">
              <span
                style={{
                  fontSize: "0.8em", // Adjust the font size for the key (top right)
                  color: "grey", // Set the color to grey for the key (top right)
                  textAlign: "left",
                }}
              >
                {key}
              </span>
          <span style={{ fontSize: "2em", fontWeight: "bold", textAlign: "center",}}>{value}</span>
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
  onResetChart,
  theme,
  title,
  subtitle,
  stack,
}) => {

  const [isReady, setIsReady] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState(null);
  const [showSelectedChart, setShowSelectedChart] = useState(false);

  useEffect(() => {
      if (yAxisParam) {
          setIsReady(true);
      }
  }, [xAxisParam, yAxisParam, sortedData]);

  useEffect(() => {
    console.log('selected chartID:', selectedChartId)
}, [selectedChartId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Delete") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);

  useEffect(() => {
      if (selectedChartId === null) {
        onResetChart();
      }
  }, [selectedChartId]);

  if (!isReady ) {
      return null; // Don't render the chart if the necessary variables are not ready
  }

  const handleSelectChart = () => {
    setSelectedChartId((prevChartId) => (prevChartId === chartId ? null : chartId));
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
    setShowSelectedChart(true)
  };

  const getOptions = () => {
    if (!sortedData ) {
      return {}; // Exit early if sortedData or yAxisData is not available
    } else if (type !== 'boxplot' && type !== 'heatmap') {
      const xAxisData = sortedData.xAxisData;
      const yAxisData = sortedData.yAxisData;
      const yAxisAxisLabelMaxLength = 2; // Adjust the maximum length you want
      const yAxisAxisLabel = yAxisData.map((data, index) => {
        const label = xAxisData[index].toString();
        if (label.length > yAxisAxisLabelMaxLength) {
          return label.slice(0, yAxisAxisLabelMaxLength) + '...'; // Truncate with '...' if needed
        }
        return label;
      });
      console.log('sorted Data:', sortedData)
      let mid_x = null; // Initialize mid_x as null
      let mid_y = null; // Initialize mid_y as null

      if (type !== 'pie' && type !== 'donut') {
        console.log('Chart Type:', type)
        console.log('Stack:', stack)
        // Compute mid_x and mid_y only for pie and donut chart types
        const middleIndex = Math.floor(xAxisData.length / 2);
        mid_x = xAxisData[middleIndex];
        mid_y = yAxisData[middleIndex];
      }
        
      let series = [];
      let legendData = [];

      if (type === "pie" || type === "donut") {
        series = [
          {
            data: yAxisData.map((data, index) => ({
              name: xAxisData[index],
              value: yAxisData[index],
            })),
            type: "pie",
            radius: type === 'pie' ? "50%" : ['40%', '70%'], // Set the radius of the pie chart        
            label: {
              show: true,
              formatter:  function(params) {
                return params.name + '\n' + params.percent + '%';
              },   
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
            const midYValues = mid_y.map((value) => ({
              coord: [mid_x, value],
              value: value
            }));
            const seriesItem = {
            name: yAxisParam,
            data: yAxisData.map((data) => data[i]),
            type: type,
            stack: stack,
            areaStyle: stack === 'Total' ? {} : null,     
            endLabel: {
              show: false,
              offset: [-20.5, -13.5]
            },
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' },
                { type: 'average', name: 'Average' },
                ...midYValues
              ],
              symbol: "pin",
              symbolSize: 0,
              label: {
                show: stack === 'Total' ? false : true,
                position: "top",
                color: 'black',
              }
            },
            emphasis: {
              disabled: true
            },
            silent: true,
            animation: false,
          };
          series.push(seriesItem);
          legendData.push(yAxisParam);
          
        });
      }
    
      return {
        title: {
          text: title,
          subtext: subtitle,
          show: true,
          itemGap: 2
        },
        legend: {
          show: type === "pie" || type === 'donut' ? false : true,
          bottom: "0%"
          
        },
        tooltip: {
          show: type === "pie" ? true : false,
          trigger: type === "pie" ? 'item' : 'none',
          formatter: '{b} : {c} ({d}%)'
        },
        xAxis: {
          silent: true,
          triggerEvent: false,
          show: type === "pie" || type === 'donut' ? false : true,
          type: "category",
          data: type === "pie" ? [] : xAxisData,
          axisTick: {
            show: true,
          },
        },
        yAxis: {
          silent: true,
          type: "value",
          axisLabel: {
            formatter: (value) => {
              const label = value.toString();
              if (label.length > yAxisAxisLabelMaxLength) {
                return label.slice(0, yAxisAxisLabelMaxLength) + '...'; // Truncate with '...' if needed
              }
              return label;
            },
          },
        },
        series: series,
      };
    } else if (type === 'boxplot') {
        console.log('type:', type)
        console.log('sortedData:', sortedData)
        console.log('yAxisParams:', yAxisParam)
        return {
          title: {
            text: title,
            show: true
          },
          xAxis: {
            type: "category",
            data: yAxisParam,
          },
          yAxis: {
            type: "value",
          },
          series: [{
            name: "boxplot",
            type: "boxplot",
            data: sortedData,
            colorBy: "data",
          }],
          emphasis: {
            disabled: true
          }
        };
    } else if (type === 'heatmap') {
      const xAxisData = sortedData.xAxisData;
      const yAxisData = sortedData.yAxisData;
      const min = sortedData.min;
      const max = sortedData.max;
      const data = sortedData.data.map(function (item) {
        return [item[0], item[1], item[2] || '-'];
      });
      return {
        title: {
          text: title,
          show: true
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        
        xAxis: {
          type: 'category',
          data: xAxisData,     
        },
        yAxis: {
          type: 'category',
          data: yAxisData,
        },
        visualMap: {
          min: min,
          max: max,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '15%'
        },
        series: [
          {
            name: 'Punch Card',
            type: 'heatmap',
            data: data,
            label: {
              show: true
            },
          }
        ],
        progressive: 400,
        silent: true,
      }
    }
  };
  
    return ( 
      <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }} className={`chart-border ${selectedChartId === chartId ? "selected-chart" : ""}`}>  
        <ReactEcharts 
          option={getOptions()} 
          style={{ height: "100%", width: "100%" }} 
          chartId={chartId}
          theme={theme}
        />
      </div>
      
      
    );
};

const Table = ({ 
  // generateChart,
  chartId,
  TabData,
  columns,
  onRemoveChart,
  onSelectChart,
  onChartID,
  onResetChart,
  title,
  subtitle,
}) => {

  const [isReady, setIsReady] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState(null);

  useEffect(() => {
      if (TabData && columns) {
          setIsReady(true);
      }
  }, [TabData, columns]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (onSelectChart && event.key === "Delete") {
        onRemoveChart(chartId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chartId, onRemoveChart, onSelectChart]);

  useEffect(() => {
    if (selectedChartId === null) {
      onResetChart();
    }
}, [selectedChartId]);

  if (!isReady ) {
    return null; // Don't render the chart if the necessary variables are not ready
  }

  const handleSelectChart = () => {
    setSelectedChartId((prevChartId) => (prevChartId === chartId ? null : chartId));
    onSelectChart(chartId);
    onChartID({ target: { value: chartId } });
  };

  console.log("TabData:", TabData);
  console.log("Columns:", columns);

  return (
    <div onClick={handleSelectChart} style={{ height: "100%", width: "100%" }} className={`table-border ${selectedChartId === chartId ? "selected-chart" : ""}`}>  
      <h3 style={{ marginBottom: "0px", fontSize: "20px", fontWeight: 'bold' }}>{title}</h3>
      <p style={{ marginTop: "0", fontSize: "15px" }}>{subtitle}</p>
        <ReactTable
          // filterable
          data={TabData}
          columns={columns}
          defaultPageSize={100} // Set the default page size to 100 rows
          showPagination={false} // Hide the pagination
          className="-striped -highlight compact-table" 
          
        />
    </div>

  );
};

export { ControlCenter, Chart, Table,  };


