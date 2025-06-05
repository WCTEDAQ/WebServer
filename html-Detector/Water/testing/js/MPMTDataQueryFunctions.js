 //copied from Ben's code in monitoring.js this queries the SQL and returns the table
 function getTable(command) { //generic funcion for returning SQL table

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

 async function getTimeDataForDevice(deviceName, time_low, time_high) {
   const selectedDevice = deviceName; // Fixed device value
   console.log("Selected Device: ", selectedDevice); // Log the selected device

   if (time_low === null) {
      var command = "select * from monitoring where device like '" + selectedDevice + "' order by time desc limit 100";
      console.log("select SQL command: ", command);
   } else {
      //time option needs to be a string to specify only get data after the last available data
      //this command is used to update and append
      var command = "select * from monitoring where device like '" + selectedDevice + "' and time>'" + time_low + "' and time<'" + time_high + "' order by time asc;  ";
      console.log("select SQL command: ", command);
   }
 
    // Call getTable command asynchronously
    try {
       const result = await getTable(command);
       console.log("Got table")
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
            // console.log(jsondata);
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
       console.log("Processed data")

       return [xdata, ydata];

    } catch (error) {
       console.error("Error fetching data:", error);
       alert("An error occurred while fetching data. Please try again.");
       return [new Map(), new Map()]; // Return empty maps on error
    }
 }