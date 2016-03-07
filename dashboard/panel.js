var config, lights, groups, rules, scenes, schedules, sensors
var host = localStorage.getItem('nodecg-hue.hueHost');
var username = localStorage.getItem('nodecg-hue.hueUsername');
// dashboard
var hsvColorPreview, rgbColorPreview, xyColorPreview, ctColorPreview;
var rInput, gInput, bInput, rSlider, gSlider, bSlider;
var hInput, sInput, vInput, hSlider, sSlider, vSlider;
var xInput, yInput, xybInput, xSlider, ySlider, xybSlider;
var ctInput, ctbInput, ctSlider, ctbSlider;
var ironPages, selectedScene;
var connectBtn;

document.addEventListener('WebComponentsReady', function() {
   ironPages = document.querySelector('#main-pages');
   connectBtn = document.querySelector('paper-button#connect');

   connectBtn.addEventListener('click', function() {
      Polymer.dom(connectBtn).textContent = "Connecting...";
      hue.nupnpSearch().then(setupHueApi).done();
   });

   // create hueApi from localStorage data, otherwise search bridge and grab data
   if(host != undefined && username != undefined) {
      ironPages.select("active");
      setupHueApi();
   } else {
      ironPages.select("inactive");
   }

   // global elements
   hsvColorPreview = document.querySelector('#hsv-color-preview');
   rgbColorPreview = document.querySelector('#rgb-color-preview');
   xyColorPreview = document.querySelector('#xy-color-preview');
   ctColorPreview = document.querySelector('#ct-color-preview');

   rInput = document.querySelector('paper-slider.red input#input');
   gInput = document.querySelector('paper-slider.green input#input');
   bInput = document.querySelector('paper-slider.blue input#input');
   rSlider = document.querySelector('paper-slider.red #sliderContainer');
   gSlider = document.querySelector('paper-slider.green #sliderContainer');
   bSlider = document.querySelector('paper-slider.blue #sliderContainer');

   hInput = document.querySelector('.hue input#input');
   sInput = document.querySelector('.sat input#input');
   vInput = document.querySelector('.val input#input');
   hSlider = document.querySelector('.hue #sliderContainer');
   sSlider = document.querySelector('.sat #sliderContainer');
   vSlider = document.querySelector('.val #sliderContainer');

   xInput = document.querySelector('.x input#input');
   yInput = document.querySelector('.y input#input');
   xybInput = document.querySelector('.xy .bri input#input');
   xSlider = document.querySelector('.x #sliderContainer');
   ySlider = document.querySelector('.y #sliderContainer');
   xybSlider = document.querySelector('.xy .bri #sliderContainer');

   ctInput = document.querySelector('.ct input#input');
   ctbInput = document.querySelector('.ct .bri input#input');
   ctSlider = document.querySelector('.ct #sliderContainer');
   ctbSlider = document.querySelector('.ct .bri #sliderContainer');

   // set initial color-preview state
   updatePreviewColor('hsv');
   updatePreviewColor('rgb');
   updatePreviewColor('xy');
   updatePreviewColor('ct');

   // listeners for tab selections
   var lightSelectTabs = document.querySelectorAll('.light-select-tab');
   for (var i = lightSelectTabs.length - 1; i >= 0; i--) {
      lightSelectTabs[i].addEventListener('click', function() {
         document.querySelector('iron-pages#light-select-pages').selected = this.closest('paper-tabs').selected;
      });
   }

   var colorPickerTabs = document.querySelectorAll('.color-picker-tab');
   for (var i = colorPickerTabs.length - 1; i >= 0; i--) {
      colorPickerTabs[i].addEventListener('click', function() {
         document.querySelector('iron-pages#color-picker-pages').selected = this.closest('paper-tabs').selected;
      });
   }

   // listeners that will notify color-preview of immediate color changes
   rInput.addEventListener('bind-value-changed', function() { updatePreviewColor('rgb'); });
   gInput.addEventListener('bind-value-changed', function() { updatePreviewColor('rgb'); });
   bInput.addEventListener('bind-value-changed', function() { updatePreviewColor('rgb'); });

   hInput.addEventListener('bind-value-changed', function() { updatePreviewColor('hsv'); });
   sInput.addEventListener('bind-value-changed', function() { updatePreviewColor('hsv'); });
   vInput.addEventListener('bind-value-changed', function() { updatePreviewColor('hsv'); });

   xInput.addEventListener('bind-value-changed', function() { updatePreviewColor('xy'); });
   yInput.addEventListener('bind-value-changed', function() { updatePreviewColor('xy'); });
   xybInput.addEventListener('bind-value-changed', function() { updatePreviewColor('xy'); });

   ctInput.addEventListener('bind-value-changed', function() { updatePreviewColor('ct'); });
   ctbInput.addEventListener('bind-value-changed', function() { updatePreviewColor('ct'); });

   // listener that will send lightState to selected lights
   document.querySelector('#master-send').addEventListener('click', sendLightState);
   
});

