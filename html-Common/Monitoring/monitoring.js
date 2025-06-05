"use strict;"
import { GetPSQLTable, GetPSQL } from "/includes/functions.js";

var last;
var updateinterval;
var lastkeydevice;
var lastplotdevice;
var output = document.getElementById("output");
var tableselect = document.getElementById("tableselect");
var data =[];
var drawnDevices = new Set();
var select = document.querySelector('select');
var graphDiv = document.getElementById("graph"); 
var updating=false;
var abandonupdate=false;
var traces=new Set();

//update dropdown called on startup
updatedropdown();

//function for updating dropdown box with monitoring sources
function updatedropdown(){
	
	console.log("fetching monitoring sources...");
	select.disabled = true;
	document.getElementById("device_dropdown_status").innerText='working...';
	
	//var command="SELECT distinct(device) from monitoring where time>'2025-02-15'"
	var command="with recursive t(n) as ( select min(device) from monitoring union all select (select monitoring.device from monitoring where monitoring.device > n order by monitoring.device limit 1) from t where n is not null) select n from t;";
	gettable(command).then(function(result){
		
		console.log("got devices from DB, updating drop-down");
		output.innerHTML = result;
		var table = document.getElementById("table");
		
		for( var i=1; i < table.rows.length; i++){    
			tableselect.options.add(new Option( table.rows[i].innerText, table.rows[i].innerText));
		}
		
		tableselect.selectedIndex=-1;
		output.innerHTML = "";
		console.log("done updating devices drop-down");
		select.disabled = false;
		document.getElementById("device_dropdown_status").innerText='';
		tableselect.dispatchEvent(new Event("change"));
		
	},
	function(error){
		console.error(error);
		select.disabled = false;
		document.getElementById("device_dropdown_status").innerText=error;
	});
	return;
}

async function get_keys(device){
	if(!device) return;
	if(device==lastkeydevice) return;
	console.log(`fetching keys for device ${device}`);
	lastkeydevice=device;
	const keys_dropdown = document.getElementById('keys_dropdown');
	keys_dropdown.innerHTML=""; // clear existing options
	keys_dropdown.disabled = true;
	document.getElementById("keys_dropdown_status").innerText='working...'; // for some reason this never shows??? ohh probably because its async?
	
	const command=`SELECT distinct field FROM ( select jsonb_object_keys(data) as field from monitoring where device='${device}' and time>'2025-02-15') as subquery`;
	
	try {
		GetPSQL(command).then( (result) => {
			console.log(`got set of keys for ${device}, updating traces list...`);
			if(result.trim()==='') throw new Error(`found no JSON keys for monitoring device ${device}`);
			const keys = JSON.parse(result);
			if(typeof(keys) === 'undefined' || !Array.isArray(keys) || !keys.length){
				throw new Error(`found no JSON keys for monitoring device ${device}: ${result}`);
			}
			for(const key of keys){
				keys_dropdown.options.add(new Option(key['field'],key['field']));
			}
			console.log(`done populating traces list`);
			keys_dropdown.disabled=false;
			document.getElementById("keys_dropdown_status").innerText='';
		});
	} catch(err){
		console.error(err);
		document.getElementById("keys_dropdown_status").innerText=err;
	}
	
	return;
}

//generic funcion for returning SQL table
function gettable(command){
	console.log(`running query '${command}'...`);
	let result = GetPSQLTable(command, 'root', 'daq', true);
	return result;
}

// actions to take when dropdown changes
select.addEventListener('change', function(){
	if(tableselect.selectedIndex==-1) return;
	console.log(`change of device...`);
	traces.clear();
	document.getElementById('trace_list').innerHTML = '';
	get_keys(select.options[select.selectedIndex].value);
	return;
});

document.getElementById("clearTraceList").addEventListener("click", () => {
	for(const trace of traces){
		console.log(`trace: ${trace}`);
		const btnName = "btn_"+trace;
		RemoveTrace(btntrace);
	}
	traces.clear();
});

