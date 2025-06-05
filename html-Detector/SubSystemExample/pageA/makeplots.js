"use strict;"

import { GetPSQL } from "/includes/functions.js";

var updateinterval;          // timer for background updates
var plotTraces = new Map();  // names of traces on each plot
var dataMap = new Map();     // map of plot to array of plotly data structures
var lastupdates = new Map(); // map of trace names to last data time
var updatingMap = new Map(); // guard to prevent multiple update calls overlapping
var layoutMap = new Map();

// the set of plots - should match div names
var plots=["flow_rate"];

if (document.readyState !== 'loading'){
	Init();
} else {
	document.addEventListener("DOMContentLoaded", function () {
		Init();
	});
}

function Init(){
	
	// key is plot name, value is an array of monitoring data JSON keys that will become traces
	plotTraces.set('flow_rate',['flow_rate']);
	
	makeplots();
	
	// register action to take when auto-update is checked
	document.getElementById("autoUpdate").addEventListener("change", (event) => {
		
		if(event.currentTarget.checked){
			let refreshrate = document.getElementById("refreshRate").value;
			if(refreshrate<1) refreshrate=1;
			updateinterval = setInterval(updateplots, refreshrate*1000);
			// since this doesn't fire immediately, call it now
			updateplots();
		}
		else {
			clearInterval(updateinterval);
		}
		
	});
	
	// register action to take when auto-update refresh rate is changed
	document.getElementById("refreshRate").addEventListener("change", (event) => {
		
		
		if(document.getElementById("autoUpdate").checked){
			let refreshrate = document.getElementById("refreshRate").value;
			if(refreshrate<1) refreshrate=1;
			clearInterval(updateinterval);
			updateinterval = setInterval(updateplots, refreshrate*1000);
			// since this doesn't fire immediately, call it now
			updateplots();
		}
		
	});
	
	// register action to take when history length is changed
	document.getElementById("historyLength").addEventListener("change", (event) => {
		
		// if history length has reduced, we just need to drop points,
		// which can be done by calling trimplots
		// but if history length has been increased, we need to fetch older data,
		// which our regular calls to 'updateplots' will not do.
		// simplest is just to re-run makeplots.
		const numrows = document.getElementById("historyLength").value;
		if( datalength == 0 || datalength < numrows ){
			makeplots();
		} else {
			trimplots();
		}
		
	});
	
};

//function to generate plotly plots
function makeplots(){
	for(const plotname of plots){
		makeplot(plotname);
	}
	return;
}

function updateplots(){
	for(const plotname of plots){
		updateplot(plotname);
	}
	return;
}

// helper function to extract an array of x- or y-vals from an array of x-y pairs
function unpack(rows, key){
	return rows.map(function(row) { return row[key]; });
}

// function to generate a plot
async function makeplot(plotname){
	
	// return if given no name
	if(!plotname){
		return;
	}
	
	const graphdiv = document.getElementById(plotname);
	if(!graphdiv){
		console.error("Uknown plot "+plotname);
		return;
	}
	
	const device = document.getElementById('device_name').value;
	
	// fetch the set of traces to plot
	if(!plotTraces.has(plotname)){
		console.error("No traces for plot "+plotname);
		return;
	}
	const traces = plotTraces.get(plotname);
	
	// get the number of values to plot in each trace
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	// array of trace objects
	let data = [];
	try {
		for(const trace of traces){
			
			var command = `select time,data->'${trace}' as val from monitoring where device='${device}' order by time desc LIMIT ${numrows}`;
			const resultstring = await GetPSQL(command);
			
			// turn JSON string into object
			const result = JSON.parse(resultstring);
			// result should be an array of Objects, each with a 'time' and 'val' member
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			data.push({
				name: trace,
				mode: 'markers',        // or 'lines'
				x: unpack(result, 'time'),
				y: unpack(result, 'val')
			});
			
			// make a note of the last datapoint time for identifying new data
			lastupdates.set(plotname+':'+trace, result.at(0).time);
			
		}
		dataMap.set(plotname, data);
		
		// update layout
		if(!layoutMap.has(plotname)){
			let layout = structuredClone(layoutT);
			layout.title = plotname;
			layout.xaxis.type = 'date';
			layoutMap.set(plotname, layout);
		}
		const layout=layoutMap.get(plotname);
		
		// just in case, clear the div
		Plotly.purge(graphdiv);
		
		Plotly.newPlot(graphdiv, data, layout);
		
	} catch(err){
		console.error(err);
	}
	
};

//function to update plot
async function updateplot(plotname){
	
	if(updatingMap.has(plotname) && updatingMap.get(plotname)==='true') return;
	updatingMap.set(plotname,true);
	
	// return if given no name
	if(!plotname){
		return;
	}
	
	const graphdiv = document.getElementById(plotname);
	if(!graphdiv){
		console.error("Uknown plot "+plotname);
		return;
	}
	
	const device = document.getElementById('device_name').value;
	
	// fetch the set of traces to plot
	if(!plotTraces.has(plotname)){
		console.error("No traces for plot "+plotname);
		return;
	}
	const traces = plotTraces.get(plotname);
	let data = dataMap.get(plotname);
	
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	try {
		
		let tracei=0;
		for(const trace of traces){
			
			const last=lastupdates.get(plotname+':'+trace);
			
			var command = `select time,data->'${trace}' as val from monitoring where device='${device}' and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			
			const resultstring = await GetPSQL(command);
			if(resultstring.trim()===''){
				// no new data
				continue;
			}
			
			// turn JSON string into object
			const result = JSON.parse(resultstring);
			// result should be an array of Objects, each with a 'time' and 'val' member
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			// prepend the new data (since results are returned newest first)
			data[tracei].x = unpack(result, 'time').concat(data[tracei].x);
			data[tracei].y = unpack(result, 'val').concat(data[tracei].y);
			
			// truncate to history length
			data[tracei].x = data[tracei].x.slice(0,numrows);
			data[tracei].y = data[tracei].y.slice(0,numrows);
			
			lastupdates.set(plotname+':'+trace, data[tracei].x.at(0));
			
			tracei++;
			
		}
		
		// tell plotly the data has changed
		let layout=layoutMap.get(plotname);
		layout.datarevision = Math.random();
		
		// update the plot
		Plotly.react(graphdiv,data,layout);
		
	} catch(err){
		console.error(err);
		// reset this on error
	}
	
	// reset updating at end of callback
	updatingMap.set(plotname,false);
	
};

// function to drop older values when history length is reduced
function trimplots(){
	
	const numrows = document.getElementById("historyLength").value;
	
	// loop over plots
	for(var [plotname, data] of dataMap){
		
		// get the div
		const graphdiv = document.getElementById(plotname);
		if(!graphdiv){
			console.error("Uknown plot "+plotname);
			continue;
		}
		
		// loop over traces on this plot
		for(let i=0; i<data.length; ++i){
			data[i].x = data[i].x.slice(0,numrows);
			data[i].y = data[i].y.slice(0,numrows);
		}
		
		// tell plotly the data has changed
		let layout=layoutMap.get(plotname);
		layout.datarevision = Math.random();
		
		// trigger redraw
		Plotly.react(graphdiv,data,layout);
	}
	
}

//plot options
var layoutT = {
	title: 'Traces',
	hovermode: 'closest',
	xaxis: {
		uirevision: true,
	},
	yaxis: {
		fixedrange: false,
		autorange: true,
		uirevision: true,
	},
};
