
var autoscrollData = true;
var updating = false;
var autoscrollDataButton;
var autoscrollDataTextFrame;
var autoscrollDataColorBit = 0b0;

var xDataFIFOs = new Map();
var yDataFIFOs = new Map();

const MEDIAN_FILTER_WINDOW_LENGTH = 3;
const DIFFERENTIATE_DT_IN_SEC = 5;
const CURRENT_VALUE_SCALE_FACTOR = 10;

var dataTimeIntervalID = 0;
var autoscrollDataBlinkingTextIntervalID = 1;

var mPMTNumber = "";

//define the buttons for the range selection in plotly
var selectorOptions = { //plot options definitions
   buttons: [{
      step: 'minute',
      stepmode: 'backward',
      count: 1,
      label: '1min'
   },{
      step: 'minute',
      stepmode: 'backward',
      count: 10,
      label: '10min'
   },{
      step: 'hour',
      stepmode: 'backward',
      count: 1,
      label: '1hr'
   }, {
      step: 'hour',
      stepmode: 'backward',
      count: 3,
      label: '3hr'
   }, {
      step: 'all'
   }],
};

let plots = [
   {
      graphDiv: document.getElementById("graph_0"), // The div element for the first plot
      keys: ['pmt0_hvvolval', 'pmt1_hvvolval', 'pmt2_hvvolval', 'pmt3_hvvolval', 'pmt4_hvvolval', 'pmt5_hvvolval', 'pmt6_hvvolval', 'pmt7_hvvolval',
         'pmt8_hvvolval', 'pmt9_hvvolval', 'pmt10_hvvolval', 'pmt11_hvvolval', 'pmt12_hvvolval', 'pmt13_hvvolval', 'pmt14_hvvolval',
         'pmt15_hvvolval', 'pmt16_hvvolval', 'pmt17_hvvolval', 'pmt18_hvvolval'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT HV Voltage",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Voltage [V]",
            range: [0, 1500]
         }
      },
      medianFilter: true
   },
   {
      graphDiv: document.getElementById("graph_1"), // The div element for the first plot
      keys: ['pmt0_hvcurval', 'pmt1_hvcurval', 'pmt2_hvcurval', 'pmt3_hvcurval', 'pmt4_hvcurval', 'pmt5_hvcurval', 'pmt6_hvcurval', 'pmt7_hvcurval',
         'pmt8_hvcurval', 'pmt9_hvcurval', 'pmt10_hvcurval', 'pmt11_hvcurval', 'pmt12_hvcurval', 'pmt13_hvcurval', 'pmt14_hvcurval',
         'pmt15_hvcurval', 'pmt16_hvcurval', 'pmt17_hvcurval', 'pmt18_hvcurval'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT HV Current",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Current [uA]",
            range: [0, 2]
         }
      },
      medianFilter: true
   },
   {
      graphDiv: document.getElementById("graph_3"), // The div element for the first plot
      keys: ['pmt0_hit_cnt', 'pmt1_hit_cnt', 'pmt2_hit_cnt', 'pmt3_hit_cnt', 'pmt4_hit_cnt', 'pmt5_hit_cnt', 'pmt6_hit_cnt', 'pmt7_hit_cnt',
         'pmt8_hit_cnt', 'pmt9_hit_cnt', 'pmt10_hit_cnt', 'pmt11_hit_cnt', 'pmt12_hit_cnt', 'pmt13_hit_cnt', 'pmt14_hit_cnt',
         'pmt15_hit_cnt', 'pmt16_hit_cnt', 'pmt17_hit_cnt', 'pmt18_hit_cnt'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT Hit counts per 5 seconds",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Counts",
         }
      },
      filter: false
   },
   {
      graphDiv: document.getElementById("graph_4"), // The div element for the first plot
      keys: ['brb_temp_0', 'brb_temp_1', 'brb_temp_2'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT Onboard Sensors Temperature",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Temp [C]",
            range: [0, 100]
         }
      },
      medianFilter: false
   },
   {
      graphDiv: document.getElementById("graph_5"), // The div element for the first plot
      keys: ['brb_humidity'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT Humidity",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Humidity [%]",
         }
      },
      filter: false
   },
   {
      graphDiv: document.getElementById("graph_6"), // The div element for the first plot
      keys: ['last_run_frames_sent','last_run_frames_dropped'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT Frames send and dropped on last run",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Count",
         }
      },
      filter: false
   },
      {
      graphDiv: document.getElementById("graph_7"), // The div element for the first plot
      keys: ['net_eth1_rxpackets','net_eth1_txpackets'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000, 
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "MPMT Ethernet Throughput",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Througput [num_of_packets / second]",
            autorange: true
         }
      },
      filter: false,
      differentiate: true
   }
];

