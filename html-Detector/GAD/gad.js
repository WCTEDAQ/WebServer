"use strict;"

import { GetPSQLTable, GetPSQL } from "/includes/functions.js";
import { parse, draw, redraw, resize, cleanup, createTGraph, createTMultiGraph } from 'https://root.cern/js/latest/modules/main.mjs';
import { create } from 'https://root.cern/js/latest/modules/core.mjs';

var updateinterval;          // timer for background updates
var plotTraces = new Map();  // names of traces on each plot
var dataMap = new Map();     // map of plot to array of plotly data structures
var lastupdates = new Map(); // map of trace names to last data time
var updatingMap = new Map(); // guard to prevent multiple update calls overlapping
var plotTypes = new Map();   // map of plot name to kind of plot (i.e. what code draws it)
var layoutMap = new Map();

// and the set of plots - should match div names
//var plots=["sol_temps","flow_rate","leak_sense","led_intensity","last_traces","last_absorbance","absorbance_history"];
var plots=["sol_temps","flow_rate","leak_sense","led_intensity","last_traces","last_absorbance","absorbance_UV","absorbance_Vis"];

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

function Init(){
	
	// key is plot name, value is an array of monitoring data JSON keys that will become traces
	plotTraces.set('sol_temps',['sol_temp_0', 'sol_temp_1','sol_temp_2']);
	plotTraces.set('flow_rate',['flow_rate']);
	plotTraces.set('leak_sense',['leak_check']);
	plotTraces.set('led_intensity',['gad_arm_275_A_intensity', 'ref_arm_275_A_intensity', 'gad_arm_White_intensity', 'ref_arm_White_intensity']);
	plotTraces.set('last_traces',['gad_275_A','gad_White', 'ref_275_A','ref_White']);
	plotTraces.set('last_absorbance',['absorbance_275_A','absorbance_White']);
	plotTraces.set('absorbance_history',['absorbance_275_A','absorbance_White']);
	plotTraces.set('absorbance_UV',['absorbance_275_A']);
	plotTraces.set('absorbance_Vis',['absorbance_White']);
	
	plotTypes.set('sol_temps','TS');     // 1D time series plot
	plotTypes.set('flow_rate','TS');
	plotTypes.set('leak_sense','TS');
	plotTypes.set('led_intensity','TS');
	plotTypes.set('last_traces','ROOT'); // ROOT plot
	plotTypes.set('last_absorbance','ROOT');
	plotTypes.set('absorbance_history','HM'); // plotly heatmap
	plotTypes.set('absorbance_UV','HM');
	plotTypes.set('absorbance_Vis','HM');
	
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
		if(plotTypes.get(plotname)==='TS') makeplot(plotname);
		else if(plotTypes.get(plotname)==='ROOT') makerootplot(plotname);
		else if(plotTypes.get(plotname)==='HM') makeheatmap(plotname);
	}
	
	return;
}

function updateplots(){
	
	for(const plotname of plots){
		//console.log(`updating plot ${plotname} of type ${plotTypes.get(plotname)}`);
		if(plotTypes.get(plotname)==='TS') updateplot(plotname);
		else if(plotTypes.get(plotname)==='ROOT') makerootplot(plotname); // just replaces it
		else if(plotTypes.get(plotname)==='HM') makeheatmap(plotname);
	}
	
	return;
}

// helper function to extract an array of x- or y-vals from an array of x-y pairs
function unpack(rows, key){
	return rows.map(function(row) { return row[key]; });
}

