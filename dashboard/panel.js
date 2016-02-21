var host = nodecg.bundleConfig.host;
var username = nodecg.bundleConfig.username;

if (host.length && username.length) {
   nodecg.sendMessageToBundle('setupHueApi', 'nodecg-hue', [{'id': username, 'ipaddress': host}]);
}
else {
   nodecg.sendMessageToBundle('searchForBridge', 'nodecg-hue');
}

// global elements
var colorPreview, rInput, gInput, bInput, rSlider, gSlider, bSlider;

document.addEventListener('WebComponentsReady', function() {
   // global elements
   rInput = document.querySelector('.red input#input');
   gInput = document.querySelector('.green input#input');
   bInput = document.querySelector('.blue input#input');
   rSlider = document.querySelector('.red #sliderContainer');
   gSlider = document.querySelector('.green #sliderContainer');
   bSlider = document.querySelector('.blue #sliderContainer');
   colorPreview = document.querySelector('#color-preview');

   // listeners that will notify server of final color change
   rInput.addEventListener('change', function() {sendRgbValueChanged();})
   gInput.addEventListener('change', function() {sendRgbValueChanged();})
   bInput.addEventListener('change', function() {sendRgbValueChanged();})
   rSlider.addEventListener('click', function() {sendRgbValueChanged();})
   gSlider.addEventListener('click', function() {sendRgbValueChanged();})
   bSlider.addEventListener('click', function() {sendRgbValueChanged();})

   // listeners that will notify color-preview of immediate color changes
   rInput.addEventListener('bind-value-changed', function() {updatePreviewColor();})
   gInput.addEventListener('bind-value-changed', function() {updatePreviewColor();})
   bInput.addEventListener('bind-value-changed', function() {updatePreviewColor();})
});

function sendRgbValueChanged() {
   nodecg.sendMessageToBundle('rgbValueChanged', 'nodecg-hue', {'r': rInput.value, 'g': gInput.value, 'b': bInput.value});
}

function updatePreviewColor() {
   var color = "rgb(" + rSlider.parentElement.immediateValue + ", " + gSlider.parentElement.immediateValue + ", " + bSlider.parentElement.immediateValue + ")";
   colorPreview.style.backgroundColor = color;
}