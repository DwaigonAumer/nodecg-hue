var huePanel;

for (var i = window.top.frames.length - 1; i >= 0; i--) {
   if (window.top.frames[i].document.title == "hue-panel") {
      huePanel = window.top.frames[i];
   }
}

document.addEventListener('WebComponentsReady', function() {
   // listeners for tab selections
   var sectionSelectTabs = document.querySelectorAll('.section-select-tab');
   for (var i = sectionSelectTabs.length - 1; i >= 0; i--) {
      sectionSelectTabs[i].addEventListener('click', function() {
         document.querySelector('iron-pages#edit-hue-pages').selected = this.closest('paper-tabs').selected;
      });
   }
});

huePanel.document.addEventListener('bridgeDataLoaded', function() {
   refreshOverviewUi();
   refreshLightsUi();
   refreshScenesUi();
   refreshSchedulesUi();
});

function refreshOverviewUi() {
   // clear old overview list items
   var overviewListbox = document.querySelector('#overview-listbox');

   if (overviewListbox !== null) {
      while (overviewListbox.lastElementChild) {
         Polymer.dom(overviewListbox).removeChild(overviewListbox.lastElementChild);
      }
   }

   // add new overview list items
   // TEMP - when supporting multiple bridges change this to loop through all bridges
   for (var i = 0; i < 1; i++) {
      var overviewItem = document.createElement('paper-item');
      Polymer.dom(overviewItem).textContent = "#" + (i+1) + " | " + huePanel.config.name;
      overviewItem.addEventListener('click', function(event){console.log('pressed item: ' + event.target.parentElement.selected)});
      Polymer.dom(overviewListbox).appendChild(overviewItem);
   }

   // clear old overview detail items
   var overviewDetailContainer = document.querySelector('#edit-overview .details-info');

   if (overviewDetailContainer !== null) {
      while (overviewDetailContainer.lastElementChild) {
         Polymer.dom(overviewDetailContainer).removeChild(overviewDetailContainer.lastElementChild);
      }
   }

   // add detail inputs for the first selected item
   for (var i = 0; i < Object.keys(huePanel.config).length; i++) {
      Polymer.dom(overviewListbox).node.select(0);
      var overviewDetailItem = document.createElement('paper-input');
      Polymer.dom(overviewDetailItem).setAttribute('label', Object.keys(huePanel.config)[i]);
      Polymer.dom(overviewDetailItem).setAttribute('value', huePanel.config[Object.keys(huePanel.config)[i]]);
      Polymer.dom(overviewDetailItem).setAttribute('class', "details-input");
      overviewDetailContainer.appendChild(overviewDetailItem);
   }
}

function refreshLightsUi() {
   // clear old lights list items
   var lightsListbox = document.querySelector('#lights-listbox');

   if (lightsListbox !== null) {
      while (lightsListbox.lastElementChild) {
         Polymer.dom(lightsListbox).removeChild(lightsListbox.lastElementChild);
      }
   }

   // add new lights list items
   // TEMP - when supporting multiple bridges change this to loop through all bridges
   for (var i = 0; i < Object.keys(huePanel.lights).length; i++) {
      var lightsItem = document.createElement('paper-item');
      Polymer.dom(lightsItem).textContent = "#" + (i+1) + " | " + huePanel.lights[i+1].name;
      lightsItem.addEventListener('click', function(event){console.log('pressed item: ' + event.target.parentElement.selected)});
      Polymer.dom(lightsListbox).appendChild(lightsItem);
   }

   Polymer.dom(lightsListbox).node.select(0);
}

function refreshScenesUi() {
   // clear old scenes list items
   var scenesListbox = document.querySelector('#scenes-listbox');

   if (scenesListbox !== null) {
      while (scenesListbox.lastElementChild) {
         Polymer.dom(scenesListbox).removeChild(scenesListbox.lastElementChild);
      }
   }

   // add new scenes list items
   // TEMP - when supporting multiple bridges change this to loop through all bridges
   for (var i = 0; i < Object.keys(huePanel.scenes).length; i++) {
      var scenesItem = document.createElement('paper-item');
      Polymer.dom(scenesItem).textContent = "#" + (i+1) + " | " + huePanel.scenes[Object.keys(huePanel.scenes)[i]].name;
      scenesItem.addEventListener('click', function(event){console.log('pressed item: ' + event.target.parentElement.selected)});
      Polymer.dom(scenesListbox).appendChild(scenesItem);
   }

   Polymer.dom(scenesListbox).node.select(0);
}

function refreshSchedulesUi() {
   // clear old schedules list items
   var schedulesListbox = document.querySelector('#schedules-listbox');

   if (schedulesListbox !== null) {
      while (schedulesListbox.lastElementChild) {
         Polymer.dom(schedulesListbox).removeChild(schedulesListbox.lastElementChild);
      }
   }

   // add new schedules list items
   // TEMP - when supporting multiple bridges change this to loop through all bridges
   for (var i = 0; i < Object.keys(huePanel.schedules).length; i++) {
      var schedulesItem = document.createElement('paper-item');
      Polymer.dom(schedulesItem).textContent = "#" + (i+1) + " | " + huePanel.schedules[Object.keys(huePanel.schedules)[i]].name;
      schedulesItem.addEventListener('click', function(event){console.log('pressed item: ' + event.target.parentElement.selected)});
      Polymer.dom(schedulesListbox).appendChild(schedulesItem);
   }

   Polymer.dom(schedulesListbox).node.select(0);
}