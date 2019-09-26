var GenerateJSModule = require("../generate/GenerateJSModule");
var util = require('util');

function ComponentJS() {
	GenerateJSModule.apply(this, arguments);
}

util.inherits(ComponentJS, GenerateJSModule);

ComponentJS.prototype.getCode = function(ioModuleProperties, fnModuleContent) {
	if (ioModuleProperties) {
		this.setModuleProperties(ioModuleProperties);
	}

	return this.createBaseStructure(fnModuleContent);
};

ComponentJS.prototype.getModuleName = function() {
	if (!this._oModuleProperties.moduleName) {
		this._oModuleProperties.moduleName = "Component";
	}

	return this._oModuleProperties.moduleName;
};

ComponentJS.prototype.getBaseClassName = function() {
	if (!this._oModuleProperties.baseClassName) {
		this._oModuleProperties.baseClassName = "UIComponent";
	}

	return this._oModuleProperties.baseClassName;
};

ComponentJS.prototype.getUsedModules = function() {
	if (!this._oModuleProperties.usedModules) {
		this._oModuleProperties.usedModules = ["sap.ui.core.UIComponent", "sap.ui.Device"];
	}

	return this._oModuleProperties.usedModules;
};

module.exports = ComponentJS;