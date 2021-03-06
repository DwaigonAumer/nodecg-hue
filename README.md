# nodecg-hue
> WIP NodeCG bundle to control Philips Hue lighting system

So far this bundle allows you to control your hue lights as long as your bridge has already been setup with all of your lightbulbs and optionally any information on light groups and scenes.

<img src="../screenshots/screenshots/hue-panel-connect.jpg?raw=true" width="270px" height="434px"> <img src="../screenshots/screenshots/hue-panel-individual.jpg?raw=true" width="270px" height="434px"> <img src="../screenshots/screenshots/hue-panel-group.jpg?raw=true" width="270px" height="434px">

## Install
Make sure you have [NodeCG](https://github.com/nodecg/nodecg) and then enter the code below:
```
cd nodecg/bundles/
git clone https://github.com/Lypho/nodecg-hue
cd nodecg-hue
npm install -g bower browserify
bower install
npm install
npm run build
```

## Project Quirks
Scenes can only be updated through a "Group of Lights" selection
Scenes ignore the "Transition Time" setting, but not the "Off/On" setting

## Todo
### Short Term
- add warning when updating lights when no lights have been selected
- ability to shift bri, hue, sat by small increments
- stop sliders with large input values from being visually cut off
- add message to background of light selection div if lights/groups are empty
- implement a search for new lights feature
- implement light scheduling - [schedules API](http://www.developers.meethue.com/documentation/schedules-api-0)
- create a settings dialog that contains rarely changed lightstate options (bridge name, proxy port, touchlink, netmask, gateway)
- create a settings element on the panel that contains frequently changed lightstate options (color effect)

### Long Term
- consider moving todo list off of GitHub
- consider removing XY tab since it's not intuitive and the color-preview isn't that accurate
- make smarter requests to hue-api by removing unnecessary arguments (don't send on() to a light that is already on)
- create a visual color picker with the ability to save favourite colors
- consider moving scenes to a separate panel
- add ability to select from a couple different layout designs
- look into light rules - [rules API](http://www.developers.meethue.com/documentation/rules-api)
- look into light sensors - [sensors API](http://www.developers.meethue.com/documentation/supported-sensors)
- gain better understanding of Polymer to see if there is a better way to track slider value changes than attaching a boatload eventListeners
- consider making a Polymer element out of the color picker
- consider using [tinycolor2](https://www.npmjs.com/package/tinycolor2) or other color manipulation library
- create extension API with documentation
- make bundle production ready (minimize js/css, figure out best building solution)


*some links require Philips Hue API login