document.getElementById("add_trace").addEventListener("click", () => {
	const kdd = document.getElementById("keys_dropdown");
	if(kdd.selectedIndex==-1) return;
	const trace = kdd.options[kdd.selectedIndex].value;
	const traces_table = document.getElementById("trace_list");
	const btnID = "btn_"+trace;
	const rowstring=`<tr><td>${trace}</td><td><button id=\"${btnID}\">X</button></td></tr>`;
	traces_table.insertAdjacentHTML('beforeend', rowstring);
	document.getElementById(btnID).addEventListener("click", () => { RemoveTrace(btnID); });
	traces.add(trace);
	return;
});

function RemoveTrace(trace){
	if(!trace) return;
	trace = trace.substring(4); // trim leading 'btn_'
	console.log(`removing trace ${trace}`);
	traces.delete(trace);
	drawnDevices.delete(trace);
	const devtrace=select.options[select.selectedIndex].value+":"+trace;
	if(typeof(graphDiv.data)!='undefined'){
		for(let i=0; i<graphDiv.data.length; ++i){
			if(graphDiv.data[i].name===devtrace){
				Plotly.deleteTraces(graphDiv,i);
				break;
			}
		}
	}
	const traces_table = document.getElementById("trace_list");
	let rows = traces_table.getElementsByTagName("tr");
	for(let i=0; i<rows.length; ++i){
		if(rows[i].cells[0].innerText.trim()===trace.trim()){
			traces_table.deleteRow(i);
			break;
		}
	}
	
	return;
}

document.getElementById("do_plot").addEventListener("click", () => {
	
	const device = select.options[select.selectedIndex].value;
	if(device!=lastplotdevice){
		data = [];
		lastplotdevice=device;
	}
	makeplot();
	
	if(document.getElementById("autoUpdate").checked){
		let refreshrate = document.getElementById("refreshRate").value;
		if(refreshrate<1) refreshrate=1;
		updateinterval = setInterval(updateplot, refreshrate*1000);
	}
	return;
	
});

// action to take when auto-update is checked
document.getElementById("autoUpdate").addEventListener("change", (event) => {
	
	if(tableselect.selectedIndex==-1) return;
	
	if(event.currentTarget.checked){
		let refreshrate = document.getElementById("refreshRate").value;
		if(refreshrate<1) refreshrate=1;
		updateinterval = setInterval(updateplot, refreshrate*1000);
		// since this doesn't fire immediately, call it now
		updateplot();
	}
	else {
		clearInterval(updateinterval);
	}
	
});

// action to take when auto-update refresh rate is changed
document.getElementById("refreshRate").addEventListener("change", (event) => {
	
	if(tableselect.selectedIndex==-1) return;
	
	if(document.getElementById("autoUpdate").checked){
		let refreshrate = document.getElementById("refreshRate").value;
		if(refreshrate<1) refreshrate=1;
		clearInterval(updateinterval);
		updateinterval = setInterval(updateplot, refreshrate*1000);
		// since this doesn't fire immediately, call it now
		updateplot();
	}
	
});

// action to take when history length is changed
document.getElementById("historyLength").addEventListener("change", (event) => {
	
	if(tableselect.selectedIndex==-1) return;
	
	// if history length has reduced, we just need to drop points,
	// which can be done by calling trimplot
	// but if history length has been increased, we need to fetch older data,
	// which our regular calls to 'updateplot' will not do.
	// simplest is just to re-run makeplot.
	const numrows = document.getElementById("historyLength").value;
	if( data.length == 0 || data[0].x.length < numrows ){
		makeplot();
	} else {
		trimplot();
	}
	
});

