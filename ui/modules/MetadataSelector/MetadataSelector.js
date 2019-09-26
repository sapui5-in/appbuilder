sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/ControlSelection",
	"sapui5in/appbuilder/modules/ControlMetadata",
	"sapui5in/appbuilder/modules/MetadataSelector/IconSelection",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, ControlSelection, ControlMetadata, IconSelection, Ajax) {
	"use strict";

	var MetadataSelector = BaseModule.extend("sapui5in.appbuilder.modules.MetadataSelector.MetadataSelector", {

		metadata: {
			properties: {
				availableLibraries: {
					type: "object"
				}
			},

			events: {
				treeItemPress: {},
				changeBlockName: {},
				selectProperty: {},
				selectAggregation: {},
				changeStyleClass: {},
				selectEvent: {},
				changeAggregationType: {},
				setTemplate: {},
				addManualControl: {},
				pressIconFixedValue: {},
				changeValueProperty: {},
				selectionChangeRootControl: {},
				dropWithSubNodes: {},
				dropWithoutSubNodes: {}
			}
		},

		init: function() {
			var _self = this;

			var loModel = new sap.ui.model.json.JSONModel();
			loModel.setSizeLimit(2000);

//			this._oContainer = new sap.m.VBox({
//				height: "100%",
//				visible: "{= ${msModel>/selectedContext/type}? true : false}"
//			});
//
//			this.getMSContainer().addItem(sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.UpdateBlock", this));
//			this.getMSContainer().addItem(sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.MetadataSelector", this));
//			this.getMSContainer().addItem(sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.AggregationSelector", this));
//			this.getMSContainer().setModel(loModel, "msModel");
		},

//		initialize: function() {
//			var _self = this;
//			this.setControlTypes();
//			this.getModel().setProperty("/viewTypes", [{
//				key: "XML",
//				text: "XML View"
//			}, {
//				key: "JS",
//				text: "JS View"
//			}, {
//				key: "JSON",
//				text: "JSON View"
//			}]);
//
//			this.oControlSelection = new ControlSelection({
//				dropWithSubNodes: function(ioEvent) {
//					_self.fireDropWithSubNodes(ioEvent);
//				},
//				dropWithoutSubNodes: function(ioEvent) {
//					_self.fireDropWithoutSubNodes(ioEvent);
//				}
//			});
//			this.oControlSelection.setModel(this.getModel(), "msModel");
//
//			sap.ui.core.Fragment.byId("AppDesigner", "idVBoxAggregationSelector").addItem(this.oControlSelection.getBlockList());
//		},

//		update: function(ioSelectedItemObject) {
//			var loSelectedItemObject = ioSelectedItemObject;
//			var loControlMetadata = ControlMetadata.getMetadata(loSelectedItemObject.name);
//			this.getModel().setProperty("/controlMetadata", loControlMetadata);
//
//			if (!loSelectedItemObject.selections) {
//				loSelectedItemObject.selections = {};
//			}
//
//			//Select the Selected Properties, Aggregations and Events
//			this.addSelectedKeyInTable("idControlProperties", loSelectedItemObject.selections.properties, loControlMetadata.properties);
//			this.addSelectedKeyInTable("idControlAggregations", loSelectedItemObject.nodes, loControlMetadata.aggregations);
//			this.addSelectedKeyInTable("idControlEvents", loSelectedItemObject.selections.events, loControlMetadata.events);
//			if (loSelectedItemObject.selections && loSelectedItemObject.selections.properties
//					&& loSelectedItemObject.selections.properties.styleClass && loSelectedItemObject.selections.properties.styleClass.value) {
//				sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue(loSelectedItemObject.selections.properties.styleClass.value);
//			} else {
//				sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue();
//			}
//
//			this.getModel().refresh();
//		},
//
//		addSelectedKeyInTable: function(isTableId, iaSelections, iaMetadata) {
//			var loTable = sap.ui.core.Fragment.byId("AppDesigner", isTableId);
//			loTable.setSelectedIndex(-1);
//
//			if (isTableId === "idControlAggregations") {
//				if (iaSelections && iaMetadata) {
//					for (var i = 0; i < iaMetadata.length; i++) {
//						for (var j = 0; j < iaSelections.length; j++) {
//							if (iaSelections[j].name === iaMetadata[i].name) {
//								loTable.getContextByIndex(i).getObject().rowSelected = true;
//								loTable.addSelectionInterval(i, i);
//								break;
//							}
//						}
//					}
//				}
//			} else {
//				if (iaSelections && iaMetadata) {
//					for (i = 0; i < iaMetadata.length; i++) {
//						for (j = 0; j < Object.keys(iaSelections).length; j++) {
//							if (Object.keys(iaSelections)[j] === iaMetadata[i].name) {
//								loTable.addSelectionInterval(i, i);
//								loTable.getContextByIndex(i).getObject().rowSelected = true;
//								if (iaSelections[iaMetadata[i].name].fixedValue) {
//									loTable.getContextByIndex(i).getObject().value = iaSelections[iaMetadata[i].name].value;
//									loTable.getContextByIndex(i).getObject().fixedValue = iaSelections[iaMetadata[i].name].fixedValue;
//								}
//								break;
//							}
//						}
//					}
//				}
//			}
//		},
//
//		getModel: function() {
//			return this.getMSContainer().getModel("msModel");
//		},
//
//		getMSContainer: function() {
//			return this._oContainer;
//		},
//
//		showValueInputField: function(isType, ibShow) {
//			if (isType === "boolean") {
//				return false;
//			} else {
//				if (ibShow) {
//					return false;
//				} else {
//					return true;
//				}
//			}
//		},
//
//		showValueCheckBox: function(isType) {
//			if (isType === "boolean") {
//				return true;
//			} else {
//				return false;
//			}
//		},
//
//		setPropertyValueSelected: function(isType, value) {
//			if (isType === "boolean") {
//				if (value) {
//					return true;
//				} else {
//					return false;
//				}
//			} else {
//				return false;
//			}
//		},
//
//		setPropertyValueInputType: function(isType) {
//			if (isType === "int" || isType === "float") {
//				return sap.m.InputType.Number;
//			} else {
//				return sap.m.InputType.Text;
//			}
//		},
//
//		setFixedValueIconColor: function(ibFixedValue, ibRowSelected) {
//			if (ibRowSelected) {
//				if (ibFixedValue) {
//					return "red";
//				} else {
//					return "green";
//				}
//			} else {
//				return "#dfdfdf";
//			}
//		},

//		onRowSelectionChangeControlProperties: function(ioEvent) {
//			if (ioEvent.getParameter("rowContext")) {
//				var loRowContextObj = ioEvent.getParameter("rowContext").getObject();
//
//				if (!ioEvent.getParameter("userInteraction")) {
//					return;
//				}
//				if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
//					loRowContextObj.rowSelected = true;
//				} else if (ioEvent.getParameter("rowContext")) {
//					loRowContextObj.rowSelected = false;
//				}
//				this.getModel().refresh();
//
//				if (ioEvent.getParameter("userInteraction")) {
//					var loSelectedNode = {};
//					loSelectedNode[loRowContextObj.name] = {
//							fixedValue: loRowContextObj.fixedValue,
//							value: loRowContextObj.value
//					};
//					this.fireSelectProperty(loSelectedNode);
//				}
//			}
//		},
//
//		onRowSelectionChangeControlAggregations: function(ioEvent) {
//			if (!ioEvent.getParameter("userInteraction")) {
//				return;
//			}
//			var loRowContextObj = ioEvent.getParameter("rowContext").getObject();
//			if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
//				loRowContextObj.rowSelected = true;
//			} else if (ioEvent.getParameter("rowContext")) {
//				loRowContextObj.rowSelected = false;
//			}
//			this.getModel().refresh();
//
//			if (ioEvent.getParameter("userInteraction")) {
//				var loSelectedNode = {
//						name: loRowContextObj.name,
//						label: loRowContextObj.label,
//						type: "Aggregation",
//						aggregationType: "Manual",
//						multiple: loRowContextObj.multiple,
//						bindable: loRowContextObj.bindable
//				};
//				this.fireSelectAggregation(loSelectedNode);
//			}
//		},
//
//		onRowSelectionChangeControlEvents: function(ioEvent) {
//			if (!ioEvent.getParameter("userInteraction")) {
//				return;
//			}
//			var loRowContextObj = ioEvent.getParameter("rowContext").getObject();
//			if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
//				loRowContextObj.rowSelected = true;
//			} else if (ioEvent.getParameter("rowContext")) {
//				loRowContextObj.rowSelected = false;
//			}
//			this.getModel().refresh();
//
//			if (ioEvent.getParameter("userInteraction")) {
//				var loSelectedNode = {};
//				loSelectedNode[loRowContextObj.name] = {
//						value: loRowContextObj.value
//				};
//				this.fireSelectEvent(loSelectedNode);
//			}
//		},

		/**
		 * 
		 */
//		onChangeControlStyleClass: function(ioEvent) {
//			this.fireChangeStyleClass(ioEvent.getSource().getValue());
//		},
//
//		onSelectionChangeAggregationType: function(ioEvent) {
//			var loModel = this.getModel();
//
//			if (ioEvent.getSource().getSelectedKey() === "Template") {
//				loModel.setProperty("/selectedContext/aggregationType", "Template");
//				this.fireChangeAggregationType("Template");
//			} else {
//				loModel.setProperty("/selectedContext/aggregationType", "Manual");
//				this.fireChangeAggregationType("Manual");
//			}
//		},
//
//		onPressAddControlInAggregation: function(ioEvent) {
//			if (this.getModel().getProperty("/selectedContext/aggregationType") === "Manual") {
//				this.fireAddManualControl(ioEvent.getSource().getParent().getParent().getItems()[2].getSelectedKey());
//			} else {
//				this.fireSetTemplate(ioEvent.getSource().getParent().getParent().getItems()[2].getSelectedKey());
//			}
//		},
//
//		onSelectionChangeValueProperty: function(ioEvent) {
//			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
//			loSelectedContext.fixedValue = true;
//			this.getModel().refresh();
//
//			this.fireChangeValueProperty(loSelectedContext);
//		},
//
//		onSelectCBValueProperty: function(ioEvent) {
//			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
//			loSelectedContext.value = ioEvent.getSource().getSelected();
//			loSelectedContext.fixedValue = true;
//			this.getModel().refresh();
//
//			this.fireChangeValueProperty(loSelectedContext);
//		},
//
//		onChangeValueProperty: function(ioEvent) {
//			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
//			loSelectedContext.fixedValue = true;
//			this.getModel().refresh();
//
//			this.fireChangeValueProperty(loSelectedContext);
//		},
//
//		onPressIconFixedValue: function(ioEvent) {
//			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
//			loSelectedContext.fixedValue = !loSelectedContext.fixedValue;
//			if (!loSelectedContext.fixedValue) {
//				loSelectedContext.value = loSelectedContext.defaultValue;
//			}
//			this.getModel().refresh();
//
//			this.firePressIconFixedValue(loSelectedContext);
//		},
//
//		populateAggregationList: function(ioControlObject, ioAggregationObject) {
//			var lsControlName = ioControlObject.name;
//			var lsAggregationName = ioAggregationObject.name;
//
//			var laControlList = this.getModel().getProperty("/controlList");
//			var laAggregationControlsList = [];
//
//			for (var i=0;i<laControlList.length;i++) {
//				if (this.isValidAggregation(lsControlName, lsAggregationName, laControlList[i].key)) {
//					laAggregationControlsList.push(laControlList[i]);
//				}
//			}
//
//			this.getModel().setProperty("/templateControls", laAggregationControlsList);
//			this.getModel().setProperty("/manualControls", laAggregationControlsList);
//		},
//
//		setTemplateTypes: function(ioControl) {
//			this.getModel().setProperty("/templateControls", this.getAllControlNames());		
//		},
//
//		setManualControlTypes: function(ioControl) {
//			this.getModel().setProperty("/manualControls", this.getAllControlNames(this.getAvailableLibraries()));		
//		},
//
//		setControlTypes: function(ioControl) {
//			this.getModel().setProperty("/controlList", this.getAllControlNames(this.getAvailableLibraries()));
//		},
//
//		getAllControlNames: function(iaLibraries) {
//			var raControlList = [];
//			for (var i = 0; i < iaLibraries.length; i++) {
//				var iaKeys = eval(iaLibraries[i]);
//				for (var key in iaKeys) {
//					if (iaKeys[key].getMetadata) {
//						raControlList.push({
//							key: iaLibraries[i] + "." + key,
//							text: iaLibraries[i] + "." + key,
//							library: iaLibraries[i]
//						});
//					}
//				}
//			}
//
//			return raControlList;
//		},
//
//		selectRootControl: function(isType, iaNodes) {
//			if ((isType === "Block" || isType === "View") && iaNodes && iaNodes.length) {
//				return iaNodes[0].name;
//			} else {
//				return "";
//			}
//		},
//
//		onSelectionChangeRootControl: function(ioEvent) {
//			var lsSelectedKey = ioEvent.getSource().getParent().getParent().getItems()[5].getSelectedKey();
//
//			this.fireSelectionChangeRootControl(lsSelectedKey);
//		},
//
//		onChangeBlockName: function(ioEvent) {
//			if (ioEvent.getSource().getValue()) {
//				this.fireChangeBlockName(ioEvent.getSource().getValue());
//			} else {
//				sap.m.MessageToast.show("Name cannot be Empty");
//			}
//		},
//
//		onValueHelpRequest: function(ioEvent) {
//			var _self = this;
//			if (!this._oIconSelection) {
//				this._oIconSelection = new IconSelection({
//					iconSelectFromDialog: function(ioEvent) {
//						_self.getModel().refresh();
//						_self.fireChangeValueProperty(ioEvent.mParameters);
//					}
//				});
//			}
//
//			this._oIconSelection.open(ioEvent);
//		}
	});

	return MetadataSelector;
}, /* bExport= */ true);