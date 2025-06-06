// maps detector axes to 3D axes
const map2d = { x: 'x', y: 'y' };

{
  let gui = {
    div: document.getElementById('event-display')
  };
  for (let field of [ 'error', 'events', 'info', 'interval' ])
    gui[field] = document.getElementById(field);

  gui.controls = {};
  for (let button of [ 'first', 'previous', 'pause', 'next', 'last' ])
    gui.controls[button] = document.getElementById(button);

  var display = {
    gui,
    interval: 5 * 1000 // ms
  };

  gui.interval.value = display.interval / 1000;
};

function report_error(message) {
  display.gui.error.innerText = message;
  display.gui.error.style.display = 'block';
};

function hide_error() {
  display.gui.error.style.display = 'none';
};

function selected_name(id) {
  let options = document.getElementById(id).options;
  return options[options.selectedIndex].getAttribute('name');
};

function selected_plot_mode() {
  return selected_name('mode');
};

function selected_plot_data() {
  return selected_name('data');
};

function button_enable(button, enabled = true) {
  if (enabled)
    button.removeAttribute('disabled');
  else
    button.setAttribute('disabled', '');
};

function button_disable(button) {
  button_enable(button, false);
};

function toggle_controls() {
  let pause    = display.events;
  let previous = display.events && display.gui.events.selectedIndex > 0;
  let controls = display.gui.controls;
  button_enable(controls.first,    previous);
  button_enable(controls.previous, previous);
  button_enable(controls.pause,    pause);
};

function set_next_frame(render) {
  if (!display.update) return;
  display.update.handle = setTimeout(render, display.interval);
  display.update.time   = Date.now() + display.interval;
  display.update.render = render;
};

function cancel_next_frame() {
  let update = display.update;
  if (!update || !update.handle) return;
  clearTimeout(update.handle);
  update.handle = null;
};

function pause(pause) {
  if (!pause) {
    display.gui.controls.pause.innerText = 'Pause';
    display.update = {};
    load_events();
  } else if (display.update) {
    cancel_next_frame();
    display.update = null;
    display.gui.controls.pause.innerText = 'Resume';
  };
};

function first_click() {
  cancel_next_frame();
  load_event(0);
};

function previous_click() {
  pause(true);
  load_event(display.gui.events.selectedIndex - 1);
};

function pause_click() {
  pause(display.update);
};

function next_click() {
  cancel_next_frame();

  if (display.event) {
    let index = display.gui.events.selectedIndex + 1;
    if (index < display.events.length) {
      load_event(index);
      return;
    };
  };

  load_events();
};

function last_click() {
  cancel_next_frame();

  if (display.event) {
    let index = display.events.length - 1;
    if (index > display.gui.events.selectedIndex) {
      load_event(index);
      return;
    };
  };

  load_events(true);
};

function plot_mode_changed() {
  display.mode = selected_plot_mode();
  update_hits();
  Plotly.react(display.gui.div, display[display.mode].traces, display.layout);
};

function plot_data_changed() {
  display.data = selected_plot_data();
  let marker = display[display.mode].hits.marker;
  for (let i = 0; i < display.event.data.length; ++i)
    marker.color[i] = display.event.data[i][display.data];
  update_marker_size();
  Plotly.restyle(display.gui.div, { marker: marker }, [ 1 ]);
};

function event_selected(select) {
  pause(true);
  load_event(select.selectedIndex);
};

function set_update_interval() {
  let value = display.gui.interval.value * 1000;
  let update = display.update;
  if (update) {
    clearTimeout(update.handle);
    let time = update.time - (display.interval - value);
    display.interval = value;
    update.time = time;
    time = time - Date.now();
    if (time < 0) time = 0;
    update.handle = setTimeout(update.render, time);
  } else
    display.interval = value;
};

function update_info() {
  display.gui.info.innerText = Date().toString();
};

