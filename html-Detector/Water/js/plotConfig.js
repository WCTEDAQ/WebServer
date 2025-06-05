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
       }
    //    {
    //       step: 'day',
    //       stepmode: 'backward',
    //       count: 3,
    //       label: '3d'         
    //    },
    //    {
    //       step: 'week',
    //       stepmode: 'backward',
    //       count: 1,
    //       label: '1w'         
    //    },
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

    // Default configs
    var defaultConfigs = [
        {
            graphDiv: document.getElementById("graph_1"), // The div element for the first plot
            keys: ['PT1_Pressure', 'PT2_Pressure', 'FT1_Flow'], // List of keys related to the plot
            y2keys: ['PT2_Pressure', 'FT1_Flow'],
            selectedRange: 60 * 60 * 1000,
            activeRangeSelectorIndex: 1,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Pressure/Flow",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption,
                },
                yaxis: {
                    title: "PT-1 Pressure [bar]",
                    range: [4.5, 4.9]//[4.9, 5.01] // 5.05, 5.15 
                },
                //remove this if we don't have a second y axis 
                yaxis2: {
                    title: "PT-2 [bar] & Flow [t/hr]", // Use the title from y2_plot1
                    overlaying: 'y', // Overlay on the primary y-axis
                    side: 'right', // Position the y2 axis on the right side
                    range: [0.3, 2.8] // 0.95, 2.51 Set the range from y2_plot1
                }
            }
        },
        {
            graphDiv: document.getElementById("graph_2"), // The div element for the first plot
            keys: ['UT1_Depth', 'LT1_Level', 'PT5_Depth'], // List of keys related to the plot
            y2keys: ['PT5_Depth'],
            selectedRange: 8 * 60 * 60 * 1000,
            activeRangeSelectorIndex: 3,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Detector Level",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption
                },
                yaxis: {
                    title: "Detector Level [m]",
                    range: [0, 3.315] //[3.296, 3.33] // 3.305
                },
                yaxis2: {
                    title: "Detector Level, PT-5 [m]", // Use the title from y2_plot1
                    overlaying: 'y', // Overlay on the primary y-axis
                    side: 'right', // Position the y2 axis on the right side
                    range: [0, 3.18] //[3.08, 3.18] // 3.1 Set the range from y2_plot1
                }
            }
        },
        {
            graphDiv: document.getElementById("graph_3"), // The div element for the first plot
            keys: ['UT1_Conductivity', 'QC1_Conductivity', 'QC2_Conductivity', 'TDS','Salinity'], // List of keys related to the plot
            y2keys: ['UT1_Conductivity','TDS'],
            selectedRange: 12 * 60 * 60 * 1000,
            activeRangeSelectorIndex: 4,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Water Quality",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption
                },
                yaxis: {
                    title: "QC* Water Quality [μS/cm] & Salinity",
                    range: [0, 10.2] // 0.2
                },
                //remove this if we don't have a second y axis 
                yaxis2: {
                    title: "UT-1 Water Quality & TDS [a.u.]", // Use the title from y2_plot1
                    overlaying: 'y', // Overlay on the primary y-axis
                    side: 'right', // Position the y2 axis on the right side
                    range: [100, 300] //[60, 220] // [2, 6.8] // Set the range from y2_plot1
                }
            }
        },
        {
            graphDiv: document.getElementById("graph_4"), // The div element for the first plot
            keys: ['UT1_Temperature','QC1_Temperature','QC2_Temperature'], // List of keys related to the plot
            selectedRange: 24 * 60 * 60 * 1000,
            activeRangeSelectorIndex: 5,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Water Temperature",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption
                },
                yaxis: {
                    title: "Water temp [°C]",
                    range: [10.5, 16] // 14
                },
            }
        },
        {
            graphDiv: document.getElementById("graph_5"), // The div element for the first plot
            keys: ['PT3_Level', 'MixTank_Low', 'MixTank_High'], // List of keys related to the plot
            y2keys: ['MixTank_Low', 'MixTank_High'],
            selectedRange: 60 * 60 * 1000,
            activeRangeSelectorIndex: 1,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Retention Tank",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption
                },
                yaxis: {
                    title: "Retention Tank PT3 [m]",
                    range: [0.1, 2]
                },
                //remove this if we don't have a second y axis 
                yaxis2: {
                    title: "'On/Off", // Use the title from y2_plot1
                    overlaying: 'y', // Overlay on the primary y-axis
                    side: 'right', // Position the y2 axis on the right side
                    range: [-0.5, 1.5] // Set the range from y2_plot1
                }
            }
        },
        {
            graphDiv: document.getElementById("graph_6"), // The div element for the first plot
            keys: ['LeakDetector'], // List of keys related to the plot
            selectedRange: 12 * 60 * 60 * 1000,
            activeRangeSelectorIndex: 4,
            data: [], // Initially an empty array for data
            layout: {
                title: {
                    text: "Leak Detector",
                    font: { size: 16 },
                    yanchor: 'top',
                    xanchor: 'center',
                    y: 0.95, // Adjust this value to move the title down
                    x: 0.5, // Center the title horizontally
                },
                xaxis: {
                    title: "Time/ UTC",
                    rangeselector: rangeSelectorOption
                },
                yaxis: {
                    title: "On/Off",
                    range: [-0.5, 1.5]
                },
            }
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
