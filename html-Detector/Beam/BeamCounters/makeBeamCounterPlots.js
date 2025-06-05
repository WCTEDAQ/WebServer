
var updating = false;

//define the buttons for the range selection in plotly
var selectorOptions = { //plot options definitions
   buttons: [{
      step: 'minute',
      stepmode: 'backward',
      count: 1,
      label: '1min'
   }, {
      step: 'minute',
      stepmode: 'backward',
      count: 10,
      label: '10min'
   }, {
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
      step: 'hour',
      stepmode: 'backward',
      count: 8,
      label: '8hr'
   }, {
      step: 'day',
      stepmode: 'backward',
      count: 1,
      label: '1d'
   }, {
      step: 'day',
      stepmode: 'backward',
      count: 3,
      label: '3d'
   }, {
      step: 'week',
      stepmode: 'backward',
      count: 1,
      label: '1w'
   }, {
      step: 'all'
   }],
};


var deviceName = "BeamCounters";

//to define a new plot for the same device add it to the vector 
let plots = [
   {
      graphDiv: document.getElementById("graph_1"), // The div element for the first plot
      keys: ['TDCT00','XTRIG','LASER','T3'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Primary Trigger, External Trigger and Laser",
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
            range: [0, 7],
            type: 'log'          
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_2"), // The div element for the first plot
      keys: ['LE psV','LE TOF','LE e','LE mu'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Level 2 Outputs",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_3"), // The div element for the first plot
      keys: ['T0 L1','T1 L1','T0T1L1','TOFR','TOFL'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Level 1 Outputs, Group 1",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_4"), // The div element for the first plot
      keys: ['HC L1','MUON','ACTeOR','ACT0Rps','ACT0Lps'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Level 1 Outputs, Group 2",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_5"), // The div element for the first plot
      keys: ['T0-0L','T0-0R','T0-1L','T0-1R'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "T0 Counters",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_6"), // The div element for the first plot
      keys: ['T1-0L','T1-0R','T1-1L','T1-1R'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "T1 Counters",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_7"), // The div element for the first plot
      keys: ['ACT0-L','ACT0-R','ACT1-L','ACT1-R','ACT2-L','ACT2-R'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Electron Veto ACTs",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_8"), // The div element for the first plot
      keys: ['ACT3-L','ACT3-R','ACT4-L','ACT4-R','ACT5-L','ACT5-R'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Mu/Pi Separation ACTs",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_9"), // The div element for the first plot
      keys: ['T4-L','T4-R','HC-0','HC-1','MuT-L','MuT-R','PbG'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "T4, Hole Counters, Muon Tag, Lead Glass",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_10"), // The div element for the first plot
      keys: ['TOF-0','TOF-1','TOF-2','TOF-3','TOF-4','TOF-5','TOF-6','TOF-7'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "TOF, Group 1",
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
            range: [0, 7],
            type: 'log'
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_11"), // The div element for the first plot
      keys: ['TOF-8','TOF-9','TOF-A','TOF-B','TOF-C','TOF-D','TOF-E','TOF-F'], // List of keys related to the plot
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "TOF, Group 2",
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
            range: [0, 7],
            type: 'log'
         }
      }
   }
];

//copied from Ben's code in monitoring.js this queries the SQL and returns the table
function gettable(command) { //generic funcion for returning SQL table

   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var url = "/cgi-bin/sqlquery.cgi";
      var user = "root";
      var db = "daq";
      // Set the request method to POST
      xhr.open("POST", url);
      // Set the request header to indicate that the request body contains form data
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      var dataString = "user=" + user + "&db=" + db + "&command=" + command;
      // Send the request
      xhr.send(dataString);
      xhr.onreadystatechange = function () {
         if (this.readyState == 4 && this.status == 200) {
            resolve(xhr.responseText);
         }
         //	    else reject(new Error('error loading'));
      }
   });
}

async function getTimeDataForDevice(deviceName, time_option) {
   const selectedDevice = deviceName; // Fixed device value
   // console.log("Selected Device: ", selectedDevice); // Log the selected device

   if (time_option === null) {
      var command = "select * from monitoring where device='" + selectedDevice + "' order by time asc";
   } else {
      //time option needs to be a string to specify only get data after the last available data
      //this command is used to update and append
      var command = "select * from monitoring where device='" + selectedDevice + "' and time>'" + time_option + "' order by time asc;  ";
   }

   // Call gettable command asynchronously
   try {
      const result = await gettable(command);

      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = result;

      // Get the table from the temporary div
      var table = tempDiv.querySelector("#table");

      if (!table) {
         console.error("Table not found in result.");
         return [new Map(), new Map()];
      }

      var xdata = new Map();
      var ydata = new Map();

      for (var i = 1; i < table.rows.length; i++) {
         var jsondata = JSON.parse(table.rows[i].cells[2].innerText);

         for (let key in jsondata) {
            if (!xdata.has(key)) {
               xdata.set(key, [table.rows[i].cells[0].innerText.slice(0, -3)]);
               ydata.set(key, [jsondata[key]]);
            } else {
               xdata.get(key).push(table.rows[i].cells[0].innerText.slice(0, -3));
               ydata.get(key).push(jsondata[key]);
            }
         }
      }
      // console.log("returning xdata ")
      return [xdata, ydata];
   } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again.");
      return [new Map(), new Map()]; // Return empty maps on error
   }
}