let statusPlot = {
   graphDiv: document.getElementById("graph_2"), // The div element for the first plot
   keys: ['pmt0_status1', 'pmt1_status1', 'pmt2_status1', 'pmt3_status1', 'pmt4_status1', 'pmt5_status1', 'pmt6_status1', 'pmt7_status1', 'pmt8_status1',
      'pmt9_status1', 'pmt10_status1', 'pmt11_status1', 'pmt12_status1', 'pmt13_status1', 'pmt14_status1', 'pmt15_status1', 'pmt16_status1', 'pmt17_status1', 'pmt18_status1'], // List of keys related to the plot
   data: [{
      x: ['PMT0', 'PMT1', 'PMT2', 'PMT3', 'PMT4', 'PMT5', 'PMT6', 'PMT7', 'PMT8', 'PMT9', 'PMT10', 'PMT11', 'PMT12', 'PMT13', 'PMT14', 'PMT15', 'PMT16', 'PMT17', 'PMT18'],
      y: ['HV On', 'HV Present', 'UnderVoltage', 'OverCurrent', 'TripDetected', 'OutRange', 'V5OutRange', 'Reserved'],
      z: new Array(new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0),
         new Array(19).fill(0)),
      type: 'heatmap',
      colorscale: [[0, '#3D9970'], [1, '#001f3f']],
      showscale: false,
      opacity: 0.5,
      xgap: 5,
      ygap: 5
   }],
   layout: {
      title: {
        text: 'MPMT Status1 Register'
      },
      annotations: [],
      xaxis: {
        ticks: '',
        side: 'top'
      },
      yaxis: {
        ticks: '',
        ticksuffix: ' ',
        width: 700,
        height: 700,
        autosize: false
      }
   },
   annotation: {
      xref: 'x1',
      yref: 'y1',
      x: -1,
      y: -1,
      text: "N/A",
      font: {
        family: 'Arial',
        size: 12,
        color: 'rgb(50, 171, 96)'
      },
      showarrow: false,
      font: {
        color: "black"
      }
   }
}

//this is the code which is executed when make waterplots is called
document.addEventListener("DOMContentLoaded", async function () {

   let findMPMTButton = document.getElementById("findMPMTButton");
   findMPMTButton.addEventListener("click", async (event) => {

      clearInterval(dataTimeIntervalID);

      let mPMTTextBox = document.getElementById("mPMTTextField");
      mPMTNumber = mPMTTextBox.value;

      if (mPMTNumber.trim()) {    // Check non-empty
         let statusDiv   = document.getElementById("status");
         statusDiv.innerHTML = `<p style="text-align:center;">${mPMTNumber}</p>`;
       }
   

      await makePlots("_PMT" + mPMTNumber);
      setupPlotListeners();

      dataTimeIntervalID = setInterval(() => updatePlots("_PMT" + mPMTNumber), 2000);
   });

   autoscrollDataButton = document.getElementById("autoscrollButton");
   autoscrollDataButton.addEventListener("click", async (event) => {
      // autoscrollButton.style.background = "#000000";
      autoscrollData = true;
      console.log("autoscroll buttone clicked")
   });
   
   autoscrollDataTextFrame = document.getElementById("autoscrollTextFrame");
   // let liveAutoscrollText = document.getElementById("")
   autoscrollDataBlinkingTextIntervalID = setInterval(async () => {
      if(autoscrollData == true) {
         autoscrollDataTextFrame.textContent = "!DATA LIVE ON!";
         autoscrollDataColorBit ^= 1;
         if(autoscrollDataColorBit) {
            autoscrollDataTextFrame.setAttribute("style", "color: red; font-size:14pt");
         } else {
            autoscrollDataTextFrame.setAttribute("style", "color: grey; font-size:14pt");
         }
      } else {
         autoscrollDataTextFrame.textContent = "!DATA LIVE OFF!";
         autoscrollDataTextFrame.setAttribute("style", "color: grey; font-size:14pt");
      }
   }, 1000);
});

