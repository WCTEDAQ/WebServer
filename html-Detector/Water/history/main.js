import { checkInputs, checkCompareInputs, setNow, displayPlot, comparePlots, updateComparePlotTypeSelectOptions } from "./utils.js";

// Add event listeners
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('startDateTime').addEventListener('input', checkInputs);
    document.getElementById('endDateTime').addEventListener('input', checkInputs);
    document.getElementById('plotType').addEventListener('change', () => {
        checkInputs();
        updateComparePlotTypeSelectOptions();
    });
    document.getElementById('comparePlotTypeSelect').addEventListener('change', checkCompareInputs);
    // Add async wrapper to handle the click event properly
    document.getElementById('displayPlotButton').addEventListener('click', async () => {
        try {
            await displayPlot(); // Await the async function to handle it properly
        } catch (error) {
            console.error("An error occurred while displaying the plot:", error);
        }

        updateComparePlotTypeSelectOptions();

    });
    document.getElementById('comparePlotsButton').addEventListener('click', async() => {
        try {
            await comparePlots();
        } catch (error) {
            console.error("An error occured while comparing the plots:", error);
        }
    });
    document.getElementById('startDateTime').nextElementSibling.addEventListener('click', () => setNow('startDateTime'));
    document.getElementById('endDateTime').nextElementSibling.addEventListener('click', () => setNow('endDateTime'));
    
    // Initialize Flatpickr on date and time inputs
    flatpickr("#startDateTime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });

    flatpickr("#endDateTime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });


    // Initialize the page with an empty plot
    Plotly.newPlot('plot', [], { layout: { height: 500, responsive: true } });
});