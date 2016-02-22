var hue = require('node-hue-api');

module.exports = function(nodecg) {
   var hueApi;

   /* Utility Functions */
   // logs a nodecg-hue line on the server's console
   var logResult = function(result) {
      nodecg.log.debug(JSON.stringify(result, null, 2));
   }

   // http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
   var rgbToHsv = function(r, g, b) {
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

   /* Node-Hue-Api Calls */
   var setupHueApi = function(data) {
      hueApi = new hue.HueApi(data[0].ipaddress, data[0].id);
      hueApi.getConfig().then(logResult).done();
   }

   var setColor = function(data) {
      if (data.mode == "rgb") {
         var hsv = rgbToHsv(data.color.r, data.color.g, data.color.b);
         var ls = hue.lightState.create().hsb(hsv.h, hsv.s, hsv.v);
      } else if (data.mode == "hsv") {
         var ls = hue.lightState.create().hsb(data.color.h, data.color.s, data.color.v);
      } else if (data.mode == "xy") {
         var ls = hue.lightState.create().xy(data.color.x, data.color.y);
      } else if (data.mode == "ct") {
         var ls = hue.lightState.create().ct(data.color.ct);
      }
      hueApi.setGroupLightState(0, ls).then(logResult).done();
      logResult(data);
   }

   /* NodeCG Communications */
   // incoming messages
   nodecg.listenFor('searchForBridge', function() {
      hue.nupnpSearch().then(setupHueApi).done();
   });

   nodecg.listenFor('setupHueApi', setupHueApi);

   nodecg.listenFor('colorValueChanged', setColor);
}