async function makePlots(deviceName) {

   var time_option = null;

   //set the range automatically
   var now = new Date();  // Get current time

   const [xdata, ydata] = await getTimeDataForDevice(deviceName, time_option);

   for (iPlot = 0; iPlot < plots.length; iPlot++) {
      createSinglePlot(plots[iPlot], xdata, ydata, now);
   }
   createStatusPlot();
}

function createSinglePlot(plot, xdata, ydata, now) {
   //creates the data object in the plot

   plot.data = plot.keys.map(key => {
      if (xdata.has(key)) {

         let x_data_to_plot = [];
         let y_data_to_plot = [];

         // THE DATA HAS TO BE REVERSED TO CHANGE TIME ORDER FROM DESC -> ASC
         // AND FILTERED TO REMOVE BAD MPMT VALUES
         xDataFIFOs.set(key, xdata.get(key).reverse());
         yDataFIFOs.set(key, ydata.get(key).reverse());

         if("medianFilter" in plot) {
            if(plot.medianFilter == true) {
               x_data_to_plot = xdata.get(key);
               y_data_to_plot = medianFilter(ydata.get(key), MEDIAN_FILTER_WINDOW_LENGTH);      
            } else {
               x_data_to_plot = xdata.get(key);
               y_data_to_plot = ydata.get(key);  
            }
         } else if("differentiate" in plot) {
            if(plot.differentiate == true) {
               x_data_to_plot = xdata.get(key).slice(1);
               y_data_to_plot = differentiate(ydata.get(key),  DIFFERENTIATE_DT_IN_SEC);      
            } else {
               x_data_to_plot = xdata.get(key);
               y_data_to_plot = ydata.get(key);  
            }
         } else {
            x_data_to_plot = xdata.get(key);
            y_data_to_plot = ydata.get(key);  
         }
    
         if(key.includes("hvcurval")) {
            y_data_to_plot = y_data_to_plot.map((value) => value / CURRENT_VALUE_SCALE_FACTOR);
         }
         //decide whether to use a second y axis 
         const data_trace = {
            //the name must be the key for the update function to work
            name: key,
            mode: 'lines',
            x: x_data_to_plot,
            y: y_data_to_plot
         };

         //if this is a key we want to put on the y2 axis put this in the data 
         if ('y2keys' in plot) {
            if (plot.y2keys.includes(key)) {
               data_trace.yaxis = 'y2';
            }
         }
         return data_trace;
      }
      return null; // If key doesn't exist, return null
   }).filter(Boolean); // Filter out null values

   var lowerLimit = new Date(now.getTime() - (plot.selectedRange));  // Subtract 1 hour

   //add the range using the selected range 
   plot.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];

   Plotly.purge(plot.graphDiv); // Clear any existing plot
   Plotly.newPlot(plot.graphDiv, plot.data, plot.layout); // Plot the data

   return true;
}

function createStatusPlot() {
   Plotly.purge(statusPlot.graphDiv);
   Plotly.newPlot(statusPlot.graphDiv, statusPlot.data, statusPlot.layout)
}