function update_hits() {
  let data = display[display.mode];
  if (data.hits.event === display.event) return;
  data.hits.event = display.event;

  function hits_coordinate(coordinate) {
    return display.event.data.map(
      hit => data.tubes[coordinate][display.pmts[hit.pmt]]
    );
  };
  data.hits.x = hits_coordinate('x');
  data.hits.y = hits_coordinate('y');
  if ('z' in data.hits) data.hits.z = hits_coordinate('z');

  data.hits.marker.color = display.event.data.map(hit => hit[display.data]);

  update_marker_size();

  data.hits.text = display.event.data.map(
    hit => data.tubes.text[display.pmts[hit.pmt]]
         + `<br>value: ${hit[display.data]}`
  );
  data.hits.hoverinfo = 'text';
};

function update_marker_size() {
  let marker = display['2d'].hits.marker;
  if (!marker.dynamic) return;

  let scale = marker.color.reduce((m, x) => Math.max(m, x), 0);
  if (scale > 0) {
    scale = 15 / scale;
    marker.size = marker.color.map(x => x * scale);
  } else
    marker.size = marker.color;
};

function get_csv(api, args, callback) {
  if (typeof(args) == 'function' && callback === undefined) {
    callback = args;
    args = {};
  };

  let url = '/cgi-bin/' + api + '.cgi';
  let d = '?';
  for (let key in args) url += d + key + '=' + args[key];

  d3.csv(
    url,
    function (error, reply) {
      if (error) {
        report_error(url + ': ' + error.responseText);
        return;
      } else
        hide_error();

      callback(reply);
    }
  );
};

function load_events(last = false) {
  get_csv(
    'get-event',
    function (events) {
      for (let event of events) event.evnt = Number(event.evnt);

      let index;
      if (last) {
        index = events.length - 1;
        if (display.event && display.event.evnt >= events[index].evnt)
          index = -1;
      } else if (display.event)
        index = events.findIndex(e => e.evnt > display.event.evnt);
      else if (events.length > 0)
        index = 0;
      else
        index = -1;

      if (index >= 0) {
        display.events = events;

        display.gui.events.length = 0;
        for (let [i, event] of events.entries()) {
          let option = new Option();
          option.innerText = event.evnt + '\t' + event.time;
          display.gui.events.appendChild(option);
          if (display.event && display.event.evnt == event.evnt)
            display.gui.events.selectedIndex = i;
        };

        load_event(index);
      } else {
        report_error('No new events!');
        update_info();
        set_next_frame(load_events);
      };
    }
  );
};

function load_event(index) {
  get_csv(
    'get-event',
    { event: display.events[index].evnt },
    function (event) {
      event = event[0];
      event.evnt  = Number(event.evnt);
      event.data  = JSON.parse(event.data);

      display.event = event;
      display.gui.events.selectedIndex = index;

      update_hits();

      let data = display[display.mode];
      if (data.traces.length == 1) {
        display['2d'].traces.push(display['2d'].hits);
        display['3d'].traces.push(display['3d'].hits);
      };
      Plotly.react(display.gui.div, data.traces, display.layout);

      toggle_controls();
      update_info();

      set_next_frame(
        function () {
          if (++index < display.events.length)
            load_event(index);
          else
            load_events();
        }
      );
    }
  );
};

