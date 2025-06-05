import { fetchWaterMonitoringJSON, mapDataToTraces } from "../js/fetchData.js";
import { historySelectOptions, setDefaultPlotConfigs } from "../js/plotConfig.js";
import { makeHistoryPlot } from "../js/plotUtils.js";

// Set current date and time for inputs
export function setNow(elementId) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    document.getElementById(elementId).value = now;
    checkInputs();
}

// Function to check if all inputs are selected
export function checkInputs() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;

    const displayPlotButton = document.getElementById('displayPlotButton');
    if (startDateTime && endDateTime && plotType) {
        displayPlotButton.disabled = false;
    } else {
        displayPlotButton.disabled = true;
    }
}

export async function displayPlot() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;
    const plot = document.getElementById('plot');

    const sqlStartDateTime = startDateTime + ":00";
    const sqlEndDateTime = endDateTime + ":00";

    console.log(`Selected Inputs, startDateTime: ${sqlStartDateTime}, endDateTime: ${sqlEndDateTime}, plotType: ${plotType}`);

    let plotConfigs = [ ...setDefaultPlotConfigs(historySelectOptions, plot) ]

    const data = await fetchWaterMonitoringJSON(sqlStartDateTime, sqlEndDateTime);
    const [xData, yData] = await mapDataToTraces(data);

    // Get the selected graphDiv from plot type
    const config = plotConfigs.find(config => config.layout.title.text === plotType);

    makeHistoryPlot(config, xData, yData);
}