function createSinglePlot(plot, xdata, ydata, now) {
   //creates the data object in the plot
   plot.data = plot.keys.map(key => {
      if (xdata.has(key)) {
         //remove the first n elements which used a different format
         const x_data_to_plot = xdata.get(key);
         const y_data_to_plot = ydata.get(key);
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

   // console.log("graphdiv", plot.graphDiv)
   Plotly.purge(plot.graphDiv); // Clear any existing plot
   Plotly.newPlot(plot.graphDiv, plot.data, plot.layout); // Plot the data

   return;
}

function updateSinglePlot(plot, xdata_new, ydata_new, now) {
   // console.log("Calling redrawplot")

   var lowerLimit = new Date(now.getTime() - plot.selectedRange);  // Subtract 1 hour

   //loop through new data and add into the plot if the key is the same
   for (let [key, value] of xdata_new) {
      for (var i = 0; i < plot.data.length; i++) {
         if (plot.data[i].name == key) {
            //this data[i] is the same key as this xdata_new entry
            //so add it 
            plot.data[i].x = plot.data[i].x.concat(value);
            plot.data[i].y = plot.data[i].y.concat(ydata_new.get(key));
         }
      }
   }

   //change the axis limits to reflect current time and previous choice
   plot.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];

   Plotly.update(plot.graphDiv, plot.data, plot.layout);
}

async function makeplot(plotsVector) {

   var time_option = null;

   //set the range automatically
   var now = new Date();  // Get current time

   const [xdata, ydata] = await getTimeDataForDevice(deviceName, time_option);
   for (iPlot = 0; iPlot < plotsVector.length; iPlot++) {
      // console.log("graphdiv1", plotsVector[iPlot].graphDiv)
      createSinglePlot(plotsVector[iPlot], xdata, ydata, now);
   }

}


async function updateplot(plotVector) { //fucntion to update plot
   // console.log("updateplot vector")
   if (updating) return;
   updating = true;

   var now = new Date();  // Get current time

   // Get the last time of the last entry in the data
   const plot_0_data = plotVector[0].data[0];
   last = plot_0_data.x[plot_0_data.x.length - 1];
   time_option = last.valueOf();

   //get only the new data by looking for data that arrived after the last data
   const [xdata_new, ydata_new] = await getTimeDataForDevice(deviceName, time_option);

   for (iPlot = 0; iPlot < plots.length; iPlot++) {
      updateSinglePlot(plots[iPlot], xdata_new, ydata_new, now);
   }
   updating = false;


};

// Function to initialize event listeners on each plot
function setupPlotListeners() {
   plots.forEach((plot, plotIndex) => {
      const plotDiv = plot.graphDiv;
      // Check if the plotDiv exists
      if (plotDiv) {
         plotDiv.on('plotly_relayout', function (eventData) {
            // Capture the selected range
            if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
               const selectedRange = [
                  eventData['xaxis.range[0]'],
                  eventData['xaxis.range[1]']
               ];
               // Convert date strings to Date objects
               const startDate = new Date(selectedRange[0] + "Z");
               const endDate = new Date(selectedRange[1]);

               // Calculate the difference in milliseconds and then convert to days (or any other unit)
               const rangeDifference = (endDate - startDate); // Difference in days                       
               // Set the range difference directly in the plot object
               plot.selectedRange = rangeDifference;
               console.log("Selected Range for, Plot " + plot.layout.title + ":", selectedRange);
            }
         });
      } else {
         console.warn(`Plot div not found for Plot ${plotIndex + 1}.`);
      }
   });
}

//this is the code which is executed when make waterplots is called
document.addEventListener("DOMContentLoaded", async function () {
   await makeplot(plots);
   setupPlotListeners();
   let updateinterval = setInterval(() => updateplot(plots), 2000);
});

//setInterval( updateplot, 2000, plots);
