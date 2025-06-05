
async function ajaxcall(options) {
    return new Promise(function (resolve, reject) {
      fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: options.body
      }).then(async function (response) {
        if (options.plain) {
          response.text().then((text) => resolve(text))
          .catch(err => reject(err));
        } else {
          response.json().then(function (json) {
            resolve(json);
          }).catch(err => reject(err));
        }
      }).catch(err => reject(err));
    });
  }

  //TODO: make this pretty
  function spinner(message) {
    return `<div class='mpmtspinner'>${message}</div>`;
  }

const mcccomments = [
  { "mcc": 0, "chan": 2,"comment": "Dead port, possibly can be fixed"},
	{ "mcc": 2, "chan": 0,"comment": "Dead port"},
  { "mcc": 8, "chan": 5,"comment": "Dead port"}
];

const mpmts = [
  {"x":2 ,"y":12 ,"s":200,"id": "mPMT-trigger-00130","cid":130 },
  {"x":2 ,"y":11 ,"s":201,"id": "mPMT-trigger-00131","cid":131 },
  {"x":2 ,"y":10 ,"s":202,"id": "mPMT-trigger-00132","cid":132 },
  {"x":6 ,"y":0 ,"s":17,"id": "mPMT-WUT-00051","cid":51 },
  {"x":7 ,"y":0 ,"s":18,"id": "FD","cid":-1 },
  {"x":8 ,"y":0 ,"s":19,"id": "mPMT-TRI-00114","cid":114 },
  {"x":5 ,"y":1 ,"s":16,"id": "FD","cid":-1 },
  {"x":6 ,"y":1 ,"s":6,"id": "mPMT-WUT-00052","cid":52 },
  {"x":7 ,"y":1 ,"s":7,"id": "mPMT-TRI-00082","cid":82 },
  {"x":8 ,"y":1 ,"s":8,"id": "mPMT-TRI-00096","cid":96 },
  {"x":9 ,"y":1 ,"s":20,"id": "mPMT-TRI-00101","cid":101 },
  {"x":5 ,"y":2 ,"s":15,"id": "mPMT-WUT-00050","cid":50 },
  {"x":6 ,"y":2 ,"s":5,"id": "mPMT-TRI-00117","cid":117 },
  {"x":7 ,"y":2 ,"s":0,"id": "mPMT-TRI-00074","cid":74 },
  {"x":8 ,"y":2 ,"s":1,"id": "mPMT-WUT-00012","cid":12 },
  {"x":9 ,"y":2 ,"s":9,"id": "mPMT-WUT-00002","cid":2, "comment":"fully dead" },
  {"x":5 ,"y":3 ,"s":14,"id": "FD","cid":-1 },
  {"x":6 ,"y":3 ,"s":4,"id": "mPMT-WUT-00046","cid":46 },
  {"x":7 ,"y":3 ,"s":3,"id": "mPMT-TRI-00108","cid":108 },
  {"x":8 ,"y":3 ,"s":2,"id": "mPMT-WUT-00027","cid":27 },
  {"x":9 ,"y":3 ,"s":10,"id": "mPMT-WUT-00011","cid":11 },
  {"x":6 ,"y":4 ,"s":13,"id": "mPMT-WUT-00047","cid":47 },
  {"x":7 ,"y":4 ,"s":12,"id": "FD","cid":-1 },
  {"x":8 ,"y":4 ,"s":11,"id": "mPMT-TRI-00094","cid":94 },
  {"x":0 ,"y":5 ,"s":21,"id": "mPMT-WUT-00045","cid":45},
  {"x":1 ,"y":5 ,"s":22,"id": "mPMT-TRI-00102","cid":102},
  {"x":2 ,"y":5 ,"s":23,"id": "mPMT-TRI-00077","cid":77},
  {"x":3 ,"y":5 ,"s":24,"id": "mPMT-TRI-00100","cid":100},
  {"x":4 ,"y":5 ,"s":25,"id": "mPMT-TRI-00092","cid":92},
  {"x":5 ,"y":5 ,"s":26,"id": "mPMT-TRI-00113","cid":113},
  {"x":6 ,"y":5 ,"s":27,"id": "Empty","cid":-1},
  {"x":7 ,"y":5 ,"s":28,"id": "mPMT-TRI-00083","cid":83},
  {"x":8 ,"y":5 ,"s":29,"id": "mPMT-WUT-00017","cid":17},
  {"x":9 ,"y":5 ,"s":30,"id": "mPMT-TRI-00080","cid":80},
  {"x":10 ,"y":5 ,"s":31,"id": "mPMT-TRI-00073","cid":73},
  {"x":11 ,"y":5 ,"s":32,"id": "Empty","cid":-1},
  {"x":12 ,"y":5 ,"s":33,"id": "mPMT-TRI-00078","cid":78},
  {"x":13 ,"y":5 ,"s":34,"id": "mPMT-WUT-00007","cid":7},
  {"x":14 ,"y":5 ,"s":35,"id": "mPMT-TRI-00112","cid":112},
  {"x":15 ,"y":5 ,"s":36,"id": "mPMT-TRI-00079","cid":79},
  {"x":0 ,"y":6 ,"s":37,"id": "mPMT-WUT-00048","cid":48},
  {"x":1 ,"y":6 ,"s":38,"id": "mPMT-TRI-00105","cid":105},
  {"x":2 ,"y":6 ,"s":39,"id": "mPMT-WUT-00006","cid":6},
  {"x":3 ,"y":6 ,"s":40,"id": "mPMT-TRI-00104","cid":104},
  {"x":4 ,"y":6 ,"s":41,"id": "mPMT-WUT-00019","cid":19},
  {"x":5 ,"y":6 ,"s":42,"id": "mPMT-TRI-00095","cid":95},
  {"x":6 ,"y":6 ,"s":43,"id": "mPMT-WUT-00044","cid":44},
  {"x":7 ,"y":6 ,"s":44,"id": "mPMT-TRI-00107","cid":107},
  {"x":8 ,"y":6 ,"s":45,"id": "Empty","cid":-1},
  {"x":9 ,"y":6 ,"s":46,"id": "mPMT-WUT-00036","cid":36},
  {"x":10 ,"y":6 ,"s":47,"id": "mPMT-WUT-00023","cid":23},
  {"x":11 ,"y":6 ,"s":48,"id": "mPMT-WUT-00039","cid":39},
  {"x":12 ,"y":6 ,"s":49,"id": "mPMT-WUT-00041","cid":41},
  {"x":13 ,"y":6 ,"s":50,"id": "mPMT-WUT-00029","cid":29},
  {"x":14 ,"y":6 ,"s":51,"id": "mPMT-WUT-00043","cid":43},
  {"x":15 ,"y":6 ,"s":52,"id": "mPMT-WUT-00030","cid":30},
  {"x":0 ,"y":7 ,"s":53,"id": "mPMT-WUT-00014","cid":14},
  {"x":1 ,"y":7 ,"s":54,"id": "mPMT-WUT-00031","cid":31},
  {"x":2 ,"y":7 ,"s":55,"id": "mPMT-TRI-00118","cid":118},
  {"x":3 ,"y":7 ,"s":56,"id": "mPMT-WUT-00028","cid":28},
  {"x":4 ,"y":7 ,"s":57,"id": "mPMT-TRI-00115","cid":115},
  {"x":5 ,"y":7 ,"s":58,"id": "mPMT-WUT-00015","cid":15},
  {"x":6 ,"y":7 ,"s":59,"id": "mPMT-WUT-00009","cid":9},
  {"x":7 ,"y":7 ,"s":60,"id": "mPMT-WUT-00026","cid":26},
  {"x":8 ,"y":7 ,"s":61,"id": "mPMT-WUT-00010","cid":10},
  {"x":9 ,"y":7 ,"s":62,"id": "mPMT-WUT-00025","cid":25},
  {"x":10 ,"y":7 ,"s":63,"id": "mPMT-TRI-00119","cid":119, "comment":"SOM led, disconnected"},
  {"x":11 ,"y":7 ,"s":64,"id": "mPMT-WUT-00021","cid":21},
  {"x":12 ,"y":7 ,"s":65,"id": "mPMT-WUT-00038","cid":38},
  {"x":13 ,"y":7 ,"s":66,"id": "mPMT-TRI-00106","cid":106},
  {"x":14 ,"y":7 ,"s":67,"id": "mPMT-WUT-00013","cid":13},
  {"x":15 ,"y":7 ,"s":68,"id": "mPMT-WUT-00003","cid":3},
  {"x":0 ,"y":8 ,"s":69,"id": "mPMT-WUT-00018","cid":18},
  {"x":1 ,"y":8 ,"s":70,"id": "mPMT-WUT-00001","cid":1},
  {"x":2 ,"y":8 ,"s":71,"id": "mPMT-WUT-00024","cid":24},
  {"x":3 ,"y":8 ,"s":72,"id": "mPMT-WUT-00040","cid":40},
  {"x":4 ,"y":8 ,"s":73,"id": "mPMT-WUT-00016","cid":16},
  {"x":5 ,"y":8 ,"s":74,"id": "Empty","cid":-1},
  {"x":6 ,"y":8 ,"s":75,"id": "mPMT-WUT-00032","cid":32},
  {"x":7 ,"y":8 ,"s":76,"id": "mPMT-WUT-00035","cid":35},
  {"x":8 ,"y":8 ,"s":77,"id": "Empty","cid":-1},
  {"x":9 ,"y":8 ,"s":78,"id": "mPMT-WUT-00034","cid":34},
  {"x":10 ,"y":8 ,"s":79,"id": "Empty","cid":-1},
  {"x":11 ,"y":8 ,"s":80,"id": "mPMT-WUT-00042","cid":42},
  {"x":12 ,"y":8 ,"s":81,"id": "mPMT-WUT-00020","cid":20},
  {"x":13 ,"y":8 ,"s":82,"id": "mPMT-WUT-00022","cid":22},
  {"x":14 ,"y":8 ,"s":83,"id": "mPMT-WUT-00033","cid":33},
  {"x":15 ,"y":8 ,"s":84,"id": "mPMT-WUT-00008","cid":8},
  {"x":6 ,"y":9 ,"s":102,"id": "mPMT-TRI-00081","cid":81, "comment":"fully dead"},
  {"x":7 ,"y":9 ,"s":103,"id": "mPMT-TRI-00071","cid":71},
  {"x":8 ,"y":9 ,"s":104,"id": "mPMT-TRI-00109","cid":109},
  {"x":5 ,"y":10 ,"s":101,"id": "mPMT-TRI-00093","cid":93},
  {"x":6 ,"y":10 ,"s":91,"id": "Empty","cid":-1},
  {"x":7 ,"y":10 ,"s":92,"id": "mPMT-TRI-00097","cid":97},
  {"x":8 ,"y":10 ,"s":93,"id": "mPMT-TRI-00085","cid":85},
  {"x":9 ,"y":10 ,"s":105,"id": "mPMT-TRI-00086","cid":86},
  {"x":5 ,"y":11 ,"s":100,"id": "mPMT-TRI-00098","cid":98},
  {"x":6 ,"y":11 ,"s":90,"id": "mPMT-TRI-00099","cid":99},
  {"x":7 ,"y":11 ,"s":85,"id": "Empty","cid":-1},
  {"x":8 ,"y":11 ,"s":86,"id": "mPMT-TRI-00076","cid":76},
  {"x":9 ,"y":11 ,"s":94,"id": "mPMT-TRI-00091","cid":91},
  {"x":5 ,"y":12 ,"s":99,"id": "Empty","cid":-1},
  {"x":6 ,"y":12 ,"s":89,"id": "mPMT-TRI-00089","cid":89},
  {"x":7 ,"y":12 ,"s":88,"id": "mPMT-TRI-00087","cid":87},
  {"x":8 ,"y":12 ,"s":87,"id": "mPMT-TRI-00084","cid":84},
  {"x":9 ,"y":12 ,"s":95,"id": "mPMT-TRI-00075","cid":75},
  {"x":6 ,"y":13 ,"s":98,"id": "mPMT-TRI-00103","cid":103, "comment": "bad clock, disconnected"},
  {"x":7 ,"y":13 ,"s":97,"id": "mPMT-TRI-00111","cid":111},
  {"x":8 ,"y":13 ,"s":96,"id": "mPMT-TRI-00110","cid":110}
];

