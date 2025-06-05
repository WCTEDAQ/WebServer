
import {fetchWaterMonitoringJSON, mapDataToTraces} from './fetchData.js';

function setPlotData(plotConfig, xdata, ydata) {
   return plotConfig.keys.map(key => {
      if (ydata.has(key)) {
         const y_data_to_plot = ydata.get(key);
         // Check length mismatch
         if (xdata.length !== y_data_to_plot.length) {
            console.error(`Length mismatch for key "${key}": xdata(${xdata.length}) vs ydata(${y_data_to_plot.length})`);
            return null;
         }

         const data_trace = {
            name: key,
            mode: 'lines',
            x: xdata,
            y: y_data_to_plot
         };

         // Add to y2 axis if specified in plotConfig.y2keys
         if (plotConfig.y2keys && plotConfig.y2keys.includes(key)) {
            data_trace.yaxis = 'y2';
         }
         return data_trace;

      } else {
         console.warn(`Key "${key}" is missing in ydata.`);
         return null; // Filter out later
      }
   }).filter(Boolean); // Filter out null values
}

export function makeHistoryPlot(plotConfig, xdata, ydata) {
   if (!(ydata instanceof Map)) {
      console.error("ydata must be a Map.");
      return;
   }

   //creates the data object in the plot
   plotConfig.data = setPlotData(plotConfig, xdata, ydata);

   Plotly.react(plotConfig.graphDiv, plotConfig.data, plotConfig.layout);
}

function createSinglePlot(plotConfig, xdata, ydata, now) {
   if (!(ydata instanceof Map)) {
      console.error("ydata must be a Map.");
      return;
   }

   //creates the data object in the plot
   plotConfig.data = plotConfig.keys.map(key => {
      if (ydata.has(key)) {
         const y_data_to_plot = ydata.get(key);
         // Check length mismatch
         if (xdata.length !== y_data_to_plot.length) {
            console.error(`Length mismatch for key "${key}": xdata(${xdata.length}) vs ydata(${y_data_to_plot.length})`);
            return null;
         }

         const data_trace = {
            name: key,
            mode: 'lines',
            x: xdata,
            y: y_data_to_plot
         };

         // Add to y2 axis if specified in plotConfig.y2keys
         if (plotConfig.y2keys && plotConfig.y2keys.includes(key)) {
            data_trace.yaxis = 'y2';
         }
         return data_trace;

      } else {
         console.warn(`Key "${key}" is missing in ydata.`);
         return null; // Filter out later
      }
   }).filter(Boolean); // Filter out null values
 
   var lowerLimit = new Date(now.getTime() - (plotConfig.selectedRange));  // Subtract 1 hour
 
   //add the range using the selected range 
   plotConfig.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];
 
    // set the default range selector btn
    // plotConfig.layout.xaxis.rangeselector.active = plotConfig.activeRangeSelectorIndex;
 
   Plotly.purge(plotConfig.graphDiv); // Clear any existing plot
   Plotly.newPlot(plotConfig.graphDiv, plotConfig.data, plotConfig.layout); // Plot the data
 
   return;
}

function extendSinglePlot(plotConfig, newXData, newYData, now) {
   if (!(newYData instanceof Map)) {
      console.error("newYData must be a Map.");
      return;
   }

   const updateData = { x: [], y: [] };
   const traceIndices = [];
   console.log("[extendingPlot] Selected Range for, Plot " + plotConfig.layout.title.text + ":", plotConfig.selectedRange);
   var lowerLimit = new Date(now.getTime() - plotConfig.selectedRange);

   plotConfig.keys.forEach((trace, i) => {
      if (newYData.has(trace)) {
         updateData.x.push(newXData);
         updateData.y.push(newYData.get(trace));
         traceIndices.push(i);
      }
   });

   var newView = {
      xaxis: {
         title: plotConfig.layout.xaxis.title,
         rangeselector: plotConfig.layout.xaxis.rangeselector,
         range: [lowerLimit.toISOString(), now.toISOString()]
      }
   };
   console.log("[extendingPlot] xaxis range:", plotConfig.layout.xaxis.range);

   Plotly.relayout(plotConfig.graphDiv, newView);
   Plotly.extendTraces(plotConfig.graphDiv, updateData, traceIndices);
}

