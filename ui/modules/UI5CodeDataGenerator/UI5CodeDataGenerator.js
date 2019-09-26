sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule"
	],
	function(jQuery, BaseModule) {
	"use strict";

	var UI5CodeDataGenerator = BaseModule.extend("sapui5in.appbuilder.modules.UI5CodeDataGenerator.UI5CodeDataGenerator", {

		metadata: {
			events: {
				treeItemPress: {}
			}
		},

		init: function() {
			var _self = this;
//			this._aXmlns = ["sap.ui.core.mvc"];
		},

		getCode: function(ioContext) {
			this._aXmlns = ["sap.ui.core.mvc"];

			if (ioContext.type === "Block" || ioContext.type === "View") {
				var loTree = ioContext.nodes[0];
				if (loTree && loTree.type) {
					var laXML = [];
					var laCode = this.generate(loTree, laXML, "", "appModel", "/");

					var loData = this.getSampleData(loTree);
					var lsCode = this.embedXMLCodeInsideView(laCode);

					return [lsCode, loData];
				} else {
					return ["", {}];
				}
			} else {
				return [];
			}
		},

		embedXMLCodeInsideView: function(isXMLCode) {
			var lsLine = "<mvc:View class=\"sapUiBody backgroundWhite\"";

			for (var i=0;i<this._aXmlns.length;i++) {
				lsLine += " xmlns" + (this.getXmlns(this._aXmlns[i]) ? ":" + this.getXmlns(this._aXmlns[i]) : "") + '="' + this._aXmlns[i] + '"';
			}
			lsLine += ">";

			lsLine += isXMLCode.join("\n");
			lsLine += "</mvc:View>";

			return lsLine;
		},

		getSampleData: function(ioAppTree, isControlName) {
			var roData = {};
			var laSelections = [];
			if (ioAppTree && ioAppTree.type && ioAppTree.type === "Control") {
				//Add Selected Properties
				if (ioAppTree.selections && ioAppTree.selections.properties && Object.keys(ioAppTree.selections.properties).length) {
					var loControl = eval("new " + ioAppTree.name + "()");
					for (var key in ioAppTree.selections.properties) {
						if (!ioAppTree.selections.properties[key].fixedValue) {
							if (loControl.getMetadata().getAllProperties()[key].defaultValue !== null
									&& loControl.getMetadata().getAllProperties()[key].defaultValue !== "") {
								roData[key] = loControl.getMetadata().getAllProperties()[key].defaultValue;
							} else {
								if (loControl.getMetadata().getAllProperties()[key].type === "string") {
									if (loControl.getMetadata().getAllProperties()[key].group === "Appearance"
										&& key.indexOf("color") !== -1) {
										roData[key] = "red";
									} else {
										roData[key] = key;
									}
								} else if (loControl.getMetadata().getAllProperties()[key].type === "boolean") {
									roData[key] = true;
								} else if (loControl.getMetadata().getAllProperties()[key].type === "int") {
									roData[key] = 1;
								} else if (loControl.getMetadata().getAllProperties()[key].type === "sap.ui.core.CSSSize") {
									roData[key] = "100%";
								} else if (loControl.getMetadata().getAllProperties()[key].type === "sap.ui.core.URI") {
									roData[key] = "sap-icon://add";
								}
							}
						}
					}

					loControl.destroy();
				}

				if (ioAppTree.nodes && ioAppTree.nodes.length) {
					for (var i=0;i<ioAppTree.nodes.length;i++) {
						if (ioAppTree.nodes[i].aggregationType === "Template") {
							roData[ioAppTree.nodes[i].name]= [];
							for (var j=0;j<5;j++) {
								roData[ioAppTree.nodes[i].name].push(this.getSampleData(ioAppTree.nodes[i], ioAppTree.name));
							}
						} else {
							roData[ioAppTree.nodes[i].name] = this.getSampleData(ioAppTree.nodes[i], ioAppTree.name);
						}
					}
				}
			} else if (ioAppTree.type && ioAppTree.type === "Aggregation") {
				var lsKey = ioAppTree.name;				
				if (ioAppTree.nodes && ioAppTree.nodes.length) {
					if (ioAppTree.aggregationType === "Template") {
						roData = {};
						for (var i=0;i<ioAppTree.nodes.length;i++) {
							roData = this.getSampleData(ioAppTree.nodes[i], ioAppTree.name);
						}
					} else {
						roData = [];
						for (var i=0;i<ioAppTree.nodes.length;i++) {
							roData.push(this.getSampleData(ioAppTree.nodes[i], ioAppTree.name));
						}
					}
				}
			}

			return roData;
		},

		generate: function(ioAppTree, iaXML, isControlName, isModelName, isPath) {
			var lsLine = "";
			var laSelections = [];
			if (ioAppTree && ioAppTree.type && ioAppTree.type === "Control") {
				var loControl = eval("new " + ioAppTree.name + "()");
				var lsLibraryName = loControl.getMetadata().getLibraryName();
				var lsNamespace = this.getXmlns(lsLibraryName);
				lsLine = "<" + (lsNamespace ? (lsNamespace + ":") : "") + ioAppTree.name.replace((lsLibraryName + "."), "") + " id=\"" + ioAppTree.controlId + "\"";

				//Add Selected Properties
				if (ioAppTree.selections && Object.keys(ioAppTree.selections).length) {
					laSelections = laSelections.concat(this.getSelectionsString(ioAppTree.name.replace(lsLibraryName + ".", ""), ioAppTree.selections, ioAppTree.nodes, isModelName, isPath));
				}

				//Add the Aggregation bindings
				if (ioAppTree.nodes) {
					laSelections = laSelections.concat(this.getAggregationBindings(ioAppTree.nodes, isModelName, isPath));
				}
				lsLine = lsLine + " " + laSelections.join(" ");

				if (ioAppTree.nodes && ioAppTree.nodes.length) {
					lsLine += ">";
					iaXML.push(lsLine);
					for (var i=0;i<ioAppTree.nodes.length;i++) {
						if (ioAppTree.nodes[i].aggregationType && ioAppTree.nodes[i].aggregationType === "Template") {
							iaXML = iaXML.concat(this.generate(ioAppTree.nodes[i], [], ioAppTree.name, isModelName, ""));
						} else {
							var lsPath = "";
							if (isPath) {
								lsPath = isPath + "/" + ioAppTree.nodes[i].name;
							} else {
								lsPath = ioAppTree.nodes[i].name;
							}
							if (lsPath.indexOf("//") !== -1) {
								lsPath = lsPath.replace("//", "/");
							}
							iaXML = iaXML.concat(this.generate(ioAppTree.nodes[i], [], ioAppTree.name, isModelName, lsPath));
						}
					}
					iaXML.push("</" + (lsNamespace ? (lsNamespace + ":") : "") + ioAppTree.name.replace(lsLibraryName + ".", "") + ">");
				} else {
					lsLine += "/>";
					iaXML.push(lsLine);
				}

				loControl.destroy();
			} else if (ioAppTree && ioAppTree.type && ioAppTree.type === "Aggregation") {
				var loControl = eval("new " + isControlName + "()");
				var lsLibraryName = loControl.getMetadata().getLibraryName();
				var lsNamespace = this.getXmlns(lsLibraryName);

				lsLine = "<" + (lsNamespace ? (lsNamespace + ":") : "") + ioAppTree.name + ">";
				iaXML.push(lsLine);

				if (ioAppTree.nodes && ioAppTree.nodes.length) {
					for (var i=0;i<ioAppTree.nodes.length;i++) {
						var lsPath =  "";
						if (ioAppTree.aggregationType === "Template") {
							iaXML = iaXML.concat(this.generate(ioAppTree.nodes[i], [], "", isModelName, ""));
						} else {
							if (ioAppTree.nodes[i].type && ioAppTree.nodes[i].type === "Block") {
								ioAppTree.nodes[i] = ioAppTree.nodes[i].nodes[0];
							}
							lsPath =  isPath + "/" + i;
							iaXML = iaXML.concat(this.generate(ioAppTree.nodes[i], [], "", isModelName, lsPath + "/"));	
						}
					}
				}
				lsLine = "</" + (lsNamespace ? (lsNamespace + ":") : "") + ioAppTree.name + ">";
				iaXML.push(lsLine);
				loControl.destroy();
//			} else if (ioAppTree.type && ioAppTree.type === "Block") {
//				this.generate(ioAppTree.nodes[0], iaXML, isControlName, isModelName, isPath);
			}

			return iaXML;
		},

		getSelectionsString: function(isControlName, ioSelections, iaNodes, isModelName, isPath) {
			var raSelections = [];

			var laSelectionsProperties = this.getSelectionsProperties(isControlName, ioSelections, isModelName, isPath);
			var laSelectionsEvents = this.getSelectionsEvents(isControlName, ioSelections);

			raSelections = raSelections.concat(laSelectionsProperties);
			raSelections = raSelections.concat(laSelectionsEvents);

			return raSelections;
		},

		getSelectionsProperties: function(isControlName, ioSelections, isModelName, isPath) {
			var lsValue = "";
			var raSelectedProperties = [];
			if (ioSelections.properties) {
				for (var key in ioSelections.properties) {
					if (key === "styleClass" && ioSelections.properties.styleClass.value) {
						key = "class";
						lsValue = ioSelections.properties.styleClass.value;
					} else {
						if (ioSelections.properties[key].fixedValue) {
							lsValue = ioSelections.properties[key].value;
						} else {
							lsValue = "{" + isModelName +">" + isPath + key + "}";
						}
					}
					raSelectedProperties.push(key + "=\"" + lsValue + "\"");
				}
			}

			return raSelectedProperties;
		},

		getSelectionsEvents: function() {
			var raSelectedEvents = [];

			return raSelectedEvents;
		},

		getAggregationBindings: function(iaNodes, isModelName, isPath) {
			var raAggregations = [];
			for (var i=0;i<iaNodes.length;i++) {
				if (iaNodes[i].type === "Aggregation" && iaNodes[i].aggregationType === "Template") {
					raAggregations.push(iaNodes[i].name + "=\"" + "{" + isModelName +">" + isPath + iaNodes[i].name + "}" + "\"");
				}
			}

			return raAggregations;
		},

		getXmlns: function(isLibraryName) {
			var loXmlnsMapping = {
					"sap.m": "",
					"sap.ui.layout": "l",
					"sap.ui.core.mvc": "mvc",
					"sap.ui.core": "core",
					"sap.ui.table": "table",
					"sap.ui.commons": "commons",
					"sap.f": "f",
					"sap.uxap": "u",
					"sap.ui.comp.filterbar": "filterbar"
			};

			if (this._aXmlns.indexOf(isLibraryName) === -1) {
				this._aXmlns.push(isLibraryName);
			}

			return loXmlnsMapping[isLibraryName];
		}
	});

	return UI5CodeDataGenerator;
}, /* bExport= */ true);