// updated for modified layout during shutdown (MCC0)
const ppmap = [{"cid": 130, "patchno": -1, "patchport": -1, "slot": -1, "cable": -1, "mccno": 0, "mccchan": 7},
  {"cid": 131, "patchno": -1, "patchport": -1, "slot": -1, "cable": -1, "mccno": 0, "mccchan": 6},
  {"cid": 132, "patchno": -1, "patchport": -1, "slot": -1, "cable": -1, "mccno": 0, "mccchan": 5},
  {"cid": 1, "patchno": 3, "patchport": 24, "slot": 70, "cable": 68, "mccno": 11, "mccchan": 7},
  {"cid": 2, "patchno": 4, "patchport": 1, "slot": 9, "cable": 29, "mccno": -1, "mccchan": -1},
  {"cid": 3, "patchno": 1, "patchport": 10, "slot": 68, "cable": 42, "mccno": 3, "mccchan": 6},
  {"cid": 6, "patchno": 3, "patchport": 14, "slot": 39, "cable": 54, "mccno": 9, "mccchan": 2},
  {"cid": 7, "patchno": 4, "patchport": 12, "slot": 34, "cable": 33, "mccno": 6, "mccchan": 4},
  {"cid": 8, "patchno": 4, "patchport": 15, "slot": 84, "cable": 46, "mccno": 6, "mccchan": 1},
  {"cid": 9, "patchno": 1, "patchport": 16, "slot": 15, "cable": 15, "mccno": 3, "mccchan": 0},
  {"cid": 10, "patchno": 1, "patchport": 19, "slot": 61, "cable": 17, "mccno": 4, "mccchan": 5},
  {"cid": 11, "patchno": 3, "patchport": 6, "slot": 10, "cable": 3, "mccno": -1, "mccchan": -1},
  {"cid": 12, "patchno": 4, "patchport": 5, "slot": 1, "cable": 27, "mccno": 7, "mccchan": 4},
  {"cid": 13, "patchno": 3, "patchport": 10, "slot": 67, "cable": 41, "mccno": 9, "mccchan": 6},
  {"cid": 14, "patchno": 2, "patchport": 24, "slot": 53, "cable": 31, "mccno": 5, "mccchan": 0},
  {"cid": 15, "patchno": 1, "patchport": 7, "slot": 58, "cable": 14, "mccno": 1, "mccchan": 1},
  {"cid": 16, "patchno": 1, "patchport": 11, "slot": 73, "cable": 71, "mccno": 3, "mccchan": 5},
  {"cid": 17, "patchno": 1, "patchport": 20, "slot": 29, "cable": 10, "mccno": 4, "mccchan": 4},
  {"cid": 18, "patchno": 4, "patchport": 18, "slot": 69, "cable": 43, "mccno": 10, "mccchan": 1},
  {"cid": 19, "patchno": 3, "patchport": 21, "slot": 41, "cable": 56, "mccno": 11, "mccchan": 4},
  {"cid": 20, "patchno": 2, "patchport": 20, "slot": 81, "cable": 78, "mccno": 5, "mccchan": 4},
  {"cid": 21, "patchno": 2, "patchport": 23, "slot": 64, "cable": 74, "mccno": 5, "mccchan": 1},
  {"cid": 22, "patchno": 4, "patchport": 17, "slot": 82, "cable": 44, "mccno": 0, "mccchan": 0},
  {"cid": 23, "patchno": 2, "patchport": 4, "slot": 47, "cable": 61, "mccno": 1, "mccchan": 6},
  {"cid": 24, "patchno": 3, "patchport": 23, "slot": 71, "cable": 69, "mccno": 11, "mccchan": 6},
  {"cid": 25, "patchno": 2, "patchport": 16, "slot": 62, "cable": 72, "mccno": 2, "mccchan": 2},
  {"cid": 26, "patchno": 1, "patchport": 12, "slot": 60, "cable": 16, "mccno": 3, "mccchan": 4},
  {"cid": 27, "patchno": 3, "patchport": 17, "slot": 2, "cable": 2, "mccno": 11, "mccchan": 0},
  {"cid": 28, "patchno": 3, "patchport": 12, "slot": 56, "cable": 66, "mccno": 9, "mccchan": 4},
  {"cid": 29, "patchno": 4, "patchport": 13, "slot": 50, "cable": 37, "mccno": 6, "mccchan": 3},
  {"cid": 30, "patchno": 4, "patchport": 6, "slot": 52, "cable": 39, "mccno": 7, "mccchan": 5},
  {"cid": 31, "patchno": 3, "patchport": 3, "slot": 54, "cable": 64, "mccno": 8, "mccchan": 2},
  {"cid": 32, "patchno": 1, "patchport": 5, "slot": 75, "cable": 87, "mccno": 1, "mccchan": 3},
  {"cid": 33, "patchno": 4, "patchport": 3, "slot": 83, "cable": 45, "mccno": 7, "mccchan": 2},
  {"cid": 34, "patchno": 2, "patchport": 12, "slot": 78, "cable": 76, "mccno": 2, "mccchan": 4},
  {"cid": 35, "patchno": 1, "patchport": 6, "slot": 76, "cable": 88, "mccno": 1, "mccchan": 2},
  {"cid": 36, "patchno": 2, "patchport": 14, "slot": 46, "cable": 60, "mccno": 2, "mccchan": 7},
  {"cid": 38, "patchno": 2, "patchport": 2, "slot": 65, "cable": 75, "mccno": -1, "mccchan": -1},
  {"cid": 39, "patchno": 2, "patchport": 3, "slot": 48, "cable": 62, "mccno": 0, "mccchan": 2},
  {"cid": 40, "patchno": 3, "patchport": 16, "slot": 72, "cable": 70, "mccno": 9, "mccchan": 0},
  {"cid": 41, "patchno": 2, "patchport": 1, "slot": 49, "cable": 63, "mccno": -1, "mccchan": -1},
  {"cid": 42, "patchno": 2, "patchport": 22, "slot": 80, "cable": 77, "mccno": 5, "mccchan": 2},
  {"cid": 43, "patchno": 4, "patchport": 8, "slot": 51, "cable": 38, "mccno": 7, "mccchan": 7},
  {"cid": 44, "patchno": 1, "patchport": 14, "slot": 43, "cable": 12, "mccno": 3, "mccchan": 2},
  {"cid": 45, "patchno": 4, "patchport": 4, "slot": 21, "cable": 32, "mccno": 7, "mccchan": 3},
  {"cid": 46, "patchno": 1, "patchport": 9, "slot": 4, "cable": 84, "mccno": 3, "mccchan": 7},
  {"cid": 47, "patchno": 1, "patchport": 15, "slot": 13, "cable": 85, "mccno": 3, "mccchan": 1},
  {"cid": 48, "patchno": 4, "patchport": 19, "slot": 37, "cable": 36, "mccno": 10, "mccchan": 2},
  {"cid": 50, "patchno": 1, "patchport": 3, "slot": 15, "cable": 18, "mccno": 1, "mccchan": 5},
  {"cid": 51, "patchno": 2, "patchport": 19, "slot": 17, "cable": 48, "mccno": -1, "mccchan": -1},
  {"cid": 52, "patchno": 2, "patchport": 13, "slot": 6, "cable": 9, "mccno": 2, "mccchan": 3},
  {"cid": 71, "patchno": 2, "patchport": 18, "slot": 103, "cable": 23, "mccno": 5, "mccchan": 6},
  {"cid": 73, "patchno": 2, "patchport": 7, "slot": 31, "cable": 58, "mccno": -1, "mccchan": -1},
  {"cid": 74, "patchno": 3, "patchport": 18, "slot": 0, "cable": 1, "mccno": 5, "mccchan": 5},
  {"cid": 75, "patchno": 3, "patchport": 20, "slot": 95, "cable": 81, "mccno": 11, "mccchan": 3},
  {"cid": 76, "patchno": 4, "patchport": 7, "slot": 86, "cable": 5, "mccno": 7, "mccchan": 6},
  {"cid": 77, "patchno": 3, "patchport": 11, "slot": 23, "cable": 50, "mccno": 9, "mccchan": 5},
  {"cid": 78, "patchno": 2, "patchport": 21, "slot": 33, "cable": 59, "mccno": 5, "mccchan": 3},
  {"cid": 79, "patchno": 4, "patchport": 2, "slot": 36, "cable": 35, "mccno": 7, "mccchan": 1},
  {"cid": 80, "patchno": 2, "patchport": 6, "slot": 30, "cable": 57, "mccno": -1, "mccchan": -1},
  {"cid": 81, "patchno": 2, "patchport": 10, "slot": 102, "cable": 22, "mccno": -1, "mccchan": -1},
  {"cid": 82, "patchno": 2, "patchport": 9, "slot": 7, "cable": 47, "mccno": 0, "mccchan": 1},
  {"cid": 83, "patchno": 1, "patchport": 13, "slot": 28, "cable": -1, "mccno": 3, "mccchan": 3},
  {"cid": 84, "patchno": 3, "patchport": 4, "slot": 87, "cable": 79, "mccno": 8, "mccchan": 3},
  {"cid": 85, "patchno": 4, "patchport": 14, "slot": 93, "cable": 6, "mccno": 6, "mccchan": 2},
  {"cid": 86, "patchno": 4, "patchport": 21, "slot": 105, "cable": 8, "mccno": 10, "mccchan": 4},
  {"cid": 87, "patchno": 1, "patchport": 8, "slot": 88, "cable": 89, "mccno": 1, "mccchan": 0},
  {"cid": 89, "patchno": 1, "patchport": 1, "slot": 89, "cable": 90, "mccno": 1, "mccchan": 7},
  {"cid": 91, "patchno": 3, "patchport": 19, "slot": 94, "cable": 80, "mccno": 11, "mccchan": 2},
  {"cid": 92, "patchno": 3, "patchport": 9, "slot": 25, "cable": 52, "mccno": 9, "mccchan": 7},
  {"cid": 93, "patchno": 2, "patchport": 17, "slot": 101, "cable": 21, "mccno": 5, "mccchan": 7},
  {"cid": 94, "patchno": 3, "patchport": 5, "slot": 11, "cable": 4, "mccno": 8, "mccchan": 4},
  {"cid": 95, "patchno": 1, "patchport": 17, "slot": 42, "cable": 11, "mccno": 4, "mccchan": 7},
  {"cid": 96, "patchno": 3, "patchport": 13, "slot": 8, "cable": 28, "mccno": 9, "mccchan": 3},
  {"cid": 97, "patchno": 2, "patchport": 15, "slot": 92, "cable": 19, "mccno": 2, "mccchan": 1},
  {"cid": 98, "patchno": 2, "patchport": 5, "slot": 100, "cable": 20, "mccno": -1, "mccchan": -1},
  {"cid": 99, "patchno": 1, "patchport": 22, "slot": 90, "cable": 91, "mccno": 4, "mccchan": 2},
  {"cid": 100, "patchno": 3, "patchport": 22, "slot": 24, "cable": 51, "mccno": 11, "mccchan": 5},
  {"cid": 101, "patchno": 4, "patchport": 24, "slot": 20, "cable": 100, "mccno": 10, "mccchan": 7},
  {"cid": 102, "patchno": 2, "patchport": 11, "slot": 22, "cable": 49, "mccno": 7, "mccchan": 0},
  {"cid": 103, "patchno": 1, "patchport": 23, "slot": 98, "cable": 93, "mccno": 6, "mccchan": 5},
  {"cid": 104, "patchno": 3, "patchport": 1, "slot": 40, "cable": 55, "mccno": 8, "mccchan": 0},
  {"cid": 105, "patchno": 3, "patchport": 7, "slot": 38, "cable": 53, "mccno": 8, "mccchan": 6},
  {"cid": 106, "patchno": 4, "patchport": 16, "slot": 66, "cable": 40, "mccno": 0, "mccchan": 3},
  {"cid": 107, "patchno": 1, "patchport": 4, "slot": 44, "cable": 13, "mccno": 1, "mccchan": 4},
  {"cid": 108, "patchno": 1, "patchport": 2, "slot": 3, "cable": 83, "mccno": 0, "mccchan": 4},
  {"cid": 109, "patchno": 4, "patchport": 20, "slot": 104, "cable": 7, "mccno": 10, "mccchan": 3},
  {"cid": 110, "patchno": 3, "patchport": 8, "slot": 96, "cable": 82, "mccno": 8, "mccchan": 7},
  {"cid": 111, "patchno": 1, "patchport": 24, "slot": 97, "cable": 92, "mccno": 4, "mccchan": 0},
  {"cid": 112, "patchno": 4, "patchport": 22, "slot": 35, "cable": 34, "mccno": 10, "mccchan": 5},
  {"cid": 113, "patchno": 1, "patchport": 18, "slot": 26, "cable": 24, "mccno": 4, "mccchan": 6},
  {"cid": 114, "patchno": 4, "`patchport": 23, "slot": 19, "cable": 30, "mccno": -1, "mccchan": -1},
  {"cid": 115, "patchno": 3, "patchport": 2, "slot": 57, "cable": 67, "mccno": 8, "mccchan": 1},
  {"cid": 117, "patchno": 1, "patchport": 21, "slot": 5, "cable": 85, "mccno": 4, "mccchan": 3},
  {"cid": 118, "patchno": 3, "patchport": 15, "slot": 55, "cable": 65, "mccno": 9, "mccchan": 1},
  {"cid": 119, "patchno": 2, "patchport": 8, "slot": 63, "cable": 73, "mccno": -1, "mccchan": -1},
  {"cid": -1, "patchno": 4, "patchport": 9, "slot": 12, "cable": -1, "mccno": -1, "mccchan": -1},
  {"cid": -1, "patchno": 4, "patchport": 10, "slot": 14, "cable": -1, "mccno": -1, "mccchan": -1},
  {"cid": -1, "patchno": 4, "patchport": 11, "slot": 16, "cable": -1, "mccno": -1, "mccchan": -1},
  {"cid": -1, "patchno": -1, "patchp`ort": -1, "slot": 18, "cable": -1, "mccno": -1, "mccchan": -1}];

