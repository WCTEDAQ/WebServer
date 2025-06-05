import { GetSDTable } from '/includes/functions.js';
var status_div = document.getElementById('status');

var updateinterval = setInterval(GetData, 5000);
const name = "Water_PLC"
GetData();

function GetData(){
    GetSDTable(name, true).then(function(result){
	
	
	const titleRow = document.createElement("tr");
	
	// Array of title names
	const titles = ["", "IP", "Port", "Name", "Status"];
	
	// Create and append the title cells
	for (const title of titles) {
	    const titleCell = document.createElement("td");
	    titleCell.textContent = title;
	    titleRow.appendChild(titleCell);
	}
	
	// Add the title row to the table
	result.insertBefore(titleRow, result.firstChild);
	
	// Center the table within its container
	result.style.margin = "auto";
	result.style.border = "1px solid black"; // Add a border of 1px solid black
	result.style.borderCollapse = "collapse"; // Optional: Collapses the border into a single border
	result.style.backgroundColor = "lightblue"; // Sets the background color of the table
	
	const cells = result.getElementsByTagName("td");
	for (const cell of cells) {
	    cell.style.border = "1px solid black"; // Add a border to each cell
	    cell.style.padding = "8px"; // Optional: Add some padding to improve readability
	}
	status_div.innerHTML = "";
	status_div.appendChild(result);
	// Optional: Add some styles to the table container
	status_div.style.width = "80%"; // Set the container width to 80% of its parent element
	status_div.style.padding = "20px"; // Add some padding for better presentation

    });

}
