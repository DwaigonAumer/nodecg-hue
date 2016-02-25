// hue
var hue = require('node-hue-api');
var host = nodecg.bundleConfig.host;
var username = nodecg.bundleConfig.username;
var config, lights, groups, rules, scenes, schedules, sensors
// dashboard
var colorPreview
var rInput, gInput, bInput, rSlider, gSlider, bSlider;
var hInput, sInput, vInput, hSlider, sSlider, vSlider;
var xInput, yInput, xSlider, ySlider;
var ctInput, ctSlider;
var selectedScene;

if (host.length && username.length) {
   setupHueApi();
}
else {
   hue.nupnpSearch().then(setupHueApi).done();
}

document.addEventListener('WebComponentsReady', function() {
   // update ui with latest information
   refreshHueData();

   // global elements
   colorPreview = document.querySelectorAll('.color-preview');

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
   xSlider = document.querySelector('.x #sliderContainer');
   ySlider = document.querySelector('.y #sliderContainer');

   ctInput = document.querySelector('.ct input#input');
   ctSlider = document.querySelector('.ct #sliderContainer');

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
   rInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'rgb'); });
   gInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'rgb'); });
   bInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'rgb'); });

   hInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'hsv'); });
   sInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'hsv'); });
   vInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'hsv'); });

   xInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'xy'); });
   yInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'xy'); });

   ctInput.addEventListener('bind-value-changed', function() { updatePreviewColor(event, 'ct'); });

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
         var ls = hue.lightState.create().on().transitiontime(transitionTime).xy(picker.color.x, picker.color.y);
      } else if (picker.mode == "ct") {
         var ls = hue.lightState.create().on().transitiontime(transitionTime).ct(picker.color.ct);
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

function setupHueApi() {
   window.hueApi = new hue.HueApi(host, username);
}

function refreshHueData() {
   hueApi.fullState(function(err, data) {
      if (err) throw err;

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
   })
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
      lightButton.setAttribute('raised', '');
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
      groupButton.className = "btn-thin";
      groupButton.setAttribute('toggles', '');
      groupButton.setAttribute('raised', '');
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
   for (var i = 1; i < Object.keys(scenes).length; i++) {
      var sceneId = Object.keys(scenes)[i];
      var scenesButton = document.createElement('paper-radio-button');
      scenesButton.setAttribute('name', i);
      if (i == 1) { scenesButton.setAttribute('checked', '') };
      scenesButton.querySelector('#radioLabel').textContent = scenes[sceneId].name;
      scenesButton.addEventListener('click', clearLastSceneSelection);
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
      selectedScene = document.querySelector('#scenes paper-radio-button[name="1"]');
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
      var mode = 'rgb'
      var color = {
         r: rInput.value,
         g: gInput.value,
         b: bInput.value
      };
   } else if (tab == 1) {
      var mode = 'hsv'
      var color = {
         h: hInput.value,
         s: sInput.value,
         v: vInput.value
      };
   } else if (tab == 2) {
      var mode = 'xy'
      var color = {
         x: xInput.value,
         y: yInput.value
      };
   } else if (tab == 3) {
      var mode = 'ct'
      var color = {
         ct: ctInput.value
      };
   } else if (tab == 4) {
      var mode = 'scene'
      var color = {
         scene: Object.keys(scenes)[selectedScene.name]
      }
   }

   return {'mode': mode, color: color};
}

function updatePreviewColor(event, mode) {
   var color;
   var slider = event.target.closest('paper-slider');

   if (slider.closest('.slider-group').className.indexOf('rgb') >= 0) {
      color = "rgb(" + rSlider.parentElement.immediateValue + ", " + gSlider.parentElement.immediateValue + ", " + bSlider.parentElement.immediateValue + ")";
   } else if (slider.closest('.slider-group').className.indexOf('hue') >= 0) {
      hSlider.querySelector('#sliderKnobInner').style.backgroundColor = "hsl(" + hInput.value + ", 100%, 50%)";
      hSlider.querySelector('#sliderKnobInner').style.borderColor = "hsl(" + hInput.value + ", 100%, 50%)";
      hSlider.querySelector('#primaryProgress').style.backgroundColor = "hsl(" + hInput.value + ", 100%, 40%)";
      var hsl = hsv2hsl(hSlider.parentElement.immediateValue, (sSlider.parentElement.immediateValue / 100.0), (vSlider.parentElement.immediateValue / 100.0))
      color = "hsl(" + hsl.h + ", " + hsl.s * 100 + "%, " + hsl.l * 100 + "%)";
   } else if (slider.closest('.slider-group').className.indexOf('xy') >= 0) {
      var rgb = xy2rgb(xSlider.parentElement.immediateValue, ySlider.parentElement.immediateValue);
      color = "rgb(" + parseInt((rgb.r * 255), 10) + ", " + parseInt((rgb.g * 255), 10) + ", " + parseInt((rgb.b * 255), 10) + ")";
   }
   for (var i = colorPreview.length - 1; i >= 0; i--) {
      colorPreview[i].style.backgroundColor = color;
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

function hsv2hsl(h, s, v) {
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

function xy2rgb(x, y) {
   var z = 1.0 - x - y;
   var Y = 1.0;
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
