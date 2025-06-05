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
var plotNames = new Map();   // map of plot label to plot name
var layoutMap = new Map();

// and the set of plots - should match div names
var plots=["primary","level2","level1","t0_counts","tx_counts","mu_lead","hodo_0","hodo_1","tof_0","tof_1"];

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
	plotTraces.set('primary',['TDCT00','XTRIG','LASER']);
	plotTraces.set('level2',['TP','TP nH','TP xTOF']);
	plotTraces.set('level1',['T0 L1','HODO','T0T2L1','TOFR','TOFL']);
	plotTraces.set('t0_counts',['T0-0L','T0-0R','T0-1L','T0-1R']);
	plotTraces.set('tx_counts',['T2','HC-2','T4-L','T4-R','T3']);
	plotTraces.set('mu_lead',['MuT-L','MuT-R','PbG']);
	plotTraces.set('hodo_0',['HD-0','HD-1','HD-2','HD-3','HD-4','HD-5','HD-6','HD-7']);
	plotTraces.set('hodo_1',['HD-8','HD-9','HD-A','HD-B','HD-C','HD-D','HD-E']);
	plotTraces.set('tof_0',['TOF-0','TOF-1','TOF-2','TOF-3','TOF-4','TOF-5','TOF-6','TOF-7']);
	plotTraces.set('tof_1',['TOF-8','TOF-9','TOF-A','TOF-B','TOF-C','TOF-D','TOF-E','TOF-F']);
	
	plotTypes.set('primary','TS');     // 1D time series plot
	plotTypes.set('level2','TS');
	plotTypes.set('level1','TS');
	plotTypes.set('t0_counts','TS'); 
	plotTypes.set('tx_counts','TS');
	plotTypes.set('mu_lead','TS');
	plotTypes.set('hodo_0','TS');
	plotTypes.set('hodo_1','TS');
	plotTypes.set('tof_0','TS');
	plotTypes.set('tof_1','TS');

	plotNames.set('primary','Main Trigger, External Trigger, Laser, T3');     // 1D time series plot
	plotNames.set('level2','Level 2 Outputs');
	plotNames.set('level1','Level 1 Outputs');
	plotNames.set('t0_counts','T0 Counts'); 
	plotNames.set('tx_counts','Other Scintillators');
	plotNames.set('mu_lead','Mu Tagger and Lead Glass');
	plotNames.set('hodo_0','Hodoscope Counts, Group 1');
	plotNames.set('hodo_1','Hodoscope Counts, Group 2');
	plotNames.set('others','T4, Hole Counters, Muon Tag, Lead Glass');
	plotNames.set('tof_0','TOF Counts, Group 1');
	plotNames.set('tof_1','TOF Counts, Group 2');
	
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

        if(document.getElementById("autoUpdate").checked){
                let refreshrate = document.getElementById("refreshRate").value;
                updateinterval = setInterval(updateplots, refreshrate*1000);
        }

	
};

//function to generate plotly plots
function makeplots(){
	
	for(const plotname of plots){
		if(plotTypes.get(plotname)==='TS') makeplot(plotname);
	}
	
	return;
}

function updateplots(){
	
	for(const plotname of plots){
		//console.log(`updating plot ${plotname} of type ${plotTypes.get(plotname)}`);
		if(plotTypes.get(plotname)==='TS') updateplot(plotname);
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
			
			var command = `select time,data->'${trace}' as val from monitoring where device='BeamCounters' order by time desc LIMIT ${numrows}`;
			
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
				mode: 'lines',        // 'mode' aka 'type'
				//mode: 'markers',
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
			layout.title = plotNames.get(plotname);
			layout.xaxis.type = 'date';
			layoutMap.set(plotname, layout);
		}
		layout.yaxis.type = 'log';
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
			
			var command = `select time,data->'${trace}' as val from monitoring where device='BeamCounters' and time>'${last.valueOf()}' order by time desc LIMIT ${numrows}`;
			
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
		type: 'log',
	},
};

// ===========================================

