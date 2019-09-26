var GenerateJSModule = require("../generate/GenerateJSModule");
var util = require('util');

function Controller() {
	GenerateJSModule.apply(this, arguments);
}

util.inherits(Controller, GenerateJSModule);

Controller.prototype.getCode = function(ioModuleProperties, fnModuleContent) {
	var _self = this;
	if (ioModuleProperties) {
		this.setModuleProperties(ioModuleProperties);
	}

	function fnModuleContent() {
		return _self.createModuleContent();
	}

	return this.createBaseStructure(fnModuleContent);
};

Controller.prototype.createModuleContent = function() {
	var raCode = [];
	var lsCodeLine = "";

	lsCodeLine = "onInit: function() {";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	lsCodeLine = "this.getOwnerComponent().getRouter().getRoute(\"" + this.getModuleName() + "\").attachPatternMatched(this._onRouteMatched, this);"
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	lsCodeLine = "},";
	lsCodeLine += this._sNewLineChar;
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	raCode = raCode.concat(this.createRouteMatched());

	return raCode;
};

Controller.prototype.createRouteMatched = function() {
	var raCode = [];
	var lsCodeLine = "";

	lsCodeLine = "_onRouteMatched: function() {";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	lsCodeLine = "},";
	lsCodeLine += this._sNewLineChar;
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	return raCode;
};

Controller.prototype.getModuleName = function() {
	if (!this._oModuleProperties.moduleName) {
		this._oModuleProperties.moduleName = "Home";
	}

	return this._oModuleProperties.moduleName;
};

Controller.prototype.getBaseClassName = function() {
	if (!this._oModuleProperties.baseClassName) {
		this._oModuleProperties.baseClassName = "Controller";
	}

	return this._oModuleProperties.baseClassName;
};

Controller.prototype.getUsedModules = function() {
	if (!this._oModuleProperties.usedModules) {
		this._oModuleProperties.usedModules = ["sap.ui.core.mvc.Controller", "sap.ui.Device"];
	}

	return this._oModuleProperties.usedModules;
};

Controller.prototype.getModuleFolderPath = function() {
	if (!this._oModuleProperties.moduleFolderPath) {
		this._oModuleProperties.moduleFolderPath = "controller";
	}

	return this._oModuleProperties.moduleFolderPath;
};

module.exports = Controller;