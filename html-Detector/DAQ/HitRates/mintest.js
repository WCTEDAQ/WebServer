"use strict;"

import { GetPSQL } from "/includes/functions.js";

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

async function Init(){
	
	//const trace='sol_temp_0';
	//const command = `select time,data->'${trace}' as val from monitoring where device='GAD' order by time desc LIMIT 10`;
	
	const plotname = 'gad_275_A';
	const command = `select data, draw_options from rootplots where name='${plotname}' order by time desc limit 1`;
	
	console.log("makeplots submitting query "+command);
	const resultstring = await GetPSQL(command);
	console.log("got result "+resultstring);
	let result;
	try {
		result = JSON.parse(resultstring);
	} catch(err){
		console.error(err);
		return;
	}
	console.log("parsed results: ");
	console.log(result);
	result.forEach((row) => {
		console.log("row: ");
		console.log(row);
	});
	
}
