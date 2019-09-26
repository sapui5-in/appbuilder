const View = require("../generate/GenerateView");
const Manifest = require("../generate/GenerateManifest");
const I18n = require("../generate/GenerateI18n");
var ComponentJS = require("../generate/GenerateComponentJS");
var Controller = require("../generate/GenerateController");

//Create index.html
//Create Component.js
//Create manifest.js
//Create View
//Create the App View
//Create the Home View
//Create Controller
//Create css
//Create i18n
//Create 

module.exports = {

		getCode: function(ioProject) {			
			var laControllersImport = this.getControllerImport(ioProject);
			var laControllers = [];

			for (var i=0;i<laControllersImport.length;i++) {
				laControllers.push({
					viewName: laControllersImport[i].moduleName,
					code: this.getController(laControllersImport[i])
				});
			}

			var laViewXML = [];
			for (i=0;i<ioProject.codeData.length;i++) {
				laViewXML.push({
					viewName: ioProject.codeData[i].viewName,
					xml: this.getXmlCode(ioProject.codeData[i].code)
				});
			}

			return {
				index: this.getIndexHtml(),
				views: laViewXML,
				component: this.getComponent(this.parseComponentImport(ioProject)),
				manifest: this.getManifest(this.getManifestImport(ioProject)),
				i18n: this.getI18n(this.parseI18nImport(ioProject)),
				controllers: laControllers
			};
		},

		parseI18nImport: function() {
			return [{
				key: "appBuilder",
				text: "AppBuilder"
			}, {
				key: "appDesigner",
				text: "Application Designer"
			}];
		},

		parseComponentImport: function(ioProject) {
			return {
				projectName: ioProject.projectName,
				namespace: ioProject.namespace ? ioProject.namespace : "sapui5in"
			};
		},

		getManifestImport: function(ioProject) {
			var roManifest = {
					projectName: ioProject.projectName,
					namespace: ioProject.namespace,
					projectVersion: "1.0.0",
					sapUiVersion: ioProject.sapUiVersion ? ioProject.sapUiVersion : "1.54.7",
							sapUiMinVersion: ioProject.sapUiMinVersion ? ioProject.sapUiMinVersion : "1.48.7",
									viewType: ioProject.viewType ? ioProject.viewType : "XML",
											fullWidth: ioProject.fullWidth ? ioProject.fullWidth : true,
													views: ioProject.views ? ioProject.views : [],
															resources: [{
																type: "css",
																url: "css/style.css"
															}],
															supportedThemes: ioProject.views ? ioProject.views : ["sap_belize"]
			};

			if (ioProject.libraries) {
				roManifest.libraries = ioProject.libraries;
			} else {
				roManifest.libraries = ["sap.ui.core.mvc", "sap.ui.core", "sap.m"];
			}

			if (ioProject.resources) {
				roManifest.resources = resources.resources;
			} else {
				roManifest.libraries = [{
					type: "css",
					url: "css/style.css"
				}];
			}

			return roManifest;
		},

		getControllerImport: function(ioProject) {
			var raControllers = [];

			for (var i=0;i<ioProject.views.length;i++) {
				raControllers.push({
					projectName: ioProject.projectName,
					namespace: ioProject.namespace,
					moduleName: ioProject.views[i].viewName
				});
			}

			return raControllers;
		},

		getBeautifiedCode: function(ioCode) {
			var roCode = this.getCode(ioCode);

			return roCode;
		},

		getIndexHtml: function() {
			return "";
		},

		getXmlCode: function(isXml) {
			return View.getXml(isXml);
		},

		getManifest: function(ioCode) {
			var loManifest = new Manifest();

			return loManifest.getCode(ioCode);
		},

		getI18n: function(ioCode) {
			return I18n.getCode(ioCode);
		},

		getComponent: function(ioCode) {
			var loComponentJS = new ComponentJS();

			return loComponentJS.getCode(ioCode);
		},

		getController: function(ioCode) {
			var loController = new Controller();

			return loController.getCode(ioCode);
		},

		createFolderStructure: function() {
//			1. view
//			2. controller
//			3. model
//			4. css
//			5. i18n
//			6. media
//			7. controls
		},

		createProjectFiles: function() {

		}
};