function updateStatusPlot(xdata, ydata) {

   if(xdata.size == 0)
      return;
   
   statusPlot.layout.annotations = [];
   const NUM_OF_STATUS1_REG_BITS = 8;

   statusPlot.keys.map(key => {
      if (xdata.has(key)) {

         let pmtNumber = key.replace(/\D+/g, ' ').trim().split(' ').map(e => parseInt(e))[0];
         
         let newData = ydata.get(key);
         let status = newData[newData.length - 1].toString(2);
         let currentStatus = '00000000'.split('').slice(status.length).concat(status.split(''));

         for(let bitNumber = 0; bitNumber < NUM_OF_STATUS1_REG_BITS - 1; bitNumber++) {

            statusPlot.data[0].z[bitNumber][pmtNumber] = currentStatus[NUM_OF_STATUS1_REG_BITS - 1 - bitNumber];
            var currentValue = statusPlot.data[0].z[bitNumber][pmtNumber];
            if (currentValue != 0.0) {
              var textColor = 'white';
            }else{
              var textColor = 'black';
            }
            
            var result = structuredClone(statusPlot.annotation);
            result.x = statusPlot.data[0].x[pmtNumber];
            result.y = statusPlot.data[0].y[bitNumber];
            result.text = statusPlot.data[0].z[bitNumber][pmtNumber];
            result.font.color = textColor;

            statusPlot.layout.annotations.push(result);
         }
      } else if (key in statusPlot.keys) {
         let pmtNumber = key.replace(/\D+/g, ' ').trim().split(' ').map(e => parseInt(e))[0];         
         for(let bitNumber = 0; bitNumber < NUM_OF_STATUS1_REG_BITS - 1; bitNumber++) {
            
            var result = structuredClone(statusPlot.annotation);
            result.x = statusPlot.data[0].x[pmtNumber];
            result.y = statusPlot.data[0].y[bitNumber];

            statusPlot.layout.annotations.push(result);
         }
      }
   })
   Plotly.update(statusPlot.graphDiv, statusPlot.data, statusPlot.layout)
}

// Function to initialize event listeners on each plot
function setupPlotListeners() {
   plots.forEach((plot, plotIndex) => {
      console.log(plot);
      const plotDiv = plot.graphDiv;
      // Check if the plotDiv exists
      if (plotDiv) {
         plotDiv.on('plotly_relayout', function (eventData) {
            // Capture the selected range
            console.log("onPlotLayout");

            console.log(eventData);

            if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
               
               autoscrollData = false;
               updatemenus[0].font['color'] = '#000000';

               const selectedRange = [
                  eventData['xaxis.range[0]'],
                  eventData['xaxis.range[1]']
               ];
               // Convert date strings to Date objects
               const startDate = new Date(selectedRange[0] + "Z");
               const endDate = new Date(selectedRange[1]);

               console.log("Start date / end date: ", startDate, endDate)
               // Calculate the difference in milliseconds and then convert to days (or any other unit)
               const rangeDifference = Math.abs(endDate - startDate); // Difference in days                       
               // Set the range difference directly in the plot object
               plot.selectedRange = rangeDifference;
               console.log("Selected Range for, Plot " + plot.layout.title + ":", selectedRange);
            } 
            if(eventData['xaxis.autorange'] !== undefined) {
               autoscrollData = false;
               updatemenus[0].font['color'] = 'red';               
            }
         });
      } else {
         console.warn(`Plot div not found for Plot ${plotIndex + 1}.`);
      }
   });
}

