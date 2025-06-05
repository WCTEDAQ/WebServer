import { fetchWaterMonitoringJSON, mapDataToTraces } from "../js/fetchData.js";
import { historySelectOptions, setDefaultPlotConfigs } from "../js/plotConfig.js";
import { makeHistoryPlot, compareHistoryPlots } from "../js/plotUtils.js";

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

export function checkCompareInputs() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;
    const comparePlotType = document.getElementById('comparePlotTypeSelect').value;

    const comparePlotsButton = document.getElementById('comparePlotsButton');
    if (startDateTime && endDateTime && plotType && comparePlotType && plotType !== comparePlotType) {
        comparePlotsButton.disabled = false;
    } else {
        comparePlotsButton.disabled = true;
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

export async function comparePlots() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    const plotType = document.getElementById('plotType').value;
    const comparePlotType = document.getElementById('comparePlotTypeSelect').value;
    const plot = document.getElementById('plot');

    const sqlStartDateTime = startDateTime + ":00";
    const sqlEndDateTime = endDateTime + ":00";

    console.log(`Selected Inputs, startDateTime: ${sqlStartDateTime}, endDateTime: ${sqlEndDateTime}, plotType: ${plotType}, comparePlotType: ${comparePlotType}`);

    let plotConfigs = [ ...setDefaultPlotConfigs(historySelectOptions, plot) ]

    const data = await fetchWaterMonitoringJSON(sqlStartDateTime, sqlEndDateTime);
    const [xData, yData] = await mapDataToTraces(data);

    const selectedPlotTypes = [plotType, comparePlotType];
    var selectedPlotsConfigs = [];

    selectedPlotTypes.forEach(type => {
        // Get the selected graphDiv from plot type
        const config = plotConfigs.find(config => config.layout.title.text === type);
        selectedPlotsConfigs.push(config);
    });

    console.log(selectedPlotsConfigs);
    compareHistoryPlots(selectedPlotsConfigs, xData, yData);
}

export function updateComparePlotTypeSelectOptions() {
    const plotTypeSelect = document.getElementById('plotType');
    const selectedPlotType = plotTypeSelect.value;

    if (selectedPlotType) {
        const comparePlotsContainer = document.getElementById('comparePlotsContainer');
        comparePlotsContainer.style.display = 'flex';

        const comparePlotTypeSelect = document.getElementById('comparePlotTypeSelect');
        comparePlotTypeSelect.innerHTML = '<option value="">Select Plot Type to Compare</option>';
        // Populate the new select with options except the selected plot type
        const options = Array.from(plotTypeSelect.options).filter(option => option.value && option.value !== selectedPlotType);
        options.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.textContent;
            comparePlotTypeSelect.appendChild(newOption);
        });
    }
}