sap.ui.define([
	"sap/ui/core/mvc/Controller"
	], function(Controller) {
	"use strict";

	return Controller.extend("sapui5in.appbuilder.controller.Login", {

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("login").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(ioEvent) {

		}
	});
});