function id_to_short(n) {
    if (n.toUpperCase().startsWith("MPMT")) {
        return n.split("-")[2];
    } 
    return n;
}

async function getSQLJSON(sqlquery) {
  var body = "user=root&db=daq&command=" + sqlquery;
  h = new Headers()
  h.append("Content-Type", "application/x-www-form-urlencoded")
  return ajaxcall({
    "url": "/cgi-bin/sqlqueryjson.cgi",
    "headers": h,
    "method": "POST",
    "body": body
  });
}

async function getCSVJSON(sqlquery) {
  var body = "";
  h = new Headers();
  h.append("Content-Type", "application/x-www-form-urlencoded")
  res = await ajaxcall({
    "url": "/cgi-bin/tablecontent5.cgi",
    "headers": h,
    "method": "GET",
    "plain": true
  });
  ndata = [];
  resdata = res.split("\n");
  resdata.map((line) => {
    line = line.split(",");
    if (line.length>=5) {
      // take from: 38,192.168.10.107,60000,TPMT7,Idle
      obj = {
        'ip': line[1],
        'port': line[2],
        'device': line[3],
        'status': line[5]
      };
      ndata.push(obj);
    }
  });
  return ndata;
}

async function getBootInfo() {
  return getSQLJSON("SELECT DISTINCT ON (device) device, time, data FROM monitoring where device like '_PMT_%' and data::jsonb ? 'boot_mode'  ORDER BY device, time DESC");
}

async function getLastMCC() {
  return getSQLJSON("SELECT device, time, data FROM monitoring where device = 'MCCMonitor' ORDER BY time DESC limit 1");
}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); }

function longest_line(text) {
    t = text.split("\n");
    m = t[0].length;
    t.map((a) => m=Math.max(m,a.length));
    return m;
}
