sap.ui.define([
	"sap/ui/core/mvc/Controller"
	], function(Controller) {
	"use strict";

	return Controller.extend("sapui5in.appbuilder.controller.Home", {

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(ioEvent) {

		},

		onPressAppDesigner: function(ioEvent) {
			this.getOwnerComponent().getRouter().navTo("appDesigner", {
				key: "appDesigner"
			}, true);
		},

		onPressCustomControl: function(ioEvent) {
			this.getOwnerComponent().getRouter().navTo("customControl", {
				key: "customControl"
			}, true);
		},
		
		onPressLogout: function() {
			console.log("Logout Pressed");
			window.location.replace(window.location.origin + "/auth/logout");
		}
	});
});