//function to generate plotly plot
function makeplot(){
	
	try {
		
		// Get the selected option
		if (select.options.length <= 0){
			return;
		}
		
		var selectedOption = select.options[select.selectedIndex];
		const device = selectedOption.value;
		
		/*
		// check if the selected option is already drawn
		if(drawnDevices.has(device)){
			// maybe the user has un-checked the 'draw on same plot' option and wants to clear other traces
			if(document.getElementById("same").checked || (graphDiv.data != undefined && graphDiv.data.length ==1)){
				console.log(`skipping already drawn option ${device}`);
				return;
			}
		}
		*/
		
		let tracelist="";
		for(const trace of traces){
			if(!drawnDevices.has(device+":"+trace)){
				let sanitised_key = trace.replace(/ /g,"_");
				//const regex = new RegExp("\\W",g); // could also be passed as first arg in following, same thing but more explicit
				sanitised_key = sanitised_key.replace(/\W/g, '');  // \W = a regex match for all non-(alphanumerics plus underscore)
				if(tracelist.trim()!='') tracelist += ", ";
				tracelist += `data->'${trace}' as ${sanitised_key}`; // as spaces cause postgres errors
			}
		}
		
		// unregister the plot for updating while we alter it
		clearInterval(updateinterval);
		
		// check if the plot is actively undergoing an update
		if(updating){
			abandonupdate=true; // tell it not to bother
			// (prevents an existing async callback overwriting our graph div)
		}
		
		// TODO add alternative limit based on time range rather than number of rows?
		let numrows = document.getElementById("historyLength").value;
		if(numrows <= 0) numrows = 200;
		//var command = `select time,${tracelist} from monitoring where time>now() - interval '1 day' AND device='${device}' order by time desc LIMIT ${numrows}`;
		var command = `select time,${tracelist} from monitoring where time>'2025-02-20' AND device='${device}' order by time desc LIMIT ${numrows}`;
		
		//console.log(`makeplot submitting query '${command}'`);
		//gettable(command).then(function(result){
		GetPSQL(command).then( (output) => {
			//console.log(`makeplot got query result '${output}'`);
			
			/*
			output.innerHTML=result;
			var table = document.getElementById("table");
			table.style.display = "none";
			*/
			if(output.trim()===''){
				//throw new Error("no data to plot"); does not get caught
				console.error("no data to plot");
				return;
			}
			const result = JSON.parse(output);
			// result should be an array of Objects, each with a set of 'time' and trace keys
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			var xdata= new Map();
			var ydata= new Map();
			
			// SQL query returns time descending (most recent first, seems sensible as that's the most relevant data)
			// but to append new data on update calls, we want to be able to push (append to back), so data arrays
			// needs to be ordered with earliest data first. So parse the sql response from last to first
			//for( var i=1; i< table.rows.length; i++){
			//for( var i=table.rows.length-1; i>0 ; i--){
			for(let i=result.length-1; i>=0; i--){
				const jsondata = result[i];
				
				//let jsonstring = table.rows[i].cells[2].innerText;
				//var jsondata = JSON.parse(table.rows[i].cells[2].innerText);
				//let xval = table.rows[i].cells[0].innerText.slice(0,-3);
				
				let xval = jsondata['time'];
				
				for (let key in jsondata) {
					if(key=='time') continue;
					
					//if( i == 1 ){
					if(!xdata.has(key)){
						
						xdata.set(key,[xval]);
						ydata.set(key,[jsondata[key]]);
						
					} else {
						xdata.get(key).push(xval);
						ydata.get(key).push(jsondata[key]);
						
					}
				}
			}
			
			//data = [];
			for(let [key, value] of xdata){
				
				data.push({
					name: device + ":" +key,
					//mode: 'lines',        // 'mode' aka 'type'
					mode: 'markers',
					//mode:'lines+markers', //  aka 'scatter'
					x: value,
					y: ydata.get(key)
				});
				
			}
			
			/*
			// remove any existing plot to prevent memory leaks
			while(!document.getElementById("same").checked && graphDiv.data != undefined && graphDiv.data.length >0){
				Plotly.deleteTraces(graphDiv, 0);
				//   Plotly.deleteTraces(graphDiv, [0]);
			}
			//Plotly.deleteTraces('graph', 0);
			*/
			
			/*
			if(!document.getElementById("same").checked){
				//console.log("purge it");
				Plotly.purge(graphDiv);
				drawnDevices.clear();
			}
			*/
			
			for(const trace of traces){
				drawnDevices.add(device+":"+trace);
			}
			
			// react does not seem to work, seems like 'react' does not make new traces, just updates existing ones?
			if(true || drawnDevices.size==1){
				//console.log("new plot time");
				Plotly.purge(graphDiv);
				Plotly.newPlot(graphDiv, data, layout); // Plotly.plot ...?
			} else {
				//console.log("updated plot time");
				layout.datarevision = Math.random();
				Plotly.react(graphDiv, data, layout);
			}
			
			// only set this back to false at the end of the thenable,
			// when our callback has finished (or on error)
			//console.log("done making plot");
			
		});
		
	} catch(err){
		console.error(err);
	}
	
};


