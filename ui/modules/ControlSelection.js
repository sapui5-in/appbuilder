/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, Ajax) {
	"use strict";
	/**
	 * Class to enable Control Selection
	 * 
	 * @class Class to enable Control Selection
	 * @param {object} mProperties
	 *
	 * @author SAPUI5.in
	 * @version 1.0
	 * 
	 * @constructor
	 * @public
	 * @extends sapui5in.appbuilder.modules.BaseModule
	 * @name sapui5in.appbuilder.modules.ControlSelection
	 * 
	 */
	var ControlSelection = BaseModule.extend("sapui5in.appbuilder.modules.ControlSelection", {
		metadata: {
			properties: {

				/**
				 * text
				 */
				blocks: {
					type: "string",
					group: "Misc"
				}
			},
			events: {
				dropWithSubNodes: {},
				dropWithoutSubNodes: {},
				clickControl: {},
			}
		},

		init: function() {
			var _self = this;
			this.oModel = new sap.ui.model.json.JSONModel();
			var loParams = {
					type: "POST",
					url: "/blocks/getDesignerBlocklist",
					data: {
						isDesignerBlock: true
					},
					fnSuccess: function(iaData) {
						_self.oModel.setProperty("/templateControls", iaData);
					}
			};

			Ajax.call(loParams);
		},

		getBlockList: function() {
			if (!this.oBlockList) {
				this.oBlockList = new sap.m.List({
					id: "idControlList",
					headerText: "CONTROLS",
					width: "100%",
					items: {
						path: 'controlSelectionModel>/templateControls',
						sorter: {
							path: 'library',
							descending: false,
							group: true
						},
						templateShareable: true,
//						groupHeaderFactory: '.getGroupHeader',
						template: new sap.m.CustomListItem({
							type: "Active",
							content: [ new sap.m.HBox({
								height: "40px",
								items: [new sap.m.HBox({
									alignItems: "Center",
									justifyContent: "Center",
									width: "20%",
									items: [new sap.ui.core.Icon({
										size: "1.5rem",
										color: "Default",
										src: "sap-icon://add"
									}).addStyleClass("sapUiTinyMarginTop")]
								}), new sap.m.HBox({
									alignItems: "Center",
									width: "80%",
									items: [new sap.m.Label({
										text: "{controlSelectionModel>name}",
										textAlign: "Center"
									}).addStyleClass("sapUiTinyMarginTop")]
								})]
							})]
						})
					},
					mode: "SingleSelectMaster",
					growing: true,
					growingScrollToLoad: true,
					growingThreshold: 100,
					dragDropConfig: [new sap.ui.core.dnd.DragDropInfo({
						targetElement: "idProjectTree",
						sourceAggregation: "items",
						targetAggregation: "items",
						dropEffect: "Copy",
						dropPosition: "Between",
						dragStart: [ function(ioEvent) {
							this.onDragStart(ioEvent)
						}, this ],
						dragEnter: [ function(ioEvent) {
							this.onDragEnterWithSubNodes(ioEvent)
						}, this ],
						drop: [ function(ioEvent) {
							this.onDropWithSubNodes(ioEvent)
						}, this ]
					}), new sap.ui.core.dnd.DragDropInfo({
						targetElement: "idProjectTree",
						sourceAggregation: "items",
						targetAggregation: "items",
						dropEffect: "Copy",
						dragStart: [ function(ioEvent) {
							this.onDragStart(ioEvent)
						}, this ],
						dragEnter: [ function(ioEvent) {
							this.onDragEnterWithoutSubNodes(ioEvent)
						}, this ],
						drop: [ function(ioEvent) {
							this.onDropWithoutSubNodes(ioEvent)
						}, this ]
					})]
				}).addStyleClass("sapUiTinyMargin sapUiNoContentPadding");
				this.oBlockList.setModel(this.oModel, "controlSelectionModel");
			}

			return this.oBlockList;
		},

		onDragStart: function(ioEvent) {

		},

		onDragEnterWithSubNodes: function(ioEvent) {
			var loTargetParent = ioEvent.mParameters.target.getParentNode().getBindingContext("projectModel").getObject();

			if (loTargetParent.type !== "Aggregation") {
				ioEvent.preventDefault();
			}
		},

		onDropWithSubNodes: function(ioEvent) {
			this.fireDropWithSubNodes(ioEvent);
		},

		onDragEnterWithoutSubNodes: function(ioEvent) {
			var loTargetParent = ioEvent.mParameters.target.getParentNode().getBindingContext("projectModel").getObject();

			if (loTargetParent.type !== "Aggregation") {
//				ioEvent.preventDefault();
			}
		},

		onDropWithoutSubNodes: function(ioEvent) {
			this.fireDropWithoutSubNodes(ioEvent);
		},

		//Popover to see the Preview of the Block
		blockPreview: function() {

		},

		onPressIconControlSelection: function() {
			this.controlSelectionDialog();
		},

		//Need to have a section select the libraries
		controlSelectionDialog: function() {
			if (!this.oControlSelectionDialog) {
				this.oControlSelectionDialog = new sap.m.Dialog({


					beforeOpen: [function(ioEvent) {
						this.onBeforeOpenCSDialog(ioEvent);
					}, this],
					afterClose: function(ioEvent) {
						ioEvent.getSource().destroy();
					}
				});
			}

			this.oControlSelectionDialog.open();
		},

		onBeforeOpenCSDialog: function(ioEvent) {

		}
	});

	return ControlSelection;
}, /* bExport= */ true);