export async function extendPlots(plotConfigs) {
   var now = new Date();  // Get current time

   // Get the last time of the last entry in the data
   const plotData = plotConfigs[0].data[0];
   const last = plotData.x[plotData.x.length - 1];
   
   // Ensure last is converted to a Date object if it isn't one already
   const lastDate = last instanceof Date ? last : new Date(last);
   const timeOption = lastDate.toISOString();
   // console.log(timeOption);

   const data = await fetchWaterMonitoringJSON(timeOption);
   const [newXData, newYData] = await mapDataToTraces(data);

   plotConfigs.forEach((config, i) => {
      extendSinglePlot(config, newXData, newYData, now);
   });

}
// function resetSinglePlot(plotConfig, xdata, ydata, now) {
//    if (!(ydata instanceof Map)) {
//       console.error("ydata must be a Map.");
//       return;
//    }

//    plotConfig.data = plotConfig.keys.map((key) => {
//       if (ydata.has(key)) {
//          const newXData = xdata;
//          const newYData = ydata.get(key);

//          // Check length mismatch
//          if (newXData.length !== newYData.length) {
//             console.error(`Length mismatch for key "${key}": xdata(${xdata.length}) vs ydata(${y_data_to_plot.length})`);
//             return null;            
//          }

//          const trace = {
//             name: key,
//             mode: 'lines',
//             x: newXData,
//             y: newYData
//          };

//          // Add to y2 axis if specified in plotConfig.y2keys
//          if (plotConfig.y2keys && plotConfig.y2keys.includes(key)) {
//             trace.yaxis = 'y2';
//          }
//          return trace;         
//       } else {
//          console.warn(`Key "${key}" is missing in ydata.`);
//          return null; // Filter out later
//       }
//    }).filter(Boolean); // Filter out null values
   
// }

export async function makePlots(xdata, ydata, plotConfigs) {

   let now = new Date();

   plotConfigs.forEach((config, i) => {
      createSinglePlot(config, xdata, ydata, now);
   });
}

// export async function setPlotsListners(plotConfigs, defaultQueryTime) {
//    const existingXValue = plotConfigs
//    plotConfigs.forEach((config, i) => {
//       const plotDiv = config.graphDiv;
//       if (!plotDiv) {
//          console.warn(`Plot div not found for Plot ${i+1}.`);
//          return;
//       }

//       plotDiv.on('plotly_relayout', function (eventData) {
//          // Capture the selected range
//          if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
//             const plotXVals = config.data.flatMap(trace => trace.x);
//             const minPlotXVal = new Date(Math.min(...plotXVals.map(x => new Date(x).getTime())));
//             const selectedRange = [
//                eventData['xaxis.range[0]'],
//                eventData['xaxis.range[1]']
//             ];
//             // Convert date strings to Date objects
//             const startDate = new Date(selectedRange[0] + "Z");
//             const endDate = new Date(selectedRange[1]);
            
//             // Calculate the difference in milliseconds and then convert to days (or any other unit)
//             const rangeDifference = (endDate - startDate); // Difference in days

//             // Set the range difference directly in the plot object
//             config.selectedRange = rangeDifference;
//             console.log("Selected Range for, Plot " + config.layout.title + ":", selectedRange);

//             if (startDate < minPlotXVal) {
//                // Fetch new data
//                let now = new Date();
//                const newTimeOption = new Date(now.getTime() - startDate).toISOString();

//                const data = await fetchWaterMonitoringJSON(newTimeOption);

//             }
//          }
//       });
//    });
// }