get_csv(
  'pmt-locations',
  function (pmts) {
    for (let pmt of pmts)
      for (let i of [ 'id', 'x', 'y', 'z' ])
        pmt[i] = Number(pmt[i]);

    let X = map2d.x;
    let Y = map2d.y;
    let Z = [ 'x', 'y', 'z' ].find(z => z != X && z != Y);

    let ymin = pmts[0][Y];
    let ymax = ymin;
    let r    = pmts[0][Z];
    let pmt_map = {};
    for (let i = 0; i < pmts.length; ++i) {
      if (pmts[i][Y] > ymax)
        ymax = pmts[i][Y];
      else if (pmts[i][Y] < ymin)
        ymin = pmts[i][Y];
      if (pmts[i][Z] > r) r = pmts[i][Z];
      pmt_map[pmts[i].id] = i;
    };

    let locations2d = pmts.map(
      function (t) {
        if (t.location == 'top')    return { x: t[X], y: ymax + r - t[Z] };
        if (t.location == 'bottom') return { x: t[X], y: ymin - r + t[Z] };
        return { x: r * Math.atan2(t[X], t[Z]), y: t[Y] };
      }
    );

    let default_marker_sizes = [ 2, 5 ];

    let tubes2d = {
      name: 'Tubes',
      x:    locations2d.map(l => l.x),
      y:    locations2d.map(l => l.y),
      type: 'scatter',
      mode: 'markers',
      marker: {
        size:  default_marker_sizes[0],
        color: '#aaa'
      },
      text: pmts.map(t => `id: ${t.id}<br>x: ${t.x}<br>y: ${t.y}<br>z: ${t.z}`),
      hoverinfo: 'text'
    };

    let tubes3d = {
      name:      'Tubes',
      x:         pmts.map(t => t.x),
      y:         pmts.map(t => t.y),
      z:         pmts.map(t => t.z),
      type:      'scatter3d',
      mode:      'markers',
      marker:    tubes2d.marker,
      text:      tubes2d.text,
      hoverinfo: 'text'
    };

    let hits2d = {
      name: 'Hits',
      x:    [],
      y:    [],
      type: 'scatter',
      mode: 'markers',
      marker: {
        size:  default_marker_sizes[1],
        color: [],
        colorscale: 'Viridis',
        dynamic: false
      },
      event: null
    };

    let hits3d = {
      name:   'Hits',
      x:      [],
      y:      [],
      z:      [],
      type:   'scatter3d',
      mode:   'markers',
      marker: hits2d.marker,
      event:  null
    };

    display['2d']  = { tubes: tubes2d, hits: hits2d, traces: [ tubes2d ] };
    display['3d']  = { tubes: tubes3d, hits: hits3d, traces: [ tubes3d ] };
    display.pmts   = pmt_map;
    display.mode   = selected_plot_mode();
    display.data   = selected_plot_data();
    display.event  = null;

    function color_button(label, background, marker) {
      return {
        method: 'update',
        args: [
          { ['marker.color']: marker },
          { paper_bgcolor: background, plot_bgcolor: background },
          [ 0 ]
        ],
        label
      }
    };

    display.layout = {
      margin: { t: 0, b: 0 },
      legend: { y: 0.5, yanchor: 'top' },
      scene: { camera: { up: { [X]: 0, [Y]: 1, [Z] : 0 } } },
      updatemenus: [
        {
          y:       0.8,
          yanchor: 'top',
          buttons: [
	    color_button('white', '#fff', tubes2d.marker.color),
	    color_button('gray', '#aaa', '#fff'),
	    color_button('black', '#000', '#fff')
	  ]
        },
        {
          y:       0.4,
          yanchor: 'top',
          buttons: [
            {
              method: 'skip',
              label:  'Fixed size',
              action: function () {
                hits2d.marker.dynamic = false;
                hits2d.marker.size    = 5;
                Plotly.restyle(display.gui.div, { 'marker.size' : default_marker_sizes });
              }
            },
            {
              method: 'skip',
              label:  'Dynamic',
              action: function () {
                hits2d.marker.dynamic = true;
                update_marker_size();
                Plotly.restyle(
                  display.gui.div, { 'marker.size': [ 1, hits2d.marker.size ] }
                );
              }
            }
          ]
        },
        {
          buttons: [
            {
              args:   [ 'marker.colorscale', 'Viridis' ],
              label:  'Viridis',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Electric' ],
              label:  'Electric',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Earth' ],
              label:  'Earth',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Hot' ],
              label:  'Hot',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Jet' ],
              label:  'Jet',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Portland' ],
              label:  'Portland',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Rainbow' ],
              label:  'Rainbow',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Blackbody' ],
              label:  'Blackbody',
              method: 'restyle'
            },
            {
              args:   [ 'marker.colorscale', 'Cividis' ],
              label:  'Cividis',
              method: 'restyle'
            }
          ],
          direction:  'left',
          pad:        { r: 10, t: 20 },
          showactive: true,
          type:       'buttons',
          x:          0.15,
          xanchor:    'left',
          y:          0,
          yanchor:    'top'
        }
      ]
    };

    Plotly.newPlot(
      display.gui.div,
      display[display.mode].traces,
      display.layout
    );

   display.gui.div.on(
     'plotly_buttonclicked',
     function ({button}) {
       let action = button._input.action;
       if (action) action();
     }
    );

    display.update = {};
    load_events(true);
  }
);
