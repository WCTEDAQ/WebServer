import { fetchMonitoringJSON, mapDataToTraces } from "./js/fetchData.js";
import { historySelectOptions, setDefaultPlotConfigs } from "./js/plotConfig.js";
import { makeHistoryPlot} from "./js/plotUtils.js";

// Set current date and time for inputs
export function setNow(elementId) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    document.getElementById(elementId).value = now;
    checkInputs();
}

// Function to check if all inputs are selected
export function checkInputs() {
    const mPMTNumber = document.getElementById('mPMTNumber').value;
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;

    const displayPlotButton = document.getElementById('displayPlotButton');
    if (mPMTNumber && startDateTime && endDateTime && plotType) {
        displayPlotButton.disabled = false;
    } else {
        displayPlotButton.disabled = true;
    }
}

export async function displayPlot() {
    const mPMTNumber = document.getElementById('mPMTNumber').value;
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;
    const plot = document.getElementById('plot');

    const sqlStartDateTime = startDateTime + ":00";
    const sqlEndDateTime = endDateTime + ":00";

    console.log(`Selected Inputs, startDateTime: ${sqlStartDateTime}, endDateTime: ${sqlEndDateTime}, plotType: ${plotType}`);

    let plotConfigs = [ ...setDefaultPlotConfigs(historySelectOptions, plot) ]

    // Get the selected graphDiv from plot type
    const config = plotConfigs.find(config => config.layout.title.text === plotType);

    let deviceName = "_PMT" + mPMTNumber;
    const data = await fetchMonitoringJSON(deviceName, config.keys, sqlStartDateTime, sqlEndDateTime);
    const [xData, yData] = await mapDataToTraces(data);

    makeHistoryPlot(config, xData, yData);
}