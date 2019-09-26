sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/Device"],
function(Controller, Device) {
"use strict";

return Controller.extend("sapui5in.PR1.controller.FirstView", {

onInit: function() {
this.getOwnerComponent().getRouter().getRoute("FirstView").attachPatternMatched(this._onRouteMatched, this);
},

_onRouteMatched: function() {
},

});
});
