// Helper function to format the Date object into the required string format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function formatDateFile(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function getData(deviceName, day) {
// '2025-01-01 00:00:00'
    // var time_low = '2024-11-24 00:00:00';
    // var time_high = '2024-11-27 00:00:00';

    const baseDate = new Date(`2024-11-24 00:00:00`);
    baseDate.setDate(baseDate.getDate() + day)
    
    // Format time_low to match "YYYY-MM-DD 00:00:00"
    const time_low = formatDate(baseDate);

    // Add 1 day to the baseDate for time_high
    baseDate.setDate(baseDate.getDate() + 1); // Increment day by 1
    const time_high = formatDate(baseDate);

 
    //set the range automatically
    var now = new Date();  // Get current time
 
    const [xdata, ydata] = await getTimeDataForDevice(deviceName, time_low, time_high);
    
    for (const key of xdata.keys()) {
        console.log(key);
    }
    // const keysToInclude = [
    //     'pmt0_hvvolval', 'pmt1_hvvolval', 'pmt2_hvvolval', 'pmt3_hvvolval', 'pmt4_hvvolval', 'pmt5_hvvolval', 'pmt6_hvvolval', 'pmt7_hvvolval'
    //     // 'pmt8_hvvolval', 'pmt9_hvvolval', 'pmt10_hvvolval', 'pmt11_hvvolval', 'pmt12_hvvolval', 'pmt13_hvvolval', 'pmt14_hvvolval',
    //     // 'pmt15_hvvolval', 'pmt16_hvvolval', 'pmt17_hvvolval', 'pmt18_hvvolval'
    // ];
    const keysToInclude = [
        'pmt0_hvvolval', 'pmt1_hvvolval', 'pmt2_hvvolval', 'pmt3_hvvolval', 'pmt4_hvvolval', 'pmt5_hvvolval', 'pmt6_hvvolval', 'pmt7_hvvolval',
        'pmt8_hvvolval', 'pmt9_hvvolval', 'pmt10_hvvolval', 'pmt11_hvvolval', 'pmt12_hvvolval', 'pmt13_hvvolval', 'pmt14_hvvolval',
        'pmt15_hvvolval', 'pmt16_hvvolval', 'pmt17_hvvolval', 'pmt18_hvvolval'
    ];
    // const keysToInclude = [
    //     'pmt0_hvvolval'
    //     ];    
    
    // Convert to the desired JSON format
    const result = {};

    for (const key of keysToInclude) {
        if (xdata.has(key) && ydata.has(key)) {
            result[key] = {
            x: xdata.get(key),
            y: ydata.get(key),
        };
        } else {
            console.warn(`Key "${key}" is missing in either xdata or ydata.`);
        }
    }
    
    return JSON.stringify(result, null, 2);

}

const mPMT_ids = [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
    31, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 
    47, 48, 50, 51, 52, 71, 73, 74, 75, 76, 77, 78, 79, 80, 81, 
    82, 83, 84, 85, 86, 87, 89, 91, 92, 93, 94, 95, 96, 97, 98, 
    99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 
    111, 112, 113, 114, 115, 117, 118, 119]
//this is the code which is executed when make waterplots is called
document.addEventListener("DOMContentLoaded", async function () {

    let findMPMTButton = document.getElementById("findMPMTButton");
    findMPMTButton.addEventListener("click", async (event) => {
  
       let mPMTTextBox = document.getElementById("mPMTTextBox");
    //    mPMTNumber = mPMTTextBox.value;
       arr_no = Number(mPMTTextBox.value);
       
    //    const fs = require('fs'); // Import the fs module
    // for(let i=arr_no; i<mPMT_ids.length; i++){  
        for(let i=arr_no; i<mPMT_ids.length; i++){  
            mPMTNumber = mPMT_ids[i];
            try {
                for (let day = 0; day <= 13; day++) {
                    console.log(`Fetching data for device ${mPMTNumber} day ${day}...`);
                    // Get the JSON string from getData
                    const jsonString = await getData("_PMT" + mPMTNumber.toString(), day);
                    console.log(jsonString)
                    
                    if (jsonString) {
                        // Create a Blob with the JSON data
                        const blob = new Blob([jsonString], { type: 'application/json' });
                        //time string for file name
                        const baseDate = new Date(`2024-11-24 00:00:00`);
                        baseDate.setDate(baseDate.getDate() + day)
                        const date = formatDateFile(baseDate)

                        // Create a link to trigger the download
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `hvdata_mPMT${mPMTNumber}_p${date}.json`;

                        // Programmatically click the link to start the download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        console.log(`File data_PMT${mPMTNumber}.json has been saved.`);
                    }
                }
            } catch (error) {
                console.error('Error getting data:', error);
            }
        }
    })
 });