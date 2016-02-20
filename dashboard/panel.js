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
   document.querySelector('.red').addEventListener('click', function() {sendRgbValueChanged();})
   document.querySelector('.green').addEventListener('click', function() {sendRgbValueChanged();})
   document.querySelector('.blue').addEventListener('click', function() {sendRgbValueChanged();})
});

function sendRgbValueChanged() {
   var r = document.querySelector('.red').immediateValue;
   var g = document.querySelector('.green').immediateValue;
   var b = document.querySelector('.blue').immediateValue;
   nodecg.sendMessageToBundle('rgbValueChanged', 'nodecg-hue', {'r': r, 'g': g, 'b': b});
}