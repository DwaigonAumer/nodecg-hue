var host = nodecg.bundleConfig.host;
var username = nodecg.bundleConfig.username;

if (host.length && username.length) {
   nodecg.sendMessageToBundle('setupHueApi', 'nodecg-hue', [{'id': username, 'ipaddress': host}]);
}
else {
   nodecg.sendMessageToBundle('searchForBridge', 'nodecg-hue');
}

document.addEventListener('WebComponentsReady', function() {
   document.querySelector('.red input#input').addEventListener('change', function() {sendRgbValueChanged();})
   document.querySelector('.green input#input').addEventListener('change', function() {sendRgbValueChanged();})
   document.querySelector('.blue input#input').addEventListener('change', function() {sendRgbValueChanged();})
   document.querySelector('.red #sliderContainer').addEventListener('click', function() {sendRgbValueChanged();})
   document.querySelector('.green #sliderContainer').addEventListener('click', function() {sendRgbValueChanged();})
   document.querySelector('.blue #sliderContainer').addEventListener('click', function() {sendRgbValueChanged();})
});

function sendRgbValueChanged() {
   var r = document.querySelector('.red input#input').value;
   var g = document.querySelector('.green input#input').value;
   var b = document.querySelector('.blue input#input').value;
   nodecg.sendMessageToBundle('rgbValueChanged', 'nodecg-hue', {'r': r, 'g': g, 'b': b});
}