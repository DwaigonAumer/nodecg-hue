var host = nodecg.bundleConfig.host;
var username = nodecg.bundleConfig.username;

if (host.length && username.length) {
   nodecg.sendMessageToBundle('setupHueApi', 'nodecg-hue', [{'id': username, 'ipaddress': host}]);
}
else {
   nodecg.sendMessageToBundle('searchForBridge', 'nodecg-hue');
}

// global elements
var colorPreview
var rInput, gInput, bInput, rSlider, gSlider, bSlider;
var hInput, sInput, vInput, hSlider, sSlider, vSlider;
var xInput, yInput, xSlider, ySlider;
var ctInput, ctSlider;

document.addEventListener('WebComponentsReady', function() {
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
   var colorPickerTabs = document.querySelectorAll('.color-picker-tab');
   for (var i = colorPickerTabs.length - 1; i >= 0; i--) {
      colorPickerTabs[i].addEventListener('click', function() {
         document.querySelector('iron-pages#color-picker-pages').selected = this.closest('paper-tabs').selected;
      });
   }

   var lightSelectTabs = document.querySelectorAll('.light-select-tab');
   for (var i = lightSelectTabs.length - 1; i >= 0; i--) {
      lightSelectTabs[i].addEventListener('click', function() {
         document.querySelector('iron-pages#light-select-pages').selected = this.closest('paper-tabs').selected;
      });
   }

   // listeners that will notify server of final color change
   rInput.addEventListener('change', function() { sendColorValueChanged(event, 'rgb'); });
   gInput.addEventListener('change', function() { sendColorValueChanged(event, 'rgb'); });
   bInput.addEventListener('change', function() { sendColorValueChanged(event, 'rgb'); });
   rSlider.addEventListener('click', function() { sendColorValueChanged(event, 'rgb'); });
   gSlider.addEventListener('click', function() { sendColorValueChanged(event, 'rgb'); });
   bSlider.addEventListener('click', function() { sendColorValueChanged(event, 'rgb'); });

   hInput.addEventListener('change', function() { sendColorValueChanged(event, 'hsv'); });
   sInput.addEventListener('change', function() { sendColorValueChanged(event, 'hsv'); });
   vInput.addEventListener('change', function() { sendColorValueChanged(event, 'hsv'); });
   hSlider.addEventListener('click', function() { sendColorValueChanged(event, 'hsv'); });
   sSlider.addEventListener('click', function() { sendColorValueChanged(event, 'hsv'); });
   vSlider.addEventListener('click', function() { sendColorValueChanged(event, 'hsv'); });

   xInput.addEventListener('change', function() { sendColorValueChanged(event, 'xy'); });
   yInput.addEventListener('change', function() { sendColorValueChanged(event, 'xy'); });
   xSlider.addEventListener('click', function() { sendColorValueChanged(event, 'xy'); });
   ySlider.addEventListener('click', function() { sendColorValueChanged(event, 'xy'); });

   ctInput.addEventListener('change', function() { sendColorValueChanged(event, 'ct'); });
   ctSlider.addEventListener('click', function() { sendColorValueChanged(event, 'ct'); });

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
   
});

function sendColorValueChanged(event, mode) {
   if (mode == 'rgb') {
      var color = {
         r: rInput.value,
         g: gInput.value,
         b: bInput.value
      };
   } else if (mode == 'hsv') {
      var color = {
         h: hInput.value,
         s: sInput.value,
         v: vInput.value
      };
   } else if (mode == 'xy') {
      var color = {
         x: xInput.value,
         y: yInput.value
      };
   } else if (mode == 'ct') {
      var color = {
         ct: ctInput.value
      };
   }

   nodecg.sendMessageToBundle('colorValueChanged', 'nodecg-hue', {'mode': mode, color: color});
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
