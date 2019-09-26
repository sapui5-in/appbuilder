function GenerateManifest() {}

GenerateManifest.prototype._oManifestComponents = {
		projectName: "",
		namespace: "sapui5in",
		projectVersion: "1.0.0",
		sapUiVersion: "1.54.7",
		sapUiMinVersion: "1.48.7",
		viewType: "XML",
		fullWidth: true,
		views: [{
			viewName: "Home",
			viewId: "HomeView",
			viewType: "XML",
			viewPath: ""
		}],
		resources: [{
			type: "css",
			url: "css/style.css"
		}],
		libraries: ["sap.m"],
		supportedThemes: ["sap_hcb", "sap_belize"]
};

GenerateManifest.prototype.setManifestComponents = function(ioManifestComponents) {
	this._oManifestComponents = ioManifestComponents;
};

GenerateManifest.prototype.getCode = function(ioManifestComponents) {
	this.setManifestComponents(ioManifestComponents);
	var roCode = {
			"_version": this.getProjectVersion(),
			"sap.app": this.getSapAppNode(),
			"sap.ui": this.getUINode(),
			"sap.ui5": this.getUI5Node()
	};

	return roCode;
};

//sap.app Node
GenerateManifest.prototype.getSapAppNode = function() {
	return {
		"id": this.getRootPath(),
		"type": "application",
		"i18n": "i18n/i18n.properties",
		"applicationVersion": {
			"version": "1.0.0"
		},
		"title": "{{" + this.getProjectName() + "}}",
		"description": "{{" + this.getProjectName() + "}}",
		"sourceTemplate": {
			"id": "ui5template.basicSAPUI5ApplicationProject",
			"version": "1.40.12"
		}
	};
};

//sap.ui Node
GenerateManifest.prototype.getUINode = function() {
	return {
		"technology": "UI5",
		"fullWidth": true,
		"icons": {
			"icon": "",
			"favIcon": "",
			"phone": "",
			"phone@2": "",
			"tablet": "",
			"tablet@2": ""
		},
		"deviceTypes": {
			"desktop": true,
			"tablet": false,
			"phone": false
		},
		"supportedThemes": this.getSupportedThemes()
	};
};

//sap.app Node
GenerateManifest.prototype.getUI5Node = function() {
	var roNode = {
			"rootView": {
				"viewName": this.getRootPath() + ".view" + ".App",
				"type": this.getViewType()
			},
			"dependencies": this.getDependenciesNode(),
			"contentDensities":  {
				"compact": true,
				"cozy": false
			},
			"models": this.getModels(),
			"resources": this.getResources(),
			"routing": this.getRoutingNode()
	};

	return roNode;
};

GenerateManifest.prototype.getRootPath = function() {
	var rsRootPath = this.getProjectName();

	if (this.getNamespace()) {
		rsRootPath = this.getNamespace() + "." + rsRootPath;
	}

	return rsRootPath;
};

GenerateManifest.prototype.getProjectVersion = function() {
	return this._oManifestComponents.projectVersion;
};

GenerateManifest.prototype.getViews = function() {
	return this._oManifestComponents.views;
};

GenerateManifest.prototype.getProjectName = function() {
	return this._oManifestComponents.projectName;
};

GenerateManifest.prototype.getNamespace = function() {
	return this._oManifestComponents.namespace;
};

GenerateManifest.prototype.getViewType = function() {
	return this._oManifestComponents.viewType;
};

GenerateManifest.prototype.getLibraries = function() {
	return this._oManifestComponents.libraries;
};

GenerateManifest.prototype.getSupportedThemes = function() {
	return this._oManifestComponents.supportedThemes;
};

GenerateManifest.prototype.getModels = function() {
	return {
		"i18n": {
			"type": "sap.ui.model.resource.ResourceModel",
			"settings": {
				"bundleName": this.getRootPath() + ".i18n.i18n"
			}
		}
	};
};

GenerateManifest.prototype.getResources = function() {
	var roResources = {};
	var laResources = this._oManifestComponents.resources;

	for (var i=0;i<laResources.length;i++) {
		roResources[laResources[i].type] = {
				uri: laResources[i].url
		};
	}

	return roResources;
};

GenerateManifest.prototype.getDependenciesNode = function() {
	var roNode = {
			"minUI5Version": "1.30.0",
			"libs": {}
	};

	var laLibraries = this.getLibraries();
	for (var i=0;i<laLibraries.length;i++) {
		roNode.libs[laLibraries[i]] = {};
	}

	return roNode;
};

GenerateManifest.prototype.getRoutingNode = function() {
	var roRouting = {
			"config": {
				"routerClass": "sap.m.routing.Router",
				"viewType": this.getViewType(),
				"async": true,
				"viewPath": this.getRootPath() + ".view",
				"controlAggregation": "pages",
				"controlId": "idAppControl",
				"clearControlAggregation": false
			}
	};

	var loRoutingAndTarget = this.getRoutingAndTarget();
	roRouting.routes = loRoutingAndTarget.routes;
	roRouting.targets = loRoutingAndTarget.targets;

	return roRouting;
};

GenerateManifest.prototype.getRoutingAndTarget = function() {
	var roRoutingAndTarget = {
			"routes": [],
			"targets": {}
	};
	var loRouteNode = {};
	var loTargetNode = {};

	var laViews = this.getViews();

	for (var i=0;i<laViews.length;i++) {
		loRouteNode.pattern = laViews[i].viewName;
		loRouteNode.name = laViews[i].viewName;
		loRouteNode.target = laViews[i].viewName;

		roRoutingAndTarget.routes.push(loRouteNode);
		loRouteNode = {};

		loTargetNode[laViews[i].viewName] = {
				"viewName": laViews[i].viewName,
				"viewId": laViews[i].viewId ? laViews[i].viewId : laViews[i].viewName + "View"
		};

		if (laViews[i].viewType) {
			loTargetNode[laViews[i].viewName].viewType = laViews[i].viewType;
		}

		if (laViews[i].viewPath) {
			loTargetNode[laViews[i].viewName].viewPath = laViews[i].viewPath;
		}
	}

	roRoutingAndTarget.targets = loTargetNode;

	return roRoutingAndTarget;
};

module.exports = GenerateManifest;