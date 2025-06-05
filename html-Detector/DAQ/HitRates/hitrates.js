"use strict;"

import { GetPSQLTable, GetPSQL } from "/includes/functions.js";

var updateinterval;          // timer for background updates
var plotTraces = new Map();  // names of traces on each plot
var dataMap = new Map();     // map of plot to array of plotly data structures
var lastupdates = new Map(); // map of trace names to last data time
var updatingMap = new Map(); // guard to prevent multiple update calls overlapping
var plotTypes = new Map();   // map of plot name to kind of plot (i.e. what code draws it)
var layoutMap = new Map();

// and the set of plots - should match div names
var plots=["hit_rate","heatmap"];

if (document.readyState !== 'loading'){
	//console.log("already loaded, initing");
	Init();
} else {
	//console.log("page still loading, waiting to finish...");
	document.addEventListener("DOMContentLoaded", function () {
		//console.log("page loaded, initing");
		Init();
	});
}

// helper function to transpose 2D array for heatmap (absorbance history)
function transpose(matrix) {
	return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function Init(){
	
	// key is plot name, value is an array of monitoring data JSON keys that will become traces
	plotTraces.set('hit_rate',['1']);
	plotTraces.set('heatmap',['heatmap']);
	
	plotTypes.set('hit_rate','TS');     // 1D time series plot
	plotTypes.set('heatmap','HM');      // 2D heatmap time series
	
	makeplots();
	
	// register action to take when auto-update is checked
	document.getElementById("autoUpdate").addEventListener("change", (event) => {
		
		if(event.currentTarget.checked){
			let refreshrate = document.getElementById("refreshRate").value;
			if(refreshrate<1) refreshrate=1;
			updateinterval = setInterval(updateplots, refreshrate*1000);
			// since this doesn't fire immediately, call it now:
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
	
	if(document.getElementById("autoUpdate").checked){
		let refreshrate = document.getElementById("refreshRate").value;
		updateinterval = setInterval(updateplots, refreshrate*1000);
	}
	
};

//function to generate plotly plots
function makeplots(){
	
	for(const plotname of plots){
		if(plotTypes.get(plotname)==='TS') makeplot(plotname);
		else if(plotTypes.get(plotname)==='HM') makeheatmap(plotname);
	}
	
	return;
}

function updateplots(){
	
	console.log("updating plots");
	for(const plotname of plots){
		if(plotTypes.get(plotname)==='TS') updateplot(plotname);
		else if(plotTypes.get(plotname)==='HM') makeheatmap(plotname);
	}
	
	return;
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
	
	// fetch the set of traces to plot
	if(!plotTraces.has(plotname)){
		console.error("No traces for plot "+plotname);
		return;
	}
	//const traces = plotTraces.get(plotname);
	// FIXME update to support adding multiple
	const traces = [document.getElementById("mpmtid").value];
	
	// get the number of values to plot in each trace
	// TODO add alternative limit based on time range rather than number of DB rows
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	// array of trace objects
	let data = [];
	try {
		for(const trace of traces){ // traces are MPMT IDs
			
			var command = `select time,data from monitoring where device='hit_rates' AND time >= now() - INTERVAL '3 hour' order by time desc LIMIT ${numrows}`;
			
			//console.log("makeplots submitting query "+command);
			const resultstring = await GetPSQL(command);
			//console.log(`makeplots got query result '${resultstring}'`);
			if(resultstring.trim()===''){
				// no data
				continue;
			}
			
			// turn JSON string into object
			const result = JSON.parse(resultstring);
			// result should be an array of Objects, one element for each row
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			let xarr = [];
			let yarr = [];
			for(const row of result){
				// each row is an object with 'time' and 'data' members
				const rowdata = row.data;
				//console.log("rowdata is:");
				//console.log(rowdata);
				
				// but each data member is a map of time bin to array of hit counts on each MPMT
				for(const timebin in rowdata){
					//console.log(`pushing time bin '${timebin}', hitrates:`);
					//console.log(rowdata[timebin]);
					let ts = Date.parse(timebin);
					if(isNaN(ts)){
						ts=timebin;
					} else {
						ts = new Date(ts).toISOString();
					}
					xarr.push(ts);
					if(rowdata[timebin].hasOwnProperty(trace)){
						//console.log(`pushing hit count for ${trace} of ${rowdata[timebin][trace]}`);
						yarr.push(rowdata[timebin][trace]);
					} else {
						//console.log(`pushing hit count for ${trace} of none`);
						yarr.push(0);
					}
				}
				
			}
			console.log(`had ${xarr.length} timestamps and ${yarr.length} hit counts`);
			
			data.push({
				name: trace,
				//mode: 'lines',        // 'mode' aka 'type'
				//mode: 'markers',
				mode:'lines+markers', //  aka 'scatter'
				x: xarr,
				y: yarr
			});
			
			// make a note of the last datapoint time for identifying new data
			lastupdates.set(plotname+':'+trace, result.at(0).time);
			//console.log("setting last update of trace "+trace+" at "+result.at(0).time);
			
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
		graphdiv.innerHTML="";
		
		//console.log(`making history plot with data:`);
		//console.log(data);
		//console.log(`and layout`);
		//console.log(layout);
		Plotly.newPlot(graphdiv, data, layout);
		
	} catch(err){
		console.error(err);
	}
	
};

//function to update plot
async function updateplot(plotname){
	//return;
	
	if(updatingMap.has(plotname) && updatingMap.get(plotname)==='true') return;
	updatingMap.set(plotname,true);
	//console.log(`checking for new data for plot ${plotname}...`);
	
	// return if given no name
	if(!plotname){
		return;
	}
	
	const graphdiv = document.getElementById(plotname);
	if(!graphdiv){
		console.error("Uknown plot "+plotname);
		return;
	}
	
	// fetch the set of traces to plot
	if(!plotTraces.has(plotname)){
		console.error("No traces for plot "+plotname);
		return;
	}
	//const traces = plotTraces.get(plotname);
	// FIXME update to support adding multiple
	const traces = [document.getElementById("mpmtid").value];
	
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	let data = dataMap.get(plotname);
	
	try {
		
		let tracei=0;
		for(const trace of traces){
			
			const last=lastupdates.get(plotname+':'+trace);
			//console.log("got last update of trace "+trace+" at "+last);
			// must have been an error generating this plot first time, need to make not update
			if(typeof(last) === 'undefined'){
				updatingMap.set(plotname,false);
				return makeplot(plotname);
			}
			
			var command = `select time,data from monitoring where device='hit_rates' AND time >'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			
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
			
			let xarr = [];
			let yarr = [];
			for(const row of result){
				// each row should be a dictionary of times mapping to a dictionary of MPMTID -> hits in 67ms
				for(const [timebin,hitmap] of Object.entries(row.data)){
					let ts = Date.parse(timebin);
					if(isNaN(ts)){
						ts=timebin;
					} else {
						ts = new Date(ts).toISOString();
					}
					//console.log(`next ts is ${ts}`);
					xarr.push(ts);
					if(hitmap.hasOwnProperty(trace) && !isNaN(hitmap[trace])){
						yarr.push(hitmap[trace]);
					} else {
						yarr.push(0);
					}
				}
			}
			
			//console.log(`new x data:`);
			//console.log(xarr);
			//console.log(`old x data:`);
			//console.log(data[tracei].x);
			data[tracei].x = xarr.concat(data[tracei].x);
			//console.log(`concatenated:`);
			//console.log(data[tracei].x);
			data[tracei].y = yarr.concat(data[tracei].y);
			
			// truncate to history length
			data[tracei].x = data[tracei].x.slice(0,numrows);
			//console.log(`sliced:`);
			//console.log(data[tracei].x);
			data[tracei].y = data[tracei].y.slice(0,numrows);
			
			lastupdates.set(plotname+':'+trace, result.at(0).time);
			
			tracei++;
			
		}
		
		// tell plotly the data has changed
		let layout=layoutMap.get(plotname);
		layout.datarevision = Math.random();
		
		// update the plot
		Plotly.react(graphdiv,data,layout);
		
		//console.log("done updating plot");
		
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
		fixedrange: false,
		autorange: true,
		uirevision: true,
	},
	yaxis: {
		fixedrange: false,
		autorange: true,
		uirevision: true,
	},
};

// ===========================================

async function makeheatmap(plotname){
	
	//console.log(`making heatmap ${plotname}`);
	// return if given no name
	if(!plotname){
		return;
	}
	
	if(updatingMap.has(plotname) && updatingMap.get(plotname)==='true') return;
	updatingMap.set(plotname,true);
	
	// get the div
	const graphdiv = document.getElementById(plotname);
	if(!graphdiv){
		console.error("Uknown plot "+plotname);
		return;
	}
	
	// fetch the set of traces to plot
	if(!plotTraces.has(plotname)){
		console.error("No traces for plot "+plotname);
		return;
	}
	const traces = plotTraces.get(plotname);
	
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	let data;
	if(dataMap.has(plotname)){
		data = dataMap.get(plotname);
	} else {
		data = {};
		data.name = 'Hits in 67ms';
		data.type = 'heatmap';
		data.x = [];
		data.y = [];
		data.z = [];
		for(let i=0; i<132; ++i){
			data.y.push(i);
			data.z.push([]);
		}
		dataMap.set(plotname, data);
	}
	
	try {
		
		// get the updated set of timestamps
		let command;
		let last;
		if(lastupdates.has(plotname)){
			last=lastupdates.get(plotname);
			command = `select time,data from monitoring where device='hit_rates' AND time >'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
		} else {
			command = `select time,data from monitoring where device='hit_rates' AND time >= now() - INTERVAL '1 hour' order by time desc LIMIT ${numrows}`;
		}
		let resultstring = await GetPSQL(command);
		if(resultstring.trim()===''){
			//console.log("no new data");
			return;
		}
		
		// convert to JSON Object
		let result = JSON.parse(resultstring);
		// result should be an array of monitoring rows
		if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
			throw new Error("timestamp query result not array");
		}
		
		//console.log(`setting last updated time for ${plotname}:${trace} to ${result.at(0).time}`);
		lastupdates.set(plotname, result[0].time);
		
		// loop over returned rows. merge in the nested loop as rows are arbitrary, each may contain many time bins
		let xarr = [];
		let zarr = [];
		for(let row of result){
			// each row should be a dictionary of times mapping to a dictionary of MPMTID -> hits in 67ms
			for(const [timebin,hitmap] of Object.entries(row.data)){
				let ts = Date.parse(timebin);
				if(isNaN(ts)){
					ts=timebin;
				} else {
					ts = new Date(ts).toISOString();
				}
				xarr.push(ts);
				for(let mpmti=0; mpmti<132; ++mpmti){
					if(typeof(zarr[mpmti]) === 'undefined') zarr[mpmti] = [];
					if(hitmap.hasOwnProperty(mpmti) && !isNaN(hitmap[mpmti])){
						zarr[mpmti].push(hitmap[mpmti]);
					} else {
						zarr[mpmti].push(0);
					}
				}
			}
		}
		
		//console.log(`data.z is `);
		//console.log(data.z);
		//console.log(`zarr is `);
		//console.log(zarr);
		data.x = xarr.concat(data.x);
		data.z = transpose(transpose(zarr).concat(transpose(data.z)));
		//console.log(`combined is`);
		//console.log(data.z);
		
		// truncate to history length
		//console.log(`data x is:`);
		//console.log(data.x);
		data.x = data.x.slice(0,numrows);
		//console.log(`after slice:`);
		//console.log(data.x);
		data.z = data.z.slice(0,numrows);
		//data.z = transpose(data.z);
		
		
		/*
		const newdata = {
			x: tarr,
			y: idarr,
			z: zarr
		};
		*/
		
		dataMap.set(plotname, data);
		
		// update layout
		if(!layoutMap.has(plotname)){
			let layout = structuredClone(layoutT);
			layout.title = plotname;
			layout.yaxis.type = 'linear';
			layout.xaxis.type = 'date';
			layout.xaxis.autorange = true;
			layout.yaxis.autorange = true;
			layoutMap.set(plotname, layout);
		}
		
		// force zoom of z axis. For some reason we do this on the data not the layout???
		//data.zauto = true;
		//data.zmin=1.0;
		//data.zmax=maxzval;
		// likewise colour palette
		data.autocolorscale = false; // do not use default colour palette
		data.colorscale = 'YlGnBu'; // Blues, Cividis, Viridis, Hot, Jet, Greens, Portland... etc
		// https://plotly.com/javascript/colorscales/#ylgnbu-colorscale
		//data.zsmooth='best'; // or 'fast' or 'False'
		
		const layout=layoutMap.get(plotname);
		
		// just in case, clear the div
		Plotly.purge(graphdiv);
		graphdiv.innerHTML="";
		//console.log(`making heatmap with data`);
		//console.log(data);
		//console.log(`and layout`);
		//console.log(layout);
		Plotly.newPlot(graphdiv, [data], layout);
		
	}
	catch(err) {
		console.error(err);
		graphdiv.innerHTML = `<h3>Error: ${err}</h3>`;
	};
	
	updatingMap.set(plotname,false);
}
