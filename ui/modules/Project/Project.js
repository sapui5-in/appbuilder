sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax",
	"sapui5in/appbuilder/modules/MetadataSelector/MetadataSelector",
	"sapui5in/appbuilder/modules/Project/Block",
	"sapui5in/appbuilder/modules/Project/ProjectCreate",
	"sapui5in/appbuilder/modules/Project/ProjectEdit",
	'sap/m/MessageBox',
	"sapui5in/appbuilder/modules/ControlMetadata",
	"sapui5in/appbuilder/modules/Project/Formatter",
	"sapui5in/appbuilder/modules/MetadataSelector/IconSelection",
	"sapui5in/appbuilder/modules/ControlSelection"
	],
	function(jQuery, BaseModule, Ajax, MetadataSelector, Block, ProjectCreate, ProjectEdit, MessageBox, ControlMetadata, Formatter, IconSelection, ControlSelection) {
	"use strict";

	var Project = BaseModule.extend("sapui5in.appbuilder.modules.Project.Project", {

		formatter: Formatter,

		metadata: {
			events: {
				selectionChangeTree: {},
				selectItem: {},
				pressGenerateProject: {},
				changeMS: {},
				blockModified: {}
			}
		},

		init: function() {
			var _self = this;
			this._iIdCount = 1;
//			this._aAvailableLibraries = ["sap.m", "sap.ui.table", "sap.f", "sap.ui.core", "sap.ui.comp.filterbar", "sap.uxap"];
			this._aAvailableLibraries = ["sap.m", "sap.ui.core"];

			this._oTreeContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.Project.fragments.ProjectTree", this);
			this.oMSContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.Project.fragments.MetadataSelector", this);

			var loModel = new sap.ui.model.json.JSONModel();
			loModel.setSizeLimit(10000);
			this.oMSContainer.setModel(loModel, "msModel");

			var loModel1 = new sap.ui.model.json.JSONModel();
			loModel1.setSizeLimit(10000);
			this._oTreeContainer.setModel(loModel1, "projectModel");

			this.initializeModules();

			this.getProjectData();
		},

		initializeModules: function() {
			var _self = this;
			this.setControlTypes();

			this.oProjectCreate = new ProjectCreate();
			this.oProjectEdit = new ProjectEdit();
			this.oBlock = new Block({
				blockCreate: function(ioData) {
					_self.getProjectData(ioData);
					_self.fireBlockModified(ioData);
				},
				blockUpdate: function(ioEvent) {
					if (ioEvent.mParameters.block && ioEvent.mParameters.blockPath) {
						var loBlock = _self.updateBlockWithControlId(ioEvent.mParameters.block);
						_self.getProjectModel().setProperty(ioEvent.mParameters.blockPath, loBlock);
						_self.fireBlockModified(ioEvent);
					}
				},
				blockDelete: function(ioData) {
					_self.getProjectData(ioData);
				}
			});
		},

		getMSContainer: function() {
			return this.oMSContainer;
		},


		/**
		 * Event Handlers Starts
		 */
		onBeforeOpenContextMenu: function(ioEvent) {
			var loMenu = ioEvent.getSource().getContextMenu();

			loMenu.setBindingContext(ioEvent.mParameters.listItem.getBindingContext("projectModel"), "projectModel");
		},

		onItemSelectedContextMenu: function(ioEvent) {
			var lsKey = ioEvent.mParameters.item.getKey();

			switch (lsKey) {
			case "generateProject":
				this.onPressGenerateProject(ioEvent);
				break;
			case "createNewView":
				var loBlockContext = ioEvent.getSource().getBindingContext("projectModel").getObject();
				this.oBlock.openCreateViewDialog(loBlockContext.projectOid);
				break;
			case "createNewBlock":
				var loBlockContext = ioEvent.getSource().getBindingContext("projectModel").getObject();
				this.oBlock.openCreateBlockDialog(loBlockContext.projectOid);
				break;
			case "updateBlock":
				this.onPressSaveBlock(ioEvent);
				break;
			case "updateProject":
				this.onPressUpdateProject(ioEvent);
				break;
			case "saveBlock":
				this.onPressSaveBlock(ioEvent);
				break;
			case "addBlock":
				this.onPressBtnShowBlockList(ioEvent);
				break;
			case "delete":
				this.onPressDeleteTreeItem(ioEvent);
				break;
			}
		},


		/**
		 * Event Handlers Ends
		 */

		onChangeBlockName: function(ioEvent) {
			if (ioEvent.mParameters) {
				this.getSelectedItem().name = ioEvent.mParameters;
			}

			this.getProjectModel().refresh();
		},

//		onSelectMSProperty: function(ioEvent) {
//			if (!this.getSelectedItem().selections) {
//				this.getSelectedItem().selections = {
//					properties: {}	
//				};
//			}
//
//			if (!this.getSelectedItem().selections.properties) {
//				this.getSelectedItem().selections.properties = {};
//			}
//
//			if (this.getSelectedItem().selections.properties[Object.keys(ioEvent.mParameters)[0]]) {
//				delete (this.getSelectedItem().selections.properties[Object.keys(ioEvent.mParameters)[0]]);
//			} else {
//				this.getSelectedItem().selections.properties[Object.keys(ioEvent.mParameters)[0]] = ioEvent.mParameters[Object.keys(ioEvent.mParameters)[0]];
//			}
//
//			this.fireChangeMS(ioEvent);
//		},

		onSelectMSAggregation: function(ioEvent) {
			var loNode = ioEvent.mParameters;

			var lbFlag = true;
			for (var i=0;i<this.getSelectedItem().nodes.length;i++) {
				if (this.getSelectedItem().nodes[i].name === loNode.name) {
					lbFlag = false;
					this.getSelectedItem().nodes.splice(i, 1);
					break;
				}
			}
			if (lbFlag) {
				this.getSelectedItem().nodes.push(loNode);
			}
			this.getProjectModel().refresh();
		},

		onSelectMSEvent: function(ioEvent) {
			if (!this.getSelectedItem().selections) {
				this.getSelectedItem().selections = {
					events: {}	
				};
			}

			if (!this.getSelectedItem().selections.events) {
				this.getSelectedItem().selections.events = {};
			}

			if (this.getSelectedItem().selections.events[Object.keys(ioEvent.mParameters)[0]]) {
				delete (this.getSelectedItem().selections.events[Object.keys(ioEvent.mParameters)[0]]);
			} else {
				this.getSelectedItem().selections.events[Object.keys(ioEvent.mParameters)[0]] = ioEvent.mParameters[Object.keys(ioEvent.mParameters)[0]];
			}

//			this.generateLivePreview();
			this.fireChangeMS(ioEvent);
		},

		onChangeAggregationType: function(ioEvent) {
			this.getSelectedItem().aggregationType = ioEvent.mParameters;
			this.getSelectedItem().nodes = [];

//			this.generateLivePreview();
			this.fireChangeMS(ioEvent);
		},

		onSetTemplate: function(ioEvent) {
			var isAggregationNodePath = this.getSelectedItemContext().getPath();

			if (ioEvent.mParameters && typeof ioEvent.mParameters === "string") {
				this.oBlock.addControlToAggregation(isAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(ioEvent.mParameters));
//				this.generateLivePreview();
				this.fireChangeMS(ioEvent);
			}

		},

		onAddManualControl: function(ioEvent) {
			var loBindingContext = this.getSelectedItem();
			var isAggregationNodePath = this.getSelectedItemContext().getPath();

			if (!loBindingContext.multiple && loBindingContext.nodes && loBindingContext.nodes.length === 1) {
				sap.m.MessageToast.show("Cannot add Multiple Controls to Single Aggregation Type");
			} else {
				if (ioEvent.mParameters && typeof ioEvent.mParameters === "string") {
					this.oBlock.addControlToAggregation(isAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(ioEvent.mParameters));
					this.fireChangeMS(ioEvent);
				}
			}
		},

		onDropWithSubNodes: function(ioEvent) {
			var lsDropPosition = ioEvent.mParameters.mParameters.mParameters.dropPosition;
			var loDroppedControl = ioEvent.mParameters.mParameters.mParameters.droppedControl;
			var loDraggedControl = ioEvent.mParameters.mParameters.mParameters.draggedControl;

			if (loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().type === "Aggregation"
				&& loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().aggregationType === "Manual"
			) {
				var laNodes = loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().nodes;
				var liDroppedPositionInParent = loDroppedControl.getItemNodeContext().positionInParent;
				var loDraggedContextObj = JSON.parse(loDraggedControl.getBindingContext("controlSelectionModel").getObject().code);

				if (lsDropPosition === "After") {
					liDroppedPositionInParent += 1;
				}

				laNodes.splice(liDroppedPositionInParent, 0, loDraggedContextObj[0]);

				this.getProjectModel().setProperty(loDroppedControl.getParentNode().getBindingContext("projectModel").getPath() + "/nodes", laNodes);

				var lsImmediateBlockFromPath = this.getCorrespondingBlockFromPath(loDroppedControl.getParentNode().getBindingContext("projectModel").getPath());
				var lsAggregationPath = loDroppedControl.getParentNode().getBindingContext("projectModel").getPath();

				this.oBlock.updateBlock(lsAggregationPath, this.getProjectModel(), this.getTree());
			} else {
				sap.m.MessageToast.show("Invalid Drop location");
			}
		},

		onDropWithoutSubNodes: function(ioEvent) {
			var loDroppedControl = ioEvent.mParameters.mParameters.mParameters.droppedControl;
			var loDraggedControl = ioEvent.mParameters.mParameters.mParameters.draggedControl;

			if (loDroppedControl.getBindingContext("projectModel").getObject().type === "Aggregation") {
				if (!loDroppedControl.getBindingContext("projectModel").getObject().nodes) {
					loDroppedControl.getBindingContext("projectModel").getObject().nodes = [];
				}
				var laNodes = loDroppedControl.getBindingContext("projectModel").getObject().nodes;
				var loDraggedContextObj = JSON.parse(loDraggedControl.getBindingContext("controlSelectionModel").getObject().code);

				var lsControlName = loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().name;
				var lsAggregationName = loDroppedControl.getBindingContext("projectModel").getObject().name;
				if (this.isValidAggregation(lsControlName, lsAggregationName, loDraggedContextObj[0].name)) {
					laNodes.push(loDraggedContextObj[0]);
				} else {
					sap.m.MessageToast.show("Invalid Control");
				}

				this.getProjectModel().setProperty(loDroppedControl.getBindingContext("projectModel").getPath() + "/nodes", laNodes);

				var lsImmediateBlockFromPath = this.getCorrespondingBlockFromPath(loDroppedControl.getBindingContext("projectModel").getPath());
				var lsAggregationPath = loDroppedControl.getParentNode().getBindingContext("projectModel").getPath();

				this.oBlock.updateBlock(lsAggregationPath, this.getProjectModel(), this.getTree());

//				this.oBlock.addControlToAggregation(loDroppedControl.getBindingContext("projectModel").getPath(), this.getProjectModel(), loDraggedContextObj[0	]);
			} else {
				sap.m.MessageToast.show("Invalid Drop location");
			}
		},

		onSelectionAggregation: function(ioEvent) {
			//Populate a List of Possible Templates and Manual Controls possible for the Selected Aggregation
			var laSelectedItemPath = this.getSelectedItemContext().getPath().split("/");
			laSelectedItemPath.pop();
			laSelectedItemPath.pop();

			var lsParentPath = laSelectedItemPath.join("/");

			this.populateAggregationList(this.getProjectModel().getProperty(lsParentPath), this.getSelectedItem());
		},

		getProjectModel: function() {
			return this.getModel("projectModel");
		},

		getMSModel: function() {
			return this.getMSContainer().getModel("msModel");
		},

		getTree: function() {
			return this._oTreeContainer.getItems()[1].getContent()[0];
		},

		updateBlockWithControlId: function(ioBlock) {
			if (ioBlock && ioBlock.type === "Control") {
				ioBlock.controlId = "sapui5in__" + this._iIdCount++;
			}
			for (var key in ioBlock) {
				if (typeof ioBlock[key] === "object") {
					ioBlock[key] = this.updateBlockWithControlId(ioBlock[key]);
				}
			}

			return ioBlock;
		},

		onDragStart: function(ioEvent) {
			var loDragSession = ioEvent.getParameter("dragSession");
			var loDraggedRow = ioEvent.getParameter("target");

			if (loDragSession.getDragControl().getBindingContext("projectModel").getObject().type !== "Control") {
				ioEvent.preventDefault();
			}
		},

		onDrop: function(ioEvent) {
			function move(arr, old_index, new_index) {
				while (old_index < 0) {
					old_index += arr.length;
				}
				while (new_index < 0) {
					new_index += arr.length;
				}
				if (new_index >= arr.length) {
					var k = new_index - arr.length;
					while ((k--) + 1) {
						arr.push(undefined);
					}
				}
				arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);  
				return arr;
			}

			var loDraggedControl = ioEvent.mParameters.draggedControl;
			var loDroppedControl = ioEvent.mParameters.droppedControl;

			if (loDroppedControl.getParentNode().getId() ===  loDraggedControl.getParentNode().getId()
					&& loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().type === "Aggregation"
						&& loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().aggregationType === "Manual"
							&& loDraggedControl.getBindingContext("projectModel").getObject().type === "Control"
								&& loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().nodes.length > 1	//If more than 1 element
			) {
				var laNodes = loDroppedControl.getParentNode().getBindingContext("projectModel").getObject().nodes;
				var liDraggedPositionInParent = loDraggedControl.getItemNodeContext().positionInParent;
				var liDroppedPositionInParent = loDroppedControl.getItemNodeContext().positionInParent;

				move(laNodes, liDraggedPositionInParent, liDroppedPositionInParent);

				this.getModel("projectModel").setProperty(loDroppedControl.getParentNode().getBindingContext("projectModel").getPath() + "/nodes", laNodes);

				var lsAggregationPath = loDroppedControl.getParentNode().getBindingContext("projectModel").getPath();
				this.oBlock.updateBlock(lsAggregationPath, this.getModel("projectModel"), this.getTree());
			} else {
				sap.m.MessageToast.show("Invalid Drop location");
			}
		},

		getSelectedItemContext: function() {
			if (this.getTree().getSelectedItem()) {
				return this.getTree().getSelectedItem().getBindingContext("projectModel");
			}
		},

		getSelectedItem: function() {
			if (this.getSelectedItemContext()) {
				return this.getSelectedItemContext().getObject();
			} else {
				return {};
			}
		},

		onItemPressTree: function(ioEvent) {
//			this.oSelectedItemContext = ioEvent.mParameters.listItem.getBindingContext("projectModel");
			console.log(ioEvent.mParameters.listItem.getBindingContext("projectModel").getObject());

			var loSelectedObj = jQuery.extend(true, {}, this.getSelectedItem());
			this.getMSModel().setProperty("/selectedContext", loSelectedObj);

			if (this.getSelectedItem().type === "Project") {
				this.oProjectEdit.initialize(ioEvent.mParameters.listItem.getBindingContext("projectModel").getObject());
			} else if (this.getSelectedItem().type === "Block") {

			} else if (this.getSelectedItem().type === "View") {

			} else if (this.getSelectedItem().type === "Control") {
				this.onSelectionControl(this.getSelectedItem());
			} else if (this.getSelectedItem().type === "Aggregation") {
				this.onSelectionAggregation(ioEvent);
			}

			this.fireSelectionChangeTree(ioEvent);
		},

		onSelectionControl: function(ioSelectedItemObject) {
			this.update(ioSelectedItemObject);
		},

		onPressRefreshTree: function() {
			this.getProjectData();
		},

		getProjectData: function() {
			var _self = this;
			this._iIdCount = 1;

			var loParams = {
					type: "GET",
					url: "/projects/list",
					fnSuccess: function(ioData) {
						if (ioData && ioData.projects && ioData.projects.length) {
							var laProjects = ioData.projects;
							var laBlocks = ioData.blocks;

							for (var i=0;i<laProjects.length;i++) {
								laProjects[i].type = "Project";
								laProjects[i].nodes = [{
									name: "Views",
									type: "ViewRoot",
									projectOid: laProjects[i]._id,
									nodes: []
								}, {
									name: "Blocks",
									type: "BlockRoot",
									projectOid: laProjects[i]._id,
									nodes: []
								}];
								for (var j=0;j<laBlocks.length;j++) {
									if (laProjects[i]._id === laBlocks[j].projectOid) {
										if (!laBlocks[j].type) {
											laBlocks[j].type = "Block";
										}
										if (laBlocks[j].code) {
											laBlocks[j].nodes = JSON.parse(laBlocks[j].code);
											delete (laBlocks[j].code);
										} else {
											laBlocks[j].nodes = [];
										}
										if (laBlocks[j].type === "View") {
											laProjects[i].nodes[0].nodes.push(laBlocks[j]);
										} else if (laBlocks[j].type === "Block") {
											laProjects[i].nodes[1].nodes.push(laBlocks[j]);
										}
									}
								}
							}
						}

						if (laProjects) {
							laProjects = _self.updateIds(laProjects);
							_self.getModel().setProperty("/tree", laProjects);
						}
						_self.getTree().expandToLevel(2);
					}
			};

			Ajax.call(loParams);
		},

		updateIds: function(iaProjects) {
			for (var i=0;i<iaProjects.length;i++) {
				if (iaProjects[i].type === "Control") {
					iaProjects[i].controlId = "sapui5in__" + this._iIdCount++;
				}
				if (iaProjects[i].nodes) {
					this.updateIds(iaProjects[i].nodes);
				}
			}

			return iaProjects;
		},

		getModel: function() {
			return this.getTreeContainer().getModel("projectModel");
		},

		getTreeContainer: function() {
			return this._oTreeContainer;
		},

		openCreateProjectDialog: function() {
			this.oProjectCreate.openWizard();
		},

		onPressGenerateProject: function(ioEvent) {
			this.firePressGenerateProject(ioEvent);
		},

		onPressUpdateProject: function(ioEvent) {
			var _self = this;
			var loContext = ioEvent.getSource().getBindingContext("projectModel").getObject();

			var laBlocks = [];
			laBlocks = laBlocks.concat(loContext.nodes[0].nodes).concat(loContext.nodes[1].nodes);

			var loProject = {
					_id: loContext._id,
					name: loContext.name,
					namespace: loContext.namespace,
					blocks: laBlocks
			};

			var loParams = {
					type: "POST",
					url: "/projects/update",
					data: loProject,
					fnSuccess: function(iaData) {
						_self.getProjectData();
					}
			};
			Ajax.call(loParams);
		},

		onPressClose: function(ioEvent) {
			ioEvent.getSource().getParent().close();
		},

		onPressSaveBlock: function(ioEvent) {
			var lsAggregationPath = ioEvent.getSource().getBindingContext("projectModel").getPath();
			this.oBlock.updateBlock(lsAggregationPath, this.getModel("projectModel"), this.getTree());

		},

		onPressBtnShowBlockList: function(ioEvent) {
			var _self = this;
			if (!this.oBlockListDialog) {
				this.oBlockListDialog = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.Project.Dialogs.BlockListDialog", this);
				this.oBlockListDialog.setModel(this.getModel(), "projectModel");
			}
			this.oBlockListDialog.open();

			var lsProjectOid = this.getProjectOid(ioEvent.getSource().getBindingContext("projectModel").getPath());
			if (lsProjectOid) {
				var loParams = {
						type: "GET",
						url: "/blocks/getBlocks/" + lsProjectOid,
						data: {},
						fnSuccess: function(iaData) {
							_self.getModel().setProperty("/blockList", iaData);
						}
				};

				Ajax.call(loParams);
			}
		},

		onItemPressBlockList: function(ioEvent) {
			var loSelectedItemObj = ioEvent.getParameter("listItem").getBindingContext("projectModel").getObject();

			loSelectedItemObj.type = "Block";
			if (loSelectedItemObj.code) {
				loSelectedItemObj.nodes = JSON.parse(loSelectedItemObj.code);
			} else {
				loSelectedItemObj.nodes = [];
			}

			this.onSelectBlock(loSelectedItemObj);
			ioEvent.getSource().getParent().close();
		},

		getProjectOid: function(isPath) {
			if (isPath && this.getModel().getProperty(isPath)) {
				if (this.getModel().getProperty(isPath).type === "Block"
					|| this.getModel().getProperty(isPath).type === "View") {
					return this.getModel().getProperty(isPath).projectOid;
				} else {
					var laPath = isPath.split("/");
					laPath.pop();
					laPath.pop();
					return this.getProjectOid(laPath.join("/"));
				}
			}
		},

		onPressDeleteTreeItem: function(ioEvent) {
			var _self = this;
			var loEvent = ioEvent;
			_self.deleteItemNode(loEvent);

//			MessageBox.warning("Are you sure, you want to delete?", {
//			stretch: false,
//			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
//			onClose: function(isAction) {
//			if (isAction == sap.m.MessageBox.Action.YES) {
//			_self.deleteItemNode(loEvent);
//			}
//			}.bind(this)
//			});
		},

		deleteItemNode: function(ioEvent) {
			var loBindingContext = ioEvent.getSource().getBindingContext("projectModel");
			var lsId = loBindingContext.getObject()._id;
			var laPath = loBindingContext.getPath().split("/");
			var liItemIndex = laPath[laPath.length - 1];
			var lsParentPath = laPath.splice(0, laPath.length - 1).join("/");

			var loParams = {
					type: "DELETE",
					data: {},
					fnSuccess: function(iaData) {
						_self.getProjectData();
					}
			};

			if (loBindingContext.getObject().type === "Project") {
				loParams.url = "/projects/delete/" + lsId;
				Ajax.call(loParams);
			} else if (loBindingContext.getObject().type === "Block" || loBindingContext.getObject().type === "View") {
				this.oBlock.deleteBlock(lsId, this.getTree());
			} else if (loBindingContext.getObject().type === "Control") {
				var laNodes = this.getModel().getProperty(lsParentPath);
				laNodes.splice(liItemIndex, 1);
				this.getModel().setProperty(lsParentPath, laNodes);

				this.oBlock.updateBlock(lsParentPath, this.getModel("projectModel"), this.getTree());
			}
		},

		//Gets the Binding Path of Tree Item from the ControlId
		getTreeItemPathFromControlId: function(isPath, isViewId, isControlId) {
			var lsImmediateBlockFromPath = this.getCorrespondingBlockFromPath(isPath);
			var rsSelectedgetTreeItemPathFromControlId = this.getTreeItemPathFromControlIdRecursive(lsImmediateBlockFromPath, isViewId, isControlId);

			return rsSelectedgetTreeItemPathFromControlId;
		},

		//Gets the immediate Block/View from the path Provided
		getCorrespondingBlockFromPath: function(isPath) {
			if (!isPath && this.getSelectedItemContext()) {
				isPath = this.getSelectedItemContext().getPath();
			}
			if (isPath && this.getProjectModel().getProperty(isPath)) {
				if (this.getProjectModel().getProperty(isPath).type === "Block"
					|| this.getProjectModel().getProperty(isPath).type === "View") {

					return isPath;
				} else {
					var laPath = isPath.split("/");
					laPath.pop();
//					laPath.pop();

					return this.getCorrespondingBlockFromPath(laPath.join("/"));
				}
			}
		},

		getTreeItemPathFromControlIdRecursive: function(isPath, isViewId, isSelectedControlId) {
			var loNode = this.getProjectModel().getProperty(isPath);
			if (loNode.type === "Control" && isSelectedControlId === isViewId + "--" + loNode.controlId) {
				return isPath;
			} else if (loNode.nodes) {
				for (var i=0;i<loNode.nodes.length;i++) {
					var lsPath = this.getTreeItemPathFromControlIdRecursive(isPath + "/nodes/" + i, isViewId, isSelectedControlId);
					if (lsPath) {
						return lsPath;
					}
				}
			}
		},

		onSelectBlock: function(ioEvent) {
			if (!this.getSelectedItem().nodes) {
				this.getSelectedItem().nodes = [];
			}

			if (!this.getSelectedItem().multiple && this.getSelectedItem().nodes.length === 1) {
				sap.m.MessageToast.show("Cannot add Multiple Controls to Single Aggregation");
			} else {
				var laSelectedItemPath = this.getSelectedItemContext().getPath().split("/");
				var laControlPath = laSelectedItemPath.splice(0, laSelectedItemPath.length - 2);
				var lsControlPath = laControlPath.join("/");

				var loControlNode = this.getSelectedItemContext().getModel().getProperty(lsControlPath);

				if (this.isValidAggregation(loControlNode.name, this.getSelectedItem().name, ioEvent.nodes[0].name)) {
					this.getSelectedItem().nodes.push(ioEvent.nodes[0]);

					this.oBlock.updateBlock(lsControlPath, this.getProjectModel(), this.getTree());

					this.fireChangeMS(ioEvent);
				} else {
					sap.m.MessageToast.show("Invalid Aggregation type");
				}
			}
		},

		update: function(ioSelectedItemObject) {
			var loSelectedItemObject = ioSelectedItemObject;
			var loControlMetadata = ControlMetadata.getMetadata(loSelectedItemObject.name);
			this.getMSModel().setProperty("/controlMetadata", loControlMetadata);

			if (!loSelectedItemObject.selections) {
				loSelectedItemObject.selections = {};
			}

			//Select the Selected Properties, Aggregations and Events
			this.addSelectedKeyInTable("idControlProperties", loSelectedItemObject.selections.properties, loControlMetadata.properties);
			this.addSelectedKeyInTable("idControlAggregations", loSelectedItemObject.nodes, loControlMetadata.aggregations);
			this.addSelectedKeyInTable("idControlEvents", loSelectedItemObject.selections.events, loControlMetadata.events);
			if (loSelectedItemObject.selections && loSelectedItemObject.selections.properties
					&& loSelectedItemObject.selections.properties.styleClass && loSelectedItemObject.selections.properties.styleClass.value) {
				sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue(loSelectedItemObject.selections.properties.styleClass.value);
			} else {
				sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue();
			}

			this.getModel().refresh();
		},

		addSelectedKeyInTable: function(isTableId, iaSelections, iaMetadata) {
			var loTable = sap.ui.core.Fragment.byId("AppDesigner", isTableId);
			loTable.setSelectedIndex(-1);

			if (isTableId === "idControlAggregations") {
				if (iaSelections && iaMetadata) {
					for (var i = 0; i < iaMetadata.length; i++) {
						for (var j = 0; j < iaSelections.length; j++) {
							if (iaSelections[j].name === iaMetadata[i].name) {
								loTable.getContextByIndex(i).getObject().rowSelected = true;
								loTable.addSelectionInterval(i, i);
								break;
							}
						}
					}
				}
			} else {
				if (iaSelections && iaMetadata) {
					for (i = 0; i < iaMetadata.length; i++) {
						for (j = 0; j < Object.keys(iaSelections).length; j++) {
							if (Object.keys(iaSelections)[j] === iaMetadata[i].name) {
								loTable.addSelectionInterval(i, i);
								loTable.getContextByIndex(i).getObject().rowSelected = true;
								if (iaSelections[iaMetadata[i].name].fixedValue) {
									loTable.getContextByIndex(i).getObject().value = iaSelections[iaMetadata[i].name].value;
									loTable.getContextByIndex(i).getObject().fixedValue = iaSelections[iaMetadata[i].name].fixedValue;
								}
								break;
							}
						}
					}
				}
			}
		},

		onRowSelectionChangeControlProperties: function(ioEvent) {
			if (ioEvent.getParameter("rowContext")) {
				var loRowContextObj = ioEvent.getParameter("rowContext").getObject();

				if (!ioEvent.getParameter("userInteraction")) {
					return;
				}
				if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
					loRowContextObj.rowSelected = true;
				} else if (ioEvent.getParameter("rowContext")) {
					loRowContextObj.rowSelected = false;

					if (loRowContextObj.defaultValue) {
						loRowContextObj.value = loRowContextObj.defaultValue;
					} else {
						loRowContextObj.value = "";
					}
					loRowContextObj.fixedValue = false;
				}
				this.getMSModel().refresh();

				if (ioEvent.getParameter("userInteraction")) {
					var loSelectedNode = {};
					loSelectedNode[loRowContextObj.name] = {
							fixedValue: loRowContextObj.fixedValue,
							value: loRowContextObj.value
					};

					if (!this.getSelectedItem().selections) {
						this.getSelectedItem().selections = {
							properties: {}	
						};
					}

					if (!this.getSelectedItem().selections.properties) {
						this.getSelectedItem().selections.properties = {};
					}

					if (this.getSelectedItem().selections.properties[loRowContextObj.name]) {
						delete (this.getSelectedItem().selections.properties[loRowContextObj.name]);
					} else {
						this.getSelectedItem().selections.properties[loRowContextObj.name] = loSelectedNode[loRowContextObj.name];
					}

					this.fireChangeMS(ioEvent);
					
				}
			}
		},

		onRowSelectionChangeControlAggregations: function(ioEvent) {
			if (!ioEvent.getParameter("userInteraction")) {
				return;
			}
			var loRowContextObj = ioEvent.getParameter("rowContext").getObject();
			if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
				loRowContextObj.rowSelected = true;
			} else if (ioEvent.getParameter("rowContext")) {
				loRowContextObj.rowSelected = false;
			}
			this.getMSModel().refresh();

			if (ioEvent.getParameter("userInteraction")) {
				var loSelectedNode = {
						name: loRowContextObj.name,
						label: loRowContextObj.label,
						type: "Aggregation",
						aggregationType: "Manual",
						multiple: loRowContextObj.multiple,
						bindable: loRowContextObj.bindable
				};
//				this.fireSelectAggregation(loSelectedNode);
			}
		},

		onRowSelectionChangeControlEvents: function(ioEvent) {
			if (!ioEvent.getParameter("userInteraction")) {
				return;
			}
			var loRowContextObj = ioEvent.getParameter("rowContext").getObject();
			if (ioEvent.getSource().getSelectedIndices().indexOf(ioEvent.getParameter("rowIndex")) !== -1) {
				loRowContextObj.rowSelected = true;
			} else if (ioEvent.getParameter("rowContext")) {
				loRowContextObj.rowSelected = false;
			}
			this.getModel().refresh();

			if (ioEvent.getParameter("userInteraction")) {
				var loSelectedNode = {};
				loSelectedNode[loRowContextObj.name] = {
						value: loRowContextObj.value
				};
			}
		},

		onChangeControlStyleClass: function(ioEvent) {
			this.getSelectedItem().selections.properties.styleClass = {
				value: ioEvent.getSource().getValue(),
				fixedValue: true
			};
			this.getProjectModel().refresh();

			this.fireChangeMS(ioEvent);
		},

		onSelectionChangeAggregationType: function(ioEvent) {
			var loModel = this.getModel();

			if (ioEvent.getSource().getSelectedKey() === "Template") {
				loModel.setProperty("/selectedContext/aggregationType", "Template");
				this.fireChangeAggregationType("Template");
			} else {
				loModel.setProperty("/selectedContext/aggregationType", "Manual");
//				this.fireChangeAggregationType("Manual");
			}
		},

		onPressAddControlInAggregation: function(ioEvent) {
			if (this.getModel().getProperty("/selectedContext/aggregationType") === "Manual") {
				this.fireAddManualControl(ioEvent.getSource().getParent().getParent().getItems()[2].getSelectedKey());
			} else {
				this.fireSetTemplate(ioEvent.getSource().getParent().getParent().getItems()[2].getSelectedKey());
			}
		},

		onSelectionChangeValueProperty: function(ioEvent) {
			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
			loSelectedContext.fixedValue = true;

			this.onChangeValueProperty(loSelectedContext);
		},

		onSelectCBValueProperty: function(ioEvent) {
			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
			loSelectedContext.value = ioEvent.getSource().getSelected();
			loSelectedContext.fixedValue = true;

			this.onChangeValueProperty(loSelectedContext);
		},

		onChangeValueProperty: function(ioSelectedContext) {
			var loSelectedContext = ioSelectedContext;
			loSelectedContext.fixedValue = true;

			this.getSelectedItem().selections.properties[loSelectedContext.name] = {
				fixedValue: loSelectedContext.fixedValue,
				value: loSelectedContext.value
			}
			this.getMSModel().refresh();

			this.fireChangeMS(ioSelectedContext);
		},

		onPressIconFixedValue: function(ioEvent) {
			var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
			loSelectedContext.fixedValue = !loSelectedContext.fixedValue;
			if (!loSelectedContext.fixedValue) {
				loSelectedContext.value = loSelectedContext.defaultValue;
			}
			this.getMSModel().refresh();

			this.getSelectedItem().selections.properties[loSelectedContext.name] = {
				fixedValue: loSelectedContext.fixedValue,
				value: loSelectedContext.value
			}

			this.fireChangeMS(ioEvent);
		},

		getAvailableLibraries: function() {
			return this._aAvailableLibraries;
		},

		populateAggregationList: function(ioControlObject, ioAggregationObject) {
			var lsControlName = ioControlObject.name;
			var lsAggregationName = ioAggregationObject.name;

			var laControlList = this.getModel().getProperty("/controlList");
			var laAggregationControlsList = [];

			for (var i=0;i<laControlList.length;i++) {
				if (this.isValidAggregation(lsControlName, lsAggregationName, laControlList[i].key)) {
					laAggregationControlsList.push(laControlList[i]);
				}
			}

			this.getModel().setProperty("/templateControls", laAggregationControlsList);
			this.getModel().setProperty("/manualControls", laAggregationControlsList);
		},

		setTemplateTypes: function(ioControl) {
			this.getModel().setProperty("/templateControls", this.getAllControlNames());		
		},

		setManualControlTypes: function(ioControl) {
			this.getModel().setProperty("/manualControls", this.getAllControlNames(this.getAvailableLibraries()));		
		},

		setControlTypes: function(ioControl) {
			this.getModel().setProperty("/controlList", this.getAllControlNames(this.getAvailableLibraries()));
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

		onSelectionChangeRootControl: function(ioEvent) {
			var lsSelectedKey = ioEvent.getSource().getParent().getParent().getItems()[5].getSelectedKey();

			var loBindingContext = this.getSelectedItem();
			loBindingContext.nodes = [];
			loBindingContext.nodes.push(this.getNewControlNode(ioEvent.mParameters));

			this.fireChangeMS(ioEvent);
		},

		onChangeBlockName: function(ioEvent) {
			if (ioEvent.getSource().getValue()) {
				this.fireChangeBlockName(ioEvent.getSource().getValue());
			} else {
				sap.m.MessageToast.show("Name cannot be Empty");
			}
		},

		onValueHelpRequest: function(ioEvent) {
			var _self = this;
			var loEvent = ioEvent;
			if (!this._oIconSelection) {
				this._oIconSelection = new IconSelection({
					iconSelectFromDialog: function(ioEvent) {
						_self.getMSModel().refresh();

						_self.onChangeValueProperty(ioEvent.mParameters);
					}
				});
			}

			this._oIconSelection.open(ioEvent);
		}
	});

	return Project;
}, /* bExport= */ true);