function sendLightState(event) {
   var picker = getPickerData();
   var on = document.querySelector('#master-send-container paper-toggle-button').active;
   var transitionTimeInput = document.querySelector('#master-send-container paper-input');
   var transitionTime = (transitionTimeInput.value) ? transitionTimeInput.value : transitionTimeInput.placeholder;
   
   if (transitionTime > 0) {
      transitionTime /= 100;
   }

   if(on) {
      if (picker.mode == "rgb") {
         var hsv = rgbToHsv(picker.color.r, picker.color.g, picker.color.b);
         var ls = hue.lightState.create().on().transitiontime(transitionTime).hsb(hsv.h, hsv.s, hsv.v);
      } else if (picker.mode == "hsv") {
         var ls = hue.lightState.create().on().transitiontime(transitionTime).hsb(picker.color.h, picker.color.s, picker.color.v);
      } else if (picker.mode == "xy") {
         var ls = hue.lightState.create().on().transitiontime(transitionTime).xy(picker.color.x, picker.color.y).bri(picker.color.b);
      } else if (picker.mode == "ct") {
         var ls = hue.lightState.create().on().transitiontime(transitionTime).ct(picker.color.ct).bri(picker.color.b);
      } else if (picker.mode == "scene") {
         var ls = {'on': true, 'transitiontime': transitionTime, 'scene': picker.color.scene};
      }
   } else {
      var ls = hue.lightState.create().off().transitiontime(transitionTime);
   }

   var activeSelectionTab = document.querySelector('paper-tabs#light-select-tabs').selected

   if (activeSelectionTab == 0) {
      // individual lights
      var lbs = document.querySelectorAll('#single-light.scroll-container paper-button');
      for (var i = 0; i < lbs.length; i++) {
         if (lbs[i].active) {
            var lightId = lbs[i].textContent.trim();
            hueApi.setLightState(lightId, ls).then(logResult).done();
         }
      }

   } else if(activeSelectionTab == 1) {
      // group lights
      var gbs = document.querySelectorAll('#group-light.scroll-container paper-button');
      for (var i = 0; i < gbs.length; i++) {
         if (gbs[i].active) {
            hueApi.setGroupLightState(i+1, ls).then(logResult).done();
         }
      }
   }

   logResult(picker);
}

function logResult(result) {
   nodecg.log.debug(JSON.stringify(result, null, 2));
}

function setupHueApi(bridge) {
   if (bridge) {
      localStorage.setItem('nodecg-hue.hueHost', bridge[0].ipaddress)
      host = bridge[0].ipaddress;
      window.hueApi = new hue.HueApi(host);
      hueApi.registerUser(host, 'github.com/bfaircloo/nodecg-hue', function(err, uname){
         if (err != undefined) { 
            nodecg.log.error(err);
            Polymer.dom(connectBtn).textContent = "Connect To Bridge";
            return;
         }
         localStorage.setItem('nodecg-hue.hueUsername', uname);
         username = uname;
         hueApi._config.username = uname;
         refreshHueData(true, function() {
            Polymer.dom(connectBtn).textContent = "Connect To Bridge";
            ironPages.select("active");
         });
      });
   } else {
      window.hueApi = new hue.HueApi(host, username);
      refreshHueData();
   }
}