//function to update plot
function updateplot(){
	
	if(updating) return;
	updating=true;
	console.log("checking for new data...");
	
	try {
		// Get the selected option
		if (select.options.length == 0) return;
		var selectedOption = select.options[select.selectedIndex];
		const device = selectedOption.value;
		
		let tracelist="";
		for(const trace of traces){
			let sanitised_key = trace.replace(/ /g,"_");
			sanitised_key = sanitised_key.replace(/\W/g, '');  // \W = a regex match for all non-(alphanumerics plus underscore)
			if(tracelist.trim()!='') tracelist += ", ";
			tracelist += `data->'${trace}' as ${sanitised_key}`; // as spaces cause postgres errors
		}
		
		//var command = "select '*' from monitoring where source=\""+ selectedOption.value + "\" and time>to_timestamp(" + ((last.valueOf())/1000.0) + ")  ";
		
		//last = data[0].x[0];
		last=data[0].x.at(-1);
		console.log(`timestamp of last retreived data: ${last}`);
		
		let numrows = document.getElementById("historyLength").value;
		if(numrows <= 0) numrows = 200;
		
		//var command = `select * from monitoring where device='${selectedOption.value}' and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
		var command = `select time,${tracelist} from monitoring where device='${device}' and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
		
		//console.log("updateplot submitting query");
		//gettable(command).then(function(result){
		GetPSQL(command).then((output)  => {
			if(abandonupdate){
				abandonupdate=false;
				//console.log("abandoning update");
				updating=false;
				return;
			}
			
			//console.log("updateplot processing result");
			
			/*
			output.innerHTML=result;
			var table = document.getElementById("table");
			table.style.display = "none";
			*/
			if(output.trim()===''){
				console.log("no new data");
				updating=false;
				return;
				//throw new Error("no data to plot");
			}
			console.log("update plot response:");
			console.log(output);
			const result = JSON.parse(output);
			// result should be an array of Objects, each with a set of 'time' and trace keys
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			var xdata= new Map();
			var ydata= new Map();
			
			//for( var i=1; i< table.rows.length; i++){
			//for( var i=table.rows.length-1; i>0 ; i--){
			for(let i=result.length-1; i>=0; i--){
				const jsondata = result[i];
				
				/*
				const xval = table.rows[i].cells[0].innerText.slice(0,-3);
				let jsonstring = table.rows[i].cells[2].innerText;
				var jsondata = JSON.parse(table.rows[i].cells[2].innerText);
				*/
				const xval = jsondata['time'];
				
				for (let key in jsondata) {
					if(key==='time') continue;
					
					//if( i == 1 ){
					if(!xdata.has(key)){
						
						xdata.set(key,[xval]);
						ydata.set(key,[jsondata[key]]);
						
					} else {
						
						xdata.get(key).push(xval);
						ydata.get(key).push(jsondata[key]);
						
					}
				}
			}
			
			
			for(let [key, value] of xdata){
				for( var i=0; i< data.length; i++){
					if(data[i].name == selectedOption.value + ":" +key){ 
						data[i].x=data[i].x.concat(value);
						data[i].y=data[i].y.concat(ydata.get(key));
						// since we only append data we need to truncate to numrows at most
						data[i].x = data[i].x.slice(-numrows);
						data[i].y = data[i].y.slice(-numrows);
					}
				}
			}
			
			/*
			while(!document.getElementById("same").checked && graphDiv.data != undefined && graphDiv.data.length >0){
				Plotly.deleteTraces(graphDiv, 0);
				  Plotly.deleteTraces(graphDiv, [0]);
			}
			*/
			
			// tell plotly the data has changed
			layout.datarevision = Math.random();
			
			//Plotly.plot(graphDiv, data, layout);
			//Plotly.redraw(graphDiv,data, layout); -- deprecated in ~2017? can't find it in the docs
			Plotly.react(graphDiv,data,layout); // -- believe this may be the more efficient current way
			
			// reset updating at end of callback
			updating=false;
			
			//console.log("done updating plot");
			
		});
		
	} catch(err){
		console.error(err);
		// reset this on error
		updating=false;
	}
	
};

// function to drop older values when history length is reduced
function trimplot(){
	
	const numrows = document.getElementById("historyLength").value;
	
	// update trace data arrays
	for( var i=0; i< data.length; i++){
		data[i].x = data[i].x.slice(-numrows);
		data[i].y = data[i].y.slice(-numrows);
	}
	
	// tell plotly the data has changed
	layout.datarevision = Math.random();
	
	// trigger redraw
	Plotly.react(graphDiv,data,layout);
	
}

// TODO tie these up with history length
// XXX must be defined before 'layout' as layout references this in rangeselector
var selectorOptions = {
	buttons: [ {
		step: 'hour',
		stepmode: 'backward',
		count: 1,
		label: '1hr'
	}, {
		step: 'hour',
		stepmode: 'backward',
		count: 3,
		label: '3hr'
	}, {
		step: 'hour',
		stepmode: 'backward',
		count: 6,
		label: '6hr'
	}, {
		step: 'hour',
		stepmode: 'backward',
		count: 12,
		label: '12hr'
	}, {
		step: 'day',
		stepmode: 'backward',
		count: 1,
		label: '1d'
	}, {
		step: 'day',
		stepmode: 'backward',
		count: 3,
		label: '3d'
	}, {
		step: 'week',
		stepmode: 'backward',
		count: 1,
		label: '1w'
	}, {
		step: 'week',
		stepmode: 'backward',
		count: 2,
		label: '2w'
	}, {
		step: 'month',
		stepmode: 'backward',
		count: 1,
		label: '1m'
	}, {
		step: 'month',
		stepmode: 'backward',
		count: 6,
		label: '6m'
	}, {
		step: 'year',
		stepmode: 'todate',
		count: 1,
		label: 'YTD'
	}, {
		step: 'year',
		stepmode: 'backward',
		count: 1,
		label: '1y'
	}, {
		step: 'all'
	}],
};

//plot options
var layout = {
	title: 'Monitor Time series with range slider and selectors',
	hovermode: 'closest',
	xaxis: {
		rangeselector: selectorOptions,
		rangeslider: {}, // add a scrubber on the bottom
		uirevision: true,
	},
	yaxis: {
		fixedrange: false,
		autorange: true,
		//rangemode: 'nonnegative',
		uirevision: true,
	},
	/*
	// demo: add a horizontal cursor
	shapes: [
		{
			type: 'line',
			xref: 'paper',
			x0: 0,
			x1: 1,
			y0: 2500000,
			y1: 2500000,
			opacity: 0.2,
			line: {
				color: 'rgb(255, 0, 0)',
				//width: 4,
				//dash: 'dashdot'
			},
			// N.B. shape labels stopped working since 2.32.0 ¬_¬
			label: {
				text: 'Alarm Threshold',
				xanchor: 'right',
				textposition: 'end', // or 'start' or 'middle'
				font: { size: 10, color: 'red' },
				//yanchor: 'bottom',
			},
		},
	],
	*/
	dragmode: 'zoom', // required with a rangeslider to stop it restricting zoom to x-axis only
};