// helper function to transpose 2D array for heatmap (absorbance history)
function transpose(matrix) {
	return matrix[0].map((col, i) => matrix.map(row => row[i]));
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
	const traces = plotTraces.get(plotname);
	
	// get the number of values to plot in each trace
	// TODO add alternative limit based on time range rather than number of DB rows
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	// array of trace objects
	let data = [];
	try {
		for(const trace of traces){
			
			var command = `select time,data->'${trace}' as val from monitoring where device='GAD' order by time desc LIMIT ${numrows}`;
			
			//console.log("makeplots submitting query "+command);
			const resultstring = await GetPSQL(command);
			//console.log("makeplots got query result "+resultstring);
			
			// turn JSON string into object
			const result = JSON.parse(resultstring);
			// result should be an array of Objects, each with a 'time' and 'val' member
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("query result not array");
			}
			
			data.push({
				name: trace,
				//mode: 'lines',        // 'mode' aka 'type'
				mode: 'markers',
				//mode:'lines+markers', //  aka 'scatter'
				x: unpack(result, 'time'),
				y: unpack(result, 'val')
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
		
		Plotly.newPlot(graphdiv, data, layout);
		
	} catch(err){
		console.error(err);
	}
	
};

//function to update plot
async function updateplot(plotname){
	
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
	const traces = plotTraces.get(plotname);
	let data = dataMap.get(plotname);
	
	let numrows = document.getElementById("historyLength").value;
	if(numrows <= 0) numrows = 200;
	
	try {
		
		let tracei=0;
		for(const trace of traces){
			
			const last=lastupdates.get(plotname+':'+trace);
			//console.log("got last update of trace "+trace+" at "+last);
			
			var command = `select time,data->'${trace}' as val from monitoring where device='GAD' and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			
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
			//data[tracei].x.concat(unpack(result, 'time'));
			//data[tracei].y.concat(unpack(result, 'val'));
			
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
		uirevision: true,
	},
	yaxis: {
		fixedrange: false,
		autorange: true,
		uirevision: true,
	},
};

// ===========================================

async function makerootplot(plotname){
	
	// return if given no name
	if(!plotname){
		return;
	}
	
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
	
	// remove any existing plots - without calling this plots will overlay (kinda like 'same')
	//cleanup(plotname);
	
	try {
		
		let data = [];
		
		for(var trace of traces){
			
			//trace = trace.trim();
			
			const command = `select data, draw_options from rootplots where name='${trace}' order by time desc limit 1`;
			const resultstring = await GetPSQL(command);
			//console.log("ROOT resultstring was:");
			//console.log(resultstring);
			
			// convert to JSON Object -- note that we MUST use JSROOT's 'parse' method NOT JSON.Parse
			// even though the latter converts to a JSON Object, the resulting Object cannot be plot!
			let result = parse(resultstring);
			
			// extract elements
			var graphjson = result[0].data;
			var drawoptions = result[0].draw_options;
			
			//console.log(`data for trace '${trace}' was:`);
			//console.log(graphjson);
			//console.log(`draw_options are '${drawoptions}`);
			
			// draw  (FIXME can we use 'redraw' for updates?)
			// by default this overlays so is somewhat like 'same' draw option
			//await draw(plotname, graphjson, drawoptions);
			
			// but as we know that doesn't match axes, for which we need a multigraph
			/*
			const graph = createTGraph(graphjson.fNpoints,graphjson.fX,graphjson.fY);
			data.push(graph);
			data[data.length-1].fTitle = trace;
			data[data.length-1].fName = trace;
			//draw(plotname, graph, drawoptions);
			*/
			
			data.push({
				name: trace,
				mode: 'lines',          // 'mode' aka 'type'
				//mode: 'markers',
				//mode:'lines+markers', //  aka 'scatter'
				x: graphjson.fX,
				y: graphjson.fY
			});
			
		}
		/*
		//let mgraph = createTMultiGraph(graphs); // doesn't accept an array, just multiple args....
		const mgraph = create('TMultiGraph');
		mgraph.fTitle = plotname;
		mgraph.fName = plotname;
		for (let i = 0; i < data.length; ++i) mgraph.fGraphs.Add(data[i], '');
		await draw(plotname, mgraph, drawoptions);
		// TODO legends?
		*/
		
		dataMap.set(plotname, data);
		
		// update layout
		if(!layoutMap.has(plotname)){
			let layout = structuredClone(layoutT);
			layout.title = plotname;
			layout.xaxis.type = 'linear';
			if(plotname==='last_absorbance'){ // FIXME bad hack, ugh
				// set initial y zoom
				layout.yaxis.autorange = false;
				layout.yaxis.range=[0.85, 1.05];
			}
			layoutMap.set(plotname, layout);
		}
		const layout=layoutMap.get(plotname);
		
		// just in case, clear the div
		Plotly.purge(graphdiv);
		
		Plotly.newPlot(graphdiv, data, layout);
		
	}
	catch(err) {
		document.getElementById(plotname).innerHTML = `<h3>Error: ${err}</h3>`;
	};
}

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
	
	const downselect = " AND version % 10 = 0"; // to increase history length without having to plot excessive data
	
	let data = [];
	let wlarr;
	if(dataMap.has(plotname)){
		data = dataMap.get(plotname);
		wlarr = data[0].y;
	}
	
	try {
		
		// loop over traces (UV, VIS)
		let tracei=0;
		for(var trace of traces){
			
			// only get the wavelength array the first time
			if(typeof(wlarr)==='undefined'){
				
				const command = `select data->'fX' as wlarr from rootplots where name='${trace}' ${downselect} order by time desc limit 1`;
				const resultstring = await GetPSQL(command);
				
				// convert to JSON Object
				let result = JSON.parse(resultstring);
				if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
					throw new Error("wlarr query result not array");
				}
				
				// extract array
				wlarr = result[0].wlarr;
			}
			
			// get the updated set of timestamps
			let command;
			let last;
			if(lastupdates.has(plotname+':'+trace)){
				last=lastupdates.get(plotname+':'+trace);
				command = `select time from rootplots where name='${trace}' ${downselect} and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			} else {
				command = `select time from rootplots where name='${trace}' ${downselect} order by time desc LIMIT ${numrows}`;
			}
			let resultstring = await GetPSQL(command);
			if(resultstring.trim()===''){
				//console.log("no new data");
				continue;
			}
			
			// convert to JSON Object
			let result = JSON.parse(resultstring);
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("timestamp query result not array");
			}
			
			let tarr;
			if(data.length > tracei){
				// get existing data
				tarr = data[tracei].x;
				// append new data
				tarr = unpack(result,'time').concat(tarr);  
				// tarr.unshift(unpack(result,'time')[0]); may also work as we're only likely to be inserting one new measurement
				// could maybe also use spread operator: tarr.unshift(...unpack(result,'time'));
				// truncate to history length
				tarr = tarr.slice(0,numrows);
			} else {
				tarr = unpack(result,'time');
			}
			
			//////////////////////////////
			
			// get the absorbances
			if(typeof(last)!=='undefined'){
				command = `select data->'fY' as abs from rootplots where name='${trace}' ${downselect} and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			} else {
				command = `select data->'fY' as abs from rootplots where name='${trace}' ${downselect} order by time desc LIMIT ${numrows}`;
			}
			resultstring = await GetPSQL(command);
			
			result = JSON.parse(resultstring);
			if(typeof(result) === 'undefined' || !Array.isArray(result) || !result.length){
				throw new Error("timestamp query result not array");
			}
			
			// unpack it to get a 2D array rather than an array of objects with a single key that is an array
			let zarr = unpack(result, 'abs');
			
			// if we're updating, fetch and add to the old data
			if(data.length>tracei){
				// we need to transpose the old data back to have rows representing measurements
				// before we can append new measurements
				let zarr_old = transpose(data[tracei].z);
				zarr = zarr.concat(zarr_old);
			}
			
			// truncate to history length
			if(zarr.length > numrows) zarr = zarr.slice(0,numrows);
			
			// we need to transpose it to get each row (x axis) as time series
			zarr = transpose(zarr);
			
			const newdata = {
				name: trace,
				type: 'heatmap',
				x: tarr,
				y: wlarr,
				z: zarr
			};
			
			if(data.length>tracei) data[tracei] = newdata;
			else data.push(newdata);
			
			//console.log(`last updated time for ${plotname}:${trace} set to ${tarr.at(0)}`);
			lastupdates.set(plotname+':'+trace, tarr.at(0));
			
			++tracei;
		}
		dataMap.set(plotname, data);
		
		// update layout
		if(!layoutMap.has(plotname)){
			let layout = structuredClone(layoutT);
			layout.title = plotname;
			layout.yaxis.type = 'linear';
			layout.xaxis.type = 'date';
			// set initial zoom range
			layout.xaxis.autorange = true;
			layout.yaxis.autorange = false;
			if(plotname==='absorbance_UV'){
				layout.yaxis.range=[260, 300];
			} else {
				layout.yaxis.range=[430, 600];
			}
			layoutMap.set(plotname, layout);
		}
		
		// force zoom of z axis. For some reason we do this on the data not the layout???
		//data[0].zauto = false;
		data[0].zmin=0.8;
		data[0].zmax=1.1;
		// likewise colour palette
		data[0].autocolorscale = false; // do not use default colour palette
		data[0].colorscale = 'YlGnBu'; // Blues, Cividis, Viridis, Hot, Jet, Greens, Portland... etc
		// https://plotly.com/javascript/colorscales/#ylgnbu-colorscale
		//data[0].zsmooth='best'; // or 'fast' or 'False'
		
		const layout=layoutMap.get(plotname);
		
		// just in case, clear the div
		Plotly.purge(graphdiv);
		
		Plotly.newPlot(graphdiv, data, layout);
		
	}
	catch(err) {
		console.error(err);
		document.getElementById(plotname).innerHTML = `<h3>Error: ${err}</h3>`;
	};
	
	updatingMap.set(plotname,false);
}
