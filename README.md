# nodecg-hue
> WIP NodeCG bundle to control Philips Hue lighting system

## Extra Usage Steps
Change directories to ```bundles/nodecg-hue``` and run the following command
```
browserify dashboard/panel.js -o panel-browserified.js
```

## Todo
### Short Term
- multi selection of connected lights through single and group selections (which light state will be applied to)
- implement a search for new lights feature
- make finding and connecting to hue bridge robust
- implement light scenes - [scenes API](http://www.developers.meethue.com/documentation/scenes-api)
- implement light scheduling - [schedules API](http://www.developers.meethue.com/documentation/schedules-api-0)
- create a settings dialog that contains rarely changed lightstate options (bridge name, proxy port, touchlink, netmask, gateway)
- create a settings element on the panel that contains frequently changed lightstate options (transition time, on/off, color effect)

### Long Term
- look into light rules - [rules API](http://www.developers.meethue.com/documentation/rules-api)
- look into light sensors - [sensors API](http://www.developers.meethue.com/documentation/supported-sensors)
- gain better understanding of Polymer to see if there is a better way to track slider value changes than attaching a boatload eventListeners
- consider making a Polymer element out of the color picker
- consider using [tinycolor2](https://www.npmjs.com/package/tinycolor2) or other color manipulation library
- write documentation for extension API


*some links require Philips Hue API login