function updateSinglePlot(plot, xdata_new, ydata_new, now) {

   var lowerLimit = new Date(now.getTime() - plot.selectedRange);  // Subtract 1 hour

   //loop through new data and add into the plot if the key is the same
   for (let [key, value] of xdata_new) {
      for (var i = 0; i < plot.data.length; i++) {
         if (plot.data[i].name == key) {
            //this data[i] is the same key as this xdata_new entry
            //so add it
            let x_data_to_plot = [];
            let y_data_to_plot = [];
            
            let newData = ydata_new.get(key);

            isDataAvailable = true;

            xDataFIFOs.set(key, enqueueFIFOArrayElements(xDataFIFOs.get(key), value));
            yDataFIFOs.set(key, enqueueFIFOArrayElements(yDataFIFOs.get(key), newData));

            if("medianFilter" in plot) {
               if(plot.medianFilter == true) {
                  // MEDIAN FILTER FOR UPCOMING DATA (MPMT GENERATES SOME BAD READOUTS)
                  // 1. concatenate new data to the NUM_OF_LAST_ELEMENTS_TO_FILTER last elements of yDataFIFOs   
                  // 2. median filter to get rid of the wrong values 
                  // 3. swap the NUM_OF_LAST_ELEMENTS_TO_FILTER last elements of plot.data.y to plot new filtered data
                  const NUM_OF_LAST_ELEMENTS_TO_FILTER = 10;

                  filteredNewData = medianFilter(yDataFIFOs.get(key).slice(-NUM_OF_LAST_ELEMENTS_TO_FILTER), MEDIAN_FILTER_WINDOW_LENGTH);
                  
                  if(key.includes("hvcurval")) {
                     filteredNewData = filteredNewData.map(value => value / CURRENT_VALUE_SCALE_FACTOR);
                  }

                  x_data_to_plot = xDataFIFOs.get(key);
                  y_data_to_plot = plot.data[i].y.slice(0, -NUM_OF_LAST_ELEMENTS_TO_FILTER).concat(filteredNewData);

               } else {
                  x_data_to_plot = xDataFIFOs.get(key);
                  y_data_to_plot = yDataFIFOs.get(key);;  
               }
            } else if ("differentiate" in plot) {
               if(plot.differentiate == true) {
                  // DIFFERENTIATION OF THE UPCOMING DATA
                  const TIME_BETWEEN_THE_PACKETS_IN_SEC = 5;

                  diffNewData = differentiate(yDataFIFOs.get(key), TIME_BETWEEN_THE_PACKETS_IN_SEC);
                  
                  x_data_to_plot = xDataFIFOs.get(key).slice(1);
                  y_data_to_plot = diffNewData;
               } else {
                  x_data_to_plot = xDataFIFOs.get(key);
                  y_data_to_plot = yDataFIFOs.get(key);
               }
            } else {
               x_data_to_plot = xDataFIFOs.get(key);
               y_data_to_plot = yDataFIFOs.get(key);
            }

            plot.data[i].x = x_data_to_plot;
            plot.data[i].y = y_data_to_plot;
         }
      }
   }

   if(autoscrollData == true) {
      //change the axis limits to reflect current time and previous choice
      plot.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];
   }

   Plotly.update(plot.graphDiv, plot.data, plot.layout);
}

async function updatePlots(deviceName) { //fucntion to update, plot

   if (updating) return;
   updating = true;

   var now = new Date();  // Get current time

   // Seek for the latest timestamp in the data 
   var lastDate = "1970-01-01 00:00:00.0000+00".valueOf();
   try {
      xDataFIFOs.forEach((value) => {
         lastTimestamp = value[value.length - 1];
         lastDate = lastTimestamp > lastDate ? lastTimestamp : lastDate;
      })
   } catch(error) {
      console.log(error)
   }

   time_option = lastDate;

   //get only the new data by looking for data that arrived after the last data
   const [xdata_new, ydata_new] = await getTimeDataForDevice(deviceName, time_option);
   for (iPlot = 0; iPlot < plots.length; iPlot++) {
      updateSinglePlot(plots[iPlot], xdata_new, ydata_new, now);
   }
   updateStatusPlot(xdata_new, ydata_new);

   updating = false;
}
