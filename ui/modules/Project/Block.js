sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, Ajax) {
	"use strict";

	var Block = BaseModule.extend("sapui5in.appbuilder.modules.Project.Block", {

		metadata: {
			properties: {
//				rootControls: {
//				type: "object",
//				}
			},
			events: {
				blockCreate: {},
				blockUpdate: {},
				blockDelete: {}
			}
		},

		init: function() {
			this._aAvailableLibraries = ["sap.m", "sap.ui.core"];
			this.oModel = new sap.ui.model.json.JSONModel();
			this.oModel.setSizeLimit(2000);

			this.getModel().setProperty("/viewTypes", [{
				key: "XML",
				text: "XML View"
			}, {
				key: "JS",
				text: "JS View"
			}, {
				key: "JSON",
				text: "JSON View"
			}]);
		},

		getModel: function() {
			return this.oModel;
		},

		openCreateViewDialog: function(isProjectOid) {
			if (!this.oCreateNewViewDialog) {
				this.oCreateNewViewDialog = sap.ui.xmlfragment("idNewViewDialog", "sapui5in.appbuilder.modules.Project.Dialogs.NewView", this);
				this.oCreateNewViewDialog.setModel(this.getModel());
			}

			this.getModel().setProperty("/projectOid", isProjectOid);
			this.oCreateNewViewDialog.open();
		},

		onBeforeOpenNewViewDialog: function(ioEvent) {
			this.getModel().setProperty("/Block", {
				name: "",
				type: "View",
				viewType: "XML",
				projectOid: this.getModel().getProperty("/projectOid"),
				rootControl: ""
			});

			this.setRootControls();
		},

		openCreateBlockDialog: function(isProjectOid) {
			if (!this.oCreateNewBlockDialog) {
				this.oCreateNewBlockDialog = sap.ui.xmlfragment("idNewBlockDialog", "sapui5in.appbuilder.modules.Project.Dialogs.NewBlock", this);
				this.oCreateNewBlockDialog.setModel(this.getModel());
			}

			this.getModel().setProperty("/projectOid", isProjectOid);
			this.oCreateNewBlockDialog.open();
		},

		onBeforeOpenNewBlockDialog: function() {
			this.getModel().setProperty("/Block", {
				name: "",
				type: "Block",
				projectOid: this.getModel().getProperty("/projectOid"),
				rootControl: ""
			});

			this.setRootControls();
		},

		setRootControls: function() {
			if (!this.getModel().getProperty("/rootControls")) {
				this.getModel().setProperty("/rootControls", this.getAllControlNames(this._aAvailableLibraries));
			}
		},

		getAllControlNames: function(iaLibraries) {
			var raControlList = [];
			for (var i = 0; i < iaLibraries.length; i++) {
				var iaKeys = eval(iaLibraries[i]);
				for (var key in iaKeys) {
					if (iaKeys[key].getMetadata) {
						raControlList.push({
							key: iaLibraries[i] + "." + key,
							text: iaLibraries[i] + "." + key,
							library: iaLibraries[i]
						});
					}
				}
			}

			return raControlList;
		},

		onPressBtnCreateCreateViewDialog: function() {
			var _self = this;
			var fnSuccess = function(ioBlockData) {
				_self.oCreateNewViewDialog.close();
				_self.fireBlockCreate(ioBlockData);
			};

			var loNewView = this.getModel().getProperty("/Block");
			this.create(loNewView, fnSuccess, null, this.oCreateNewViewDialog);
		},

		onPressBtnCancelCreateViewDialog: function(ioEvent) {
			ioEvent.getSource().getParent().close();
		},

		onPressBtnCreateCreateBlockDialog: function(isProjectOid) {
			var _self = this;
			var fnSuccess = function(ioBlockData) {
				_self.oCreateNewBlockDialog.close();
				_self.fireBlockCreate(ioBlockData);
			};

			var loNewBlock = this.getModel().getProperty("/Block");
			this.create(loNewBlock, fnSuccess, null, this.oCreateNewBlockDialog);
		},

		onPressBtnCancelCreateBlockDialog: function(ioEvent) {
			ioEvent.getSource().getParent().close();
		},

		create: function(ioBlock, fnSuccess, fnError, ioControl) {
			var loBlock = {
					"name": ioBlock.name,
					"type": ioBlock.type,
					"viewType": ioBlock.viewType,
					"isDesignerBlock": true,
					"projectOid": ioBlock.projectOid,
					"code": JSON.stringify([{
						name: ioBlock.rootControl,
						type: "Control",
						nodes: []
					}])
			};

			//Update the DB
			var loParams = {
					type: "POST",
					url: "/blocks/create",
					data: loBlock,
					fnSuccess: function(iaData) {
						if (fnSuccess) {
							fnSuccess();
						}
					}
			};

			Ajax.call(loParams, ioControl);
		},

		update: function(ioBlock, fnSuccess, fnError, ioControl) {
			var loBlock = {
					name: ioBlock.name,
					code: JSON.stringify(ioBlock.nodes)
			};

			//Update the DB
			var loParams = {
					type: "PUT",
					url: "/blocks/update/" + ioBlock._id,
					data: loBlock,
					fnSuccess: function(iaData) {
						if (fnSuccess) {
							fnSuccess(iaData);
						}
					}
			};
			Ajax.call(loParams, ioControl);
		},

		deleteBlock: function(isBlockOid, ioControl) {
			var _self = this;
			var loParams = {
					type: "DELETE",
					url: "/blocks/delete/" + isBlockOid,
					data: {},
					fnSuccess: function(ioData) {
						_self.fireBlockDelete(ioData);
					}
			};
			Ajax.call(loParams, ioControl);
		},

		addControlToAggregation: function(isAggregationNodePath, ioTreeModel, ioAddedControl, iiPosition) {
			//Check if Valid control for the Aggregation\//If iiPosition is undefined, then push at the end
			if (ioAddedControl && ioAddedControl.type === "Control") {
				var lsControlPath = this.getImmediateBlockPath(isAggregationNodePath, ioTreeModel, ["Control"]);
				var loAggregationNode = ioTreeModel.getProperty(isAggregationNodePath);

				if (!ioTreeModel.getProperty(isAggregationNodePath + "/nodes")) {
					ioTreeModel.setProperty(isAggregationNodePath + "/nodes", []);
				}

				if (loAggregationNode.aggregationType === "Manual") {
					var laNodes = ioTreeModel.getProperty(isAggregationNodePath + "/nodes");

					if (iiPosition) {
						laNodes.splice(iiPosition, 0, ioAddedControl);
					} else {
						laNodes.push(ioAddedControl);
					}

					ioTreeModel.setProperty(isAggregationNodePath + "/nodes", laNodes);
				} else if (loAggregationNode.aggregationType === "Template") {
					ioTreeModel.setProperty(isAggregationNodePath + "/nodes", [ioAddedControl]);
				}

				this.updateBlock(isAggregationNodePath, ioTreeModel);
			}
		},

		getNewControlNode: function(isControlName) {
			if (isControlName) {
				//Create new Control Node from the ControlName
				var roNewControlNode = {
						name: isControlName,
						type: "Control",
						dndEnabled: true,
						nodes: []
				};

				//Add the default Aggregation
				var loControl = eval("new " + isControlName + "()");

				if (loControl.getMetadata().getDefaultAggregationName()) {
					var loAggregationNode = {
							name: loControl.getMetadata().getDefaultAggregationName(),
							type: "Aggregation",
							nodes: []
					};
					loControl.destroy();

					if (loControl.getMetadata().getAllAggregations()[loAggregationNode.name].multiple) {
						loAggregationNode.aggregationType = "Template";
						loAggregationNode.multiple = true;
					} else {
						loAggregationNode.aggregationType = "Manual";
						loAggregationNode.multiple = loControl.getMetadata().getAllAggregations()[loAggregationNode.name].multiple;
					}

					//Add some child items
//					loAggregationNode.nodes.push(this.getChildAggregationNode(isControlName, loAggregationNode.name, loControl));

					// roNewControlNode.nodes.push(loAggregationNode);
				}

				return roNewControlNode;
			} else {
				return {};
			}
		},

		getChildAggregationNode: function(isParentControlName, isAggregationName, ioControl) {
			var roChildAggregationMapping = {

			};

			var roNode = {
					type: "Control",
					nodes: []
			};


			return roNode;
		},

		updateAggregationType: function(ioAggregationNode, isAggregationType) {

		},

		updateBlock: function(isAggregationNodePath, ioTreeModel, ioControl) {
			var _self = this;
			var lsBlockPath = this.getImmediateBlockPath(isAggregationNodePath, ioTreeModel, ["Block", "View"]);
			var fnSuccess = function(ioBlockData) {

				ioBlockData.nodes = JSON.parse(ioBlockData.code);
				delete (ioBlockData.code);

				_self.fireBlockUpdate({
					blockPath: lsBlockPath,
					block: ioBlockData
				});
			};

			this.update(ioTreeModel.getProperty(lsBlockPath), fnSuccess, null, ioControl);
		},

		//Gets the immediate Block/View from the path Provided
		getImmediateBlockPath: function(isPath, ioModel, iaType) {
			if (isPath && ioModel.getProperty(isPath)) {
				if (iaType.indexOf(ioModel.getProperty(isPath).type) !== -1) {

					return isPath;
				} else {
					var laPath = isPath.split("/");
					laPath.pop();

					return this.getImmediateBlockPath(laPath.join("/"), ioModel, iaType);
				}
			}
		},

		highlightDroppedElement: function() {

		}
	});

	return Block;
}, /* bExport= */ true);