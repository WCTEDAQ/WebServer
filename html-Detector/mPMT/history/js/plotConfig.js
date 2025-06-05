const selectorOptions = {
    buttons: [
       {
          step: 'minute',
          stepmode: 'backward',
          count: 1,
          label: '1min'
       },
       {
          step: 'hour',
          stepmode: 'backward',
          count: 1,
          label: '1hr'         
       },
       {
          step: 'hour',
          stepmode: 'backward',
          count: 3,
          label: '3hr'
       },
       {
          step: 'hour',
          stepmode: 'backward',
          count: 8,
          label: '8hr'
       },
       {
          step: 'hour',
          stepmode: 'backward',
          count: 12,
          label: '12hr'
       },
       {
          step: 'day',
          stepmode: 'backward',
          count: 1,
          label: '1d'         
       },
       {
          step: 'day',
          stepmode: 'backward',
          count: 3,
          label: '3d'         
       },
       {
          step: 'week',
          stepmode: 'backward',
          count: 1,
          label: '1w'         
       }
    //    {step: '1d'}
    ]
};

export const historySelectOptions = {
    buttons: [
        {
            step: 'minute',
            stepmode: 'backward',
            count: 1,
            label: '1min'
        },
        {
            step: 'hour',
            stepmode: 'backward',
            count: 1,
            label: '1hr'         
        },
        {
            step: 'hour',
            stepmode: 'backward',
            count: 3,
            label: '3hr'
        },
        {
            step: 'hour',
            stepmode: 'backward',
            count: 8,
            label: '8hr'
        },
        {
            step: 'hour',
            stepmode: 'backward',
            count: 12,
            label: '12hr'
        },
        {
            step: 'day',
            stepmode: 'backward',
            count: 1,
            label: '1d'         
        },
        {
           step: 'day',
            stepmode: 'backward',
            count: 3,
            label: '3d'         
        },
        {
            step: 'week',
            stepmode: 'backward',
            count: 1,
            label: '1w'         
        },
        {step: 'all'}
    ]
};

export function setDefaultPlotConfigs (rangeSelectorOption, graphDivs = null) {
    // Check if both arguments exist
    if (!rangeSelectorOption) {
        throw new Error('rangeSelectorOption argument is required');
    }

    var defaultConfigs = [
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
           medianFilter: false
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
                 range: [0, 10]
              }
           },
           medianFilter: false
        },
        {
           graphDiv: document.getElementById("graph_3"), // The div element for the first plot
           keys: ['pmt0_hit_cnt', 'pmt1_hit_cnt', 'pmt2_hit_cnt', 'pmt3_hit_cnt', 'pmt4_hit_cnt', 'pmt5_hit_cnt', 'pmt6_hit_cnt', 'pmt7_hit_cnt',
              'pmt8_hit_cnt', 'pmt9_hit_cnt', 'pmt10_hit_cnt', 'pmt11_hit_cnt', 'pmt12_hit_cnt', 'pmt13_hit_cnt', 'pmt14_hit_cnt',
              'pmt15_hit_cnt', 'pmt16_hit_cnt', 'pmt17_hit_cnt', 'pmt18_hit_cnt', 'pmt19_hit_cnt'], // List of keys related to the plot
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
           differentiate: false
        },
        {
         graphDiv: document.getElementById("graph_7"), // The div element for the first plot
         keys: ['last_run_queue_bytes_high'], // List of keys related to the plot
         selectedRange: 60 * 60 * 1000, 
         data: [], // Initially an empty array for data
         layout: {
            title: {
               text: "MPMT Buffer fill",
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
               title: "Fill in bytes",
               autorange: true
            }
         },
         filter: false,
           differentiate: false
        },
        {
         graphDiv: document.getElementById("graph_7"), // The div element for the first plot
         keys: ['last_run_queue_high'], // NOT working properly
         selectedRange: 60 * 60 * 1000, 
         data: [], // Initially an empty array for data
         layout: {
            title: {
               text: "MPMT Queue high",
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
               title: "Fill in packets",
               autorange: true
            }
         },
         filter: false,
           differentiate: false
        },
        {
         graphDiv: document.getElementById("graph_7"), // The div element for the first plot
         keys: ['last_run_sent_high'], // NOT working properly
         selectedRange: 60 * 60 * 1000, 
         data: [], // Initially an empty array for data
         layout: {
            title: {
               text: "MPMT Sent queue high",
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
               title: "Fill in bytes",
               autorange: true
            }
         },
         filter: false,
           differentiate: false
        }
     ];

    if (graphDivs && Array.isArray(graphDivs)) {
        if (graphDivs.length === defaultConfigs.length) {
            graphDivs.forEach((div, i) => {
                defaultConfigs[i].graphDiv = div;
            });
        } else {
            throw new Error('Length of graphDivs array does not match the defaultConfigs array');
        }
    } else if (graphDivs instanceof HTMLElement) {
        defaultConfigs.forEach(config => {
            config.graphDiv = graphDivs;
        });
    } else if (graphDivs === null) {
        console.warn("graphDivs argument not found - uses default values.")
    } else {
        throw new Error("graphDivs must be either an array or a document element");
    }
    return defaultConfigs;
}

export var defaultPlotConfigs = setDefaultPlotConfigs(selectorOptions);
