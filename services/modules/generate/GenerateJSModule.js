function GenerateJSModule() {}

GenerateJSModule.prototype._sNewLineChar = "\n",

GenerateJSModule.prototype._oModuleProperties = {};

GenerateJSModule.prototype.getCode = function(ioModuleProperties, fnModuleContent) {
	if (ioModuleProperties) {
		GenerateJSModule.prototype.setModuleProperties(ioModuleProperties);
	}

	return this.createBaseStructure(fnModuleContent);
};

GenerateJSModule.prototype.setModuleProperties = function(ioModuleProperties) {
	GenerateJSModule.prototype._oModuleProperties = ioModuleProperties;
};

GenerateJSModule.prototype.getModuleName = function() {
	return this._oModuleProperties.moduleName;
};

GenerateJSModule.prototype.getBaseClassName = function() {
	return this._oModuleProperties.baseClassName;
};

GenerateJSModule.prototype.getRootPath = function() {
	var rsRootPath = this.getProjectName();

	if (this.getNamespace()) {
		rsRootPath = this.getNamespace() + "." + rsRootPath;
	}

	if (this.getModuleFolderPath()) {
		rsRootPath = rsRootPath + "." + this.getModuleFolderPath();
	}

	return rsRootPath;
};

GenerateJSModule.prototype.getProjectName = function() {
	return this._oModuleProperties.projectName;
};

GenerateJSModule.prototype.getNamespace = function() {
	return this._oModuleProperties.namespace;
};

GenerateJSModule.prototype.getModuleFolderPath = function() {
	return this._oModuleProperties.moduleFolderPath;
};

GenerateJSModule.prototype.createBaseStructure = function(fnModuleContent) {
	var lsCodeLine = "";
	var raCode = this.addModules();

	lsCodeLine = "\"use strict\";";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	raCode.push(this._sNewLineChar);

	lsCodeLine = "return " + this.getBaseClassName() + ".extend(\"" + this.getRootPath() + "." + this.getModuleName() + "\", {";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	raCode.push(this._sNewLineChar);

	//Create Module Content
	if (fnModuleContent) {
		raCode = raCode.concat(fnModuleContent());
	}

	//Ends the return
	lsCodeLine = "});";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	//Ends the Module
	lsCodeLine = "});";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	return raCode;
};

GenerateJSModule.prototype.createFunction = function(isFunctionName, iaArguements, fnContent) {
	var raCode = [];

	var lsCodeLine = isFunctionName + ":function(" + iaArguements.join(", ") + ");";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	//Generate the Content of the Function
	if (fnContent) {
		raCode.concat(fnContent());
	}

	lsCodeLine += "}";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	return raCode;
};

createFunctionContent = function() {

};

GenerateJSModule.prototype.addModules = function(fnModuleContent) {
	var laModules = this.getUsedModules();
	var lsCodeLine = "";
	var raCode = [];

	lsCodeLine = "sap.ui.define([";
	var laTempModules = [];
	for (var i=0;i<laModules.length;i++) {
		laTempModules.push("\"" + laModules[i].split(".").join("/") + "\"");
	}

	lsCodeLine = lsCodeLine + laTempModules.join(", ") + "],";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	laTempModules = [];
	for (var i=0;i<laModules.length;i++) {
		laTempModules.push(laModules[i].split(".")[laModules[i].split(".").length - 1]);
	}

	lsCodeLine = "function(" + laTempModules.join(", ") + ") {";
	lsCodeLine += this._sNewLineChar;
	raCode.push(lsCodeLine);

	return raCode;
};

GenerateJSModule.prototype.getUsedModules = function() {
	return this._oModuleProperties.usedModules;
};

module.exports = GenerateJSModule;