import {GetPSQL} from '/includes/functions.js';

const dbUser = 'root';
const dbName = 'daq';

export async function fetchMonitoringJSON(deviceName, params, startTime = null, endTime = null) {    
    let query = '';
    let queryParams = '';
    console.log(params)

    for(let param of params) {
        queryParams = queryParams.concat(", data->'", param, "' as ", param, " ");
    }

    query = query.concat("SELECT time, ROW_TO_JSON(a) as data FROM (SELECT time", queryParams, "FROM monitoring WHERE device like '", deviceName, "' AND time > '", startTime, "' AND time < '", endTime, "' ORDER BY time ASC) a");

    try {
        const data = await GetPSQL(query, dbUser, dbName, true);
        if (!data) {
            console.warn('No data fetched from the database.');
            return null;
        }
        try {
            return JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function mapDataToTraces(rows) {
    const xData = []; // Array to store time values
    var yData = new Map();

    if (rows === null || rows.length === 0) {
        return [xData, yData];
    }

    console.log(rows);

    rows.forEach(row => {
        const { time, data } = row;

        // Append time to xData array
        xData.push(time);

        // Parse jsondata if it is a string
        const jsonObj = typeof data === 'string' ? JSON.parse(data) : data;

        // Iterate over keys in jsondata and map them to yData
        for (const [key, value] of Object.entries(jsonObj)) {
            if (!yData.has(key)) {
                yData.set(key, []);
            } 
            yData.get(key).push(value);
        }
    });

    return [xData, yData];
}