function refreshHueData(forceApiCall, cb) {
   if(forceApiCall || localStorage.getItem('nodecg-hue.hueConfig') === null) {
      hueApi.fullState(function(err, data) {
         if (err) throw err;

         localStorage.setItem('nodecg-hue.hueConfig', JSON.stringify(data.config));
         localStorage.setItem('nodecg-hue.hueLights', JSON.stringify(data.lights));
         localStorage.setItem('nodecg-hue.hueGroups', JSON.stringify(data.groups));
         localStorage.setItem('nodecg-hue.hueRules', JSON.stringify(data.rules));
         localStorage.setItem('nodecg-hue.hueScenes', JSON.stringify(data.scenes));
         localStorage.setItem('nodecg-hue.hueSchedules', JSON.stringify(data.schedules));
         localStorage.setItem('nodecg-hue.hueSensors', JSON.stringify(data.sensors));

         config = data.config;
         lights = data.lights;
         groups = data.groups;
         rules = data.rules;
         scenes = data.scenes;
         schedules = data.schedules;
         sensors = data.sensors;

         refreshLightsUi();
         refreshGroupsUi();
         refreshScenesUi();

         if (cb != undefined) { cb(); };
      });
   } else {
      config = JSON.parse(localStorage.getItem('nodecg-hue.hueConfig'));
      lights = JSON.parse(localStorage.getItem('nodecg-hue.hueLights'));
      groups = JSON.parse(localStorage.getItem('nodecg-hue.hueGroups'));
      rules = JSON.parse(localStorage.getItem('nodecg-hue.hueRules'));
      scenes = JSON.parse(localStorage.getItem('nodecg-hue.hueScenes'));
      schedules = JSON.parse(localStorage.getItem('nodecg-hue.hueSchedules'));
      sensors = JSON.parse(localStorage.getItem('nodecg-hue.hueSensors'));

      refreshLightsUi();
      refreshGroupsUi();
      refreshScenesUi();

      if (cb != undefined) { cb(); };
   }
   
}

function deleteAppsWhitelistEntries() {
   var wlKeys = Object.keys(config.whitelist);
   for (var i = wlKeys.length - 1; i >= 0; i--) {
      if (config.whitelist[wlKeys[i]].name == "github.com/bfaircloo/nodecg-hue") {
         hueApi.deleteUser(wlKeys[i]);
      }
   }
   localStorage.removeItem('nodecg-hue.hueUsername');
   ironPages.select("inactive");
}

function refreshLightsUi() {
   // clear old light buttons
   var lightButtonContainer = document.querySelector('#single-light.scroll-container');
   while (lightButtonContainer.lastChild) {
      lightButtonContainer.removeChild(lightButtonContainer.lastChild);
   }

   // add new light buttons
   var selectAll = document.createElement('paper-button');
   selectAll.className = "btn-selector btn-thin";
   selectAll.textContent = "Select All";
   selectAll.addEventListener('click', selectAllLights);
   lightButtonContainer.appendChild(selectAll);

   var selectNone = document.createElement('paper-button');
   selectNone.className = "btn-selector btn-thin";
   selectNone.textContent = "Select None";
   selectNone.addEventListener('click', selectNoLights);
   lightButtonContainer.appendChild(selectNone);

   for (var i = 1; i <= Object.keys(lights).length; i++) {
      var lightButton = document.createElement('paper-button');
      lightButton.textContent = i;
      lightButton.setAttribute('toggles', '');
      lightButton.className = "btn-light-select";
      lightButtonContainer.appendChild(lightButton);
   }
}

function refreshGroupsUi() {
   // clear old group buttons
   var groupButtonContainer = document.querySelector('#group-light.scroll-container');
   while (groupButtonContainer.lastChild) {
      groupButtonContainer.removeChild(groupButtonContainer.lastChild);
   }

   // add new group buttons
   for (var i = 1; i < Object.keys(groups).length; i++) {
      var groupButton = document.createElement('paper-button');
      groupButton.textContent = groups[i].name;
      groupButton.className = "btn-thin btn-light-select";
      groupButton.setAttribute('toggles', '');
      groupButtonContainer.appendChild(groupButton);
   }
}

function refreshScenesUi() {
   // clear old scenes buttons
   var scenesRadioGroup = document.querySelector('#scenes.scroll-container');

   if (scenesRadioGroup !== null) {
      while (scenesRadioGroup.lastChild) {
         scenesRadioGroup.removeChild(scenesRadioGroup.lastChild);
      }
   }

   // add new scenes buttons
   for (var i = 0; i < Object.keys(scenes).length; i++) {
      var sceneId = Object.keys(scenes)[i];
      var scenesButton = document.createElement('paper-radio-button');
      scenesButton.setAttribute('name', sceneId);
      Polymer.dom(scenesButton).textContent = scenes[sceneId].name;
      scenesButton.addEventListener('click', clearLastSceneSelection);
      if (i == 0) {
         scenesButton.setAttribute('checked', '');
         selectedScene = scenesButton;
      };
      scenesRadioGroup.appendChild(scenesButton);
   }
}

function selectAllLights(event) {
   var lbs = document.querySelectorAll('#single-light paper-button[toggles]');
   for (var i = 0; i < lbs.length; i++) {
      lbs[i].setAttribute('active', '');
   }
}

function selectNoLights(event) {
   var lbs = document.querySelectorAll('#single-light paper-button');
   for (var i = 0; i < lbs.length; i++) {
      lbs[i].removeAttribute('active');
   }
}

// create radio group functionality
// this doesn't use paper-radio-group becasue it doesn't function correctly with dynamic paper-radio-buttons
function clearLastSceneSelection(event) {
   if (selectedScene === undefined) {
      selectedScene = document.querySelector('#scenes paper-radio-button');
   }

   if (selectedScene.name !== event.target.closest('paper-radio-button').name) {
      selectedScene.removeAttribute('checked');
      selectedScene = event.target.closest('paper-radio-button');
   } else {
      selectedScene.setAttribute('checked', '');
   }
}

function getPickerData() {
   var tab = document.querySelector('paper-tabs#color-picker-tabs').selected;

   if (tab == 0) {
      var mode = 'hsv'
      var color = {
         h: hInput.value,
         s: sInput.value,
         v: vInput.value
      };
   } else if (tab == 1) {
      var mode = 'rgb'
      var color = {
         r: rInput.value,
         g: gInput.value,
         b: bInput.value
      };
   } else if (tab == 2) {
      var mode = 'xy'
      var color = {
         x: xInput.value,
         y: yInput.value,
         b: parseInt((xybInput.value / 100) * 255, 10)
      };
   } else if (tab == 3) {
      var mode = 'ct'
      var color = {
         ct: ctInput.value,
         b: parseInt((ctbInput.value / 100) * 255, 10)
      };
   } else if (tab == 4) {
      var mode = 'scene'
      var color = {
         scene: selectedScene.name
      }
   }

   return {'mode': mode, color: color};
}

function updatePreviewColor(mode) {
   var color;

   if (mode == 'hsv') {
      hSlider.querySelector('#sliderKnobInner').style.backgroundColor = "hsl(" + hInput.value + ", 100%, 70%)";
      hSlider.querySelector('#sliderKnobInner').style.borderColor = "hsl(" + hInput.value + ", 100%, 70%)";
      hSlider.querySelector('#primaryProgress').style.backgroundColor = "hsl(" + hInput.value + ", 100%, 40%)";
      hSlider.querySelector('#progressContainer').style.backgroundColor = "hsl(" + hInput.value + ", 100%, 40%)";
      var hsl = hsv2Hsl(hSlider.parentElement.immediateValue, (sSlider.parentElement.immediateValue / 100.0), (vSlider.parentElement.immediateValue / 100.0))
      color = "hsl(" + hsl.h + ", " + hsl.s * 100 + "%, " + hsl.l * 100 + "%)";
      hsvColorPreview.style.backgroundColor = color;
   } else if (mode == 'rgb') {
      color = "rgb(" + rSlider.parentElement.immediateValue + ", " + gSlider.parentElement.immediateValue + ", " + bSlider.parentElement.immediateValue + ")";
      rgbColorPreview.style.backgroundColor = color;
   } else if (mode == 'xy') {
      var rgb = xy2Rgb(xSlider.parentElement.immediateValue, ySlider.parentElement.immediateValue, xybSlider.parentElement.immediateValue);
      color = "rgb(" + parseInt((rgb.r * 255), 10) + ", " + parseInt((rgb.g * 255), 10) + ", " + parseInt((rgb.b * 255), 10) + ")";
      xyColorPreview.style.backgroundColor = color;
   } else if (mode == 'ct') {
      var rgbSlider = kelvin2Rgb(mired2Kelvin(ctSlider.parentElement.immediateValue), 100);
      colorSliderBright = "rgb(" + parseInt(rgbSlider.r, 10) + ", " + parseInt(rgbSlider.g, 10) + ", " + parseInt(rgbSlider.b, 10) + ")";
      colorSliderDim = "rgb(" + parseInt(rgbSlider.r, 10) - 25 + ", " + parseInt(rgbSlider.g, 10) - 25 + ", " + parseInt(rgbSlider.b, 10) - 25 + ")";
      var rgb = kelvin2Rgb(mired2Kelvin(ctSlider.parentElement.immediateValue), ctbSlider.parentElement.immediateValue);
      color = "rgb(" + parseInt(rgb.r, 10) + ", " + parseInt(rgb.g, 10) + ", " + parseInt(rgb.b, 10) + ")";
      ctSlider.querySelector('#sliderKnobInner').style.backgroundColor = colorSliderBright;
      ctSlider.querySelector('#sliderKnobInner').style.borderColor = colorSliderBright;
      ctSlider.querySelector('#primaryProgress').style.backgroundColor = colorSliderDim;
      ctSlider.querySelector('#progressContainer').style.backgroundColor = colorSliderDim;
      ctColorPreview.style.backgroundColor = color;
   }
}

// utility functions
// http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
function rgbToHsv(r, g, b) {
   var h = 0;
   var s = 100;
   var v = 100;

   var r1 = (r / 255);
   var g1 = (g / 255);
   var b1 = (b / 255);
   var cMax = Math.max(r1, g1, b1);
   var cMin = Math.min(r1, g1, b1);
   var cDelta = cMax - cMin;

   // calculate hue
   if (cDelta === 0) {
      h = 0;
   } else if(cMax == r1) {
      h = 60 * (((g1 - b1) / cDelta) % 6);
   } else if(cMax == g1) {
      h = 60 * (((b1 - r1) / cDelta) + 2);
   } else if(cMax == b1) {
      h = 60 * (((r1 - g1) / cDelta) + 4);
   }
   if (h < 0) {
      h = 360 + h;
   }

   // calculate saturation
   if (cMax == 0) {
      s = 0;
   } else {
      s = (cDelta / cMax) * 100;
   }

   // calculate value (which in out case is brightness)
   v = cMax * 100;
   
   return {'h': Math.round(h), 's': Math.round(s), 'v': Math.round(v)}
}

function hsv2Hsl(h, s, v) {
   l1 = (2 - s) * v;
   s1 = s * v;
   if (s1 == 2) {
      s1 = 0;
   } else {
      s1 /= (l1 <= 1) ? l1 : 2 - l1;
   }
   l1 /= 2;

   return {h: h, s: s1, l: l1};
}

function xy2Rgb(x, y, b) {
   var z = 1.0 - x - y;
   var Y = b / 100;
   var X = (Y / y) * x;
   var Z = (Y / y) * z;

   var r =  X * 1.612 - Y * 0.203 - Z * 0.302;
   var g = -X * 0.509 + Y * 1.422 + Z * 0.066;
   var b =  X * 0.026 - Y * 0.072 + Z * 0.962;

   r = r <= 0.0031308 ? 12.92 * r : (1.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
   g = g <= 0.0031308 ? 12.92 * g : (1.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
   b = b <= 0.0031308 ? 12.92 * b : (1.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

   return {r: r, g: g, b: b};
}

function mired2Kelvin(mired) {
   return (Math.pow(10, 6) / mired);
}

// http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
function kelvin2Rgb(kelvin, bri) {
   var r, g, b;
   const K = parseInt(kelvin, 10) / 100;

   // red
   if (K <= 60) {
      r = 255;
   } else {
      r = K - 54;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      if (r > 255) { r = 255; }
      else if (r < 0) { r = 0; }
   }

   // green
   if (K <= 60) {
      g = K;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
   } else {
      g = K - 54;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
   }

   if (g > 255) { g = 255; }
   else if (g < 0) { g = 0; }

   // blue
   if (K >= 60) {
      b = 255;
   } else if (K <= 19) {
      b = 0;
   } else {
      b = K - 4
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      if (b > 255) { b = 255; }
      else if (b < 0) { b = 0; }
   }

   return {r: (r * (bri/100)), g: (g * (bri/100)), b: (b * (bri/100))};
}
