sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule",
        "sapui5in/appbuilder/modules/Ajax",
        "sapui5in/appbuilder/modules/MetadataSelector/MetadataSelector",
        "sapui5in/appbuilder/modules/Project/Block",
        "sapui5in/appbuilder/modules/Project/ProjectCreate",
        "sapui5in/appbuilder/modules/Project/ProjectEdit",
        'sap/m/MessageBox',
        "sapui5in/appbuilder/modules/Project/Formatter",
        "sapui5in/appbuilder/modules/MetadataSelector/IconSelection",
        "sapui5in/appbuilder/modules/ControlSelection",
        "sapui5in/appbuilder/modules/UI5CodeDataGenerator/UI5CodeDataGenerator"
    ],
    function (jQuery, BaseModule, Ajax, MetadataSelector, Block, ProjectCreate, ProjectEdit, MessageBox, Formatter, IconSelection, ControlSelection, UI5CodeDataGenerator) {
        "use strict";

        var Project = BaseModule.extend("sapui5in.appbuilder.modules.Project.Project", {

            formatter: Formatter,

            init: function () {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("project", "projectUpdate", this.triggerProjectUpdate, this);
                oEventBus.subscribe("project", "changeRootControl", this.triggerRootControlChanged, this);
                oEventBus.subscribe("project", "changeBlockName", this.triggerBlockNameChanged, this);
                oEventBus.subscribe("project", "changeAggregationType", this.triggerChangeAggregationType, this);
                oEventBus.subscribe("project", "addControlInAggregation", this.triggerAddControlInAggregation, this);
                oEventBus.subscribe("ms", "propertyChanged", this.triggerPropertyChange, this);
                oEventBus.subscribe("ms", "aggregationChanged", this.triggerAggregationChange, this);
                oEventBus.subscribe("ms", "eventChanged", this.triggerEventChange, this);

                this._iIdCount = 1;
                if (!this._oUI5CodeDataGenerator) {
                    this._oUI5CodeDataGenerator = new UI5CodeDataGenerator();
                }
//			    this._aAvailableLibraries = ["sap.m", "sap.ui.table", "sap.f", "sap.ui.core", "sap.ui.comp.filterbar", "sap.uxap"];
                this._aAvailableLibraries = ["sap.m", "sap.ui.core"];

                this._oTreeContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.Project.fragments.ProjectTree", this);

                var loModel1 = new sap.ui.model.json.JSONModel();
                loModel1.setSizeLimit(10000);
                this._oTreeContainer.setModel(loModel1, "projectModel");

                this.initializeModules();

                this.getProjectData();
            },

            initializeModules: function () {
                var _self = this;
                this.setControlTypes();

                this.oProjectCreate = new ProjectCreate();
                this.oProjectEdit = new ProjectEdit();
                this.oBlock = new Block({
                    blockCreate: function (ioData) {
                        _self.getProjectData(ioData);
                        _self.fireBlockModified(ioData);
                    },
                    blockUpdate: function (ioEvent) {
                        if (ioEvent.mParameters.block && ioEvent.mParameters.blockPath) {
                            var loBlock = _self.updateBlockWithControlId(ioEvent.mParameters.block);
                            _self.getProjectModel().setProperty(ioEvent.mParameters.blockPath, loBlock);
                            _self.fireBlockModified(ioEvent);
                        }
                    },
                    blockDelete: function (ioData) {
                        _self.getProjectData(ioData);
                    }
                });
            },

            /**
             * Event Handlers Starts
             */
            onBeforeOpenContextMenu: function (ioEvent) {
                var loMenu = ioEvent.getSource().getContextMenu();

                loMenu.setBindingContext(ioEvent.mParameters.listItem.getBindingContext("projectModel"), "projectModel");
            },

            onItemSelectedContextMenu: function (ioEvent) {
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

            triggerProjectUpdate: function () {

            },

            onDropWithSubNodes: function (ioEvent) {
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

            onDropWithoutSubNodes: function (ioEvent) {
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

            onSelectionAggregation: function (ioEvent) {
                //Populate a List of Possible Templates and Manual Controls possible for the Selected Aggregation
                var laSelectedItemPath = this.getSelectedItemContext().getPath().split("/");
                laSelectedItemPath.pop();
                laSelectedItemPath.pop();

                var laAllControlList = this.getModel().getProperty("/controlList");
                var lsControlName = this.getProjectModel().getProperty(laSelectedItemPath.join("/")).name;
                var lsAggregationName = this.getSelectedItem().name;

                //Populate the list of Probable controls to be added to the Aggregation for that control
                var lsSelectedAggregationItem = "";

                if (this.getSelectedItem().aggregationType === "Template"
                    && this.getSelectedItem().nodes && this.getSelectedItem().nodes.length === 1) {
                    lsSelectedAggregationItem = this.getSelectedItem().nodes[0].name;
                } else {
                    lsSelectedAggregationItem = "";
                }

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("aggregationSelector", "populateAggregationList", {
                    allControlList: laAllControlList,
                    controlName: lsControlName,
                    aggregationName: lsAggregationName,
                    aggregationType: this.getSelectedItem().aggregationType,
                    selectedAggregationItem: lsSelectedAggregationItem,
                    multiple: this.getSelectedItem().multiple
                });

                this.triggerShowLivePreview();
            },

            getProjectModel: function () {
                return this.getModel("projectModel");
            },

            getTree: function () {
                return this._oTreeContainer.getItems()[1].getContent()[0];
            },

            updateBlockWithControlId: function (ioBlock) {
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

            onDragStart: function (ioEvent) {
                var loDragSession = ioEvent.getParameter("dragSession");
                var loDraggedRow = ioEvent.getParameter("target");

                if (loDragSession.getDragControl().getBindingContext("projectModel").getObject().type !== "Control") {
                    ioEvent.preventDefault();
                }
            },

            onDrop: function (ioEvent) {
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

                if (loDroppedControl.getParentNode().getId() === loDraggedControl.getParentNode().getId()
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

            getSelectedItemContext: function () {
                if (this.getTree().getSelectedItem()) {
                    return this.getTree().getSelectedItem().getBindingContext("projectModel");
                }
            },

            getSelectedItem: function () {
                if (this.getSelectedItemContext()) {
                    return this.getSelectedItemContext().getObject();
                } else {
                    return {};
                }
            },

            onItemPressTree: function (ioEvent) {
                var loSelectedObj = jQuery.extend(true, {}, this.getSelectedItem());
                console.log(ioEvent.mParameters.listItem.getBindingContext("projectModel").getObject());

                if (this.getSelectedItem().type === "Project") {
                    this.oProjectEdit.initialize(ioEvent.mParameters.listItem.getBindingContext("projectModel").getObject());
                } else if (this.getSelectedItem().type === "Block") {
                    this.onSelectBlockInProjectTree(this.getSelectedItem());
                } else if (this.getSelectedItem().type === "View") {
                    this.onSelectBlockInProjectTree(this.getSelectedItem());
                } else if (this.getSelectedItem().type === "Control") {
                    this.onSelectionControl(this.getSelectedItem());
                } else if (this.getSelectedItem().type === "Aggregation") {
                    this.onSelectionAggregation(ioEvent);
                }

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("appBuilder", "navigation", {
                    type: this.getSelectedItem().type
                });
            },

            onSelectBlockInProjectTree: function (ioSelectedItemObject) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("updateBlock", "setSelectedBlock", {
                    block: ioSelectedItemObject,
                    controlList: this.getModel().getProperty("/controlList")
                });
                this.triggerShowLivePreview();
            },

            onSelectionControl: function (ioSelectedItemObject) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("ms", "renderMetadata", ioSelectedItemObject);
                this.triggerShowLivePreview();
            },

            triggerShowLivePreview: function () {
                var lsCorrespondingBlockPath = this.getCorrespondingBlockFromPath();
                var loNewBlock = this.getProjectModel().getProperty(lsCorrespondingBlockPath);
                var loCodeData = this._oUI5CodeDataGenerator.getCode(loNewBlock);

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("designer", "renderBlock", loCodeData);
            },

            onPressRefreshTree: function () {
                this.getProjectData();
            },

            getProjectData: function () {
                var _self = this;
                this._iIdCount = 1;

                var loParams = {
                    type: "GET",
                    url: "/projects/list",
                    fnSuccess: function (ioData) {
                        if (ioData && ioData.projects && ioData.projects.length) {
                            var laProjects = ioData.projects;
                            var laBlocks = ioData.blocks;

                            for (var i = 0; i < laProjects.length; i++) {
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
                                for (var j = 0; j < laBlocks.length; j++) {
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

            updateIds: function (iaProjects) {
                for (var i = 0; i < iaProjects.length; i++) {
                    if (iaProjects[i].type === "Control") {
                        iaProjects[i].controlId = "sapui5in__" + this._iIdCount++;
                    }
                    if (iaProjects[i].nodes) {
                        this.updateIds(iaProjects[i].nodes);
                    }
                }

                return iaProjects;
            },

            getModel: function () {
                return this.getTreeContainer().getModel("projectModel");
            },

            getTreeContainer: function () {
                return this._oTreeContainer;
            },

            openCreateProjectDialog: function () {
                this.oProjectCreate.openWizard();
            },

            onPressGenerateProject: function (ioEvent) {
                this.firePressGenerateProject(ioEvent);
            },

            onPressUpdateProject: function (ioEvent) {
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
                    fnSuccess: function (iaData) {
                        _self.getProjectData();
                    }
                };
                Ajax.call(loParams);
            },

            onPressClose: function (ioEvent) {
                ioEvent.getSource().getParent().close();
            },

            onPressBtnShowBlockList: function (ioEvent) {
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
                        fnSuccess: function (iaData) {
                            _self.getModel().setProperty("/blockList", iaData);
                        }
                    };

                    Ajax.call(loParams);
                }
            },

            onItemPressBlockList: function (ioEvent) {
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

            getProjectOid: function (isPath) {
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

            onPressDeleteTreeItem: function (ioEvent) {
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

            deleteItemNode: function (ioEvent) {
                var loBindingContext = ioEvent.getSource().getBindingContext("projectModel");
                var lsId = loBindingContext.getObject()._id;
                var laPath = loBindingContext.getPath().split("/");
                var liItemIndex = laPath[laPath.length - 1];
                var lsParentPath = laPath.splice(0, laPath.length - 1).join("/");

                var loParams = {
                    type: "DELETE",
                    data: {},
                    fnSuccess: function (iaData) {
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
            getTreeItemPathFromControlId: function (isPath, isViewId, isControlId) {
                var lsImmediateBlockFromPath = this.getCorrespondingBlockFromPath(isPath);
                var rsSelectedgetTreeItemPathFromControlId = this.getTreeItemPathFromControlIdRecursive(lsImmediateBlockFromPath, isViewId, isControlId);

                return rsSelectedgetTreeItemPathFromControlId;
            },

            //Gets the immediate Block/View from the path Provided
            getCorrespondingBlockFromPath: function (isPath) {
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

            getTreeItemPathFromControlIdRecursive: function (isPath, isViewId, isSelectedControlId) {
                var loNode = this.getProjectModel().getProperty(isPath);
                if (loNode.type === "Control" && isSelectedControlId === isViewId + "--" + loNode.controlId) {
                    return isPath;
                } else if (loNode.nodes) {
                    for (var i = 0; i < loNode.nodes.length; i++) {
                        var lsPath = this.getTreeItemPathFromControlIdRecursive(isPath + "/nodes/" + i, isViewId, isSelectedControlId);
                        if (lsPath) {
                            return lsPath;
                        }
                    }
                }
            },

            onSelectBlock: function (ioEvent) {
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

            onChangeControlStyleClass: function (ioEvent) {
                this.getSelectedItem().selections.properties.styleClass = {
                    value: ioEvent.getSource().getValue(),
                    fixedValue: true
                };
                this.getProjectModel().refresh();

                this.fireChangeMS(ioEvent);
            },

            getAvailableLibraries: function () {
                return this._aAvailableLibraries;
            },

            setControlTypes: function (ioControl) {
                this.getModel().setProperty("/controlList", this.getAllControlNames(this.getAvailableLibraries()));
            },

            getAllControlNames: function (iaLibraries) {
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

            onSelectionChangeRootControl: function (ioEvent) {
                var lsSelectedKey = ioEvent.getSource().getParent().getParent().getItems()[5].getSelectedKey();

                var loBindingContext = this.getSelectedItem();
                loBindingContext.nodes = [];
                loBindingContext.nodes.push(this.getNewControlNode(ioEvent.mParameters));
            },

            onChangeBlockName: function (ioEvent) {
                if (ioEvent.getSource().getValue()) {
                    this.fireChangeBlockName(ioEvent.getSource().getValue());
                } else {
                    sap.m.MessageToast.show("Name cannot be Empty");
                }
            },

            triggerBlockNameChanged: function () {
                if (arguments[2].name) {
                    this.getSelectedItem().name = arguments[2].name;
                    this.getProjectModel().refresh();
                }
            },

            triggerRootControlChanged: function () {
                if (this.getSelectedItem() && arguments[2].name) {
                    this.getSelectedItem().nodes = [];
                    this.getSelectedItem().nodes.push(this.oBlock.getNewControlNode(arguments[2].name));
                    this.getProjectModel().refresh();

                    this.triggerShowLivePreview();
                }
            },

            triggerPropertyChange: function () {
                var loProperty = arguments[2];

                if (loProperty.rowSelected) {
                    var loTempProp = {
                        fixedValue: loProperty.fixedValue,
                        value: loProperty.value
                    };

                    if (!this.getSelectedItem().selections.properties) {
                        this.getSelectedItem().selections.properties = {};
                    }
                    this.getSelectedItem().selections.properties[loProperty.name] = loTempProp;
                } else {
                    if (this.getSelectedItem().selections.properties
                        && this.getSelectedItem().selections.properties[loProperty.name]) {
                        delete (this.getSelectedItem().selections.properties[loProperty.name]);
                    }
                }
                this.getProjectModel().refresh();
                this.triggerShowLivePreview();
            },

            triggerAggregationChange: function () {
                var loAggregation = arguments[2];

                if (loAggregation.rowSelected) {
                    delete (loAggregation.rowSelected);

                    if (!this.getSelectedItem().nodes) {
                        this.getSelectedItem().nodes = [];
                    }
                    this.getSelectedItem().nodes.push(loAggregation);
                } else {
                    if (this.getSelectedItem().nodes) {
                        for (var i = 0; i < this.getSelectedItem().nodes.length; i++) {
                            if (this.getSelectedItem().nodes[i].name === loAggregation.name) {
                                this.getSelectedItem().nodes.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                this.getProjectModel().refresh();
            },

            triggerEventChange: function () {
                var loEventNode = arguments[2];

                if (loEventNode.rowSelected) {
                    delete (loEventNode.rowSelected);

                    if (!this.getSelectedItem().selections.events) {
                        this.getSelectedItem().selections.events = {};
                    }
                    this.getSelectedItem().selections.events[loEventNode.name] = {};
                } else {
                    if (this.getSelectedItem().selections.events
                        && this.getSelectedItem().selections.events[loEventNode.name]) {
                        delete (this.getSelectedItem().selections.events[loEventNode.name]);
                    }
                }
                this.getProjectModel().refresh();
                this.triggerShowLivePreview();
            },

            triggerChangeAggregationType: function () {
                this.getSelectedItem().aggregationType = arguments[2].aggregationType;
                this.getSelectedItem().nodes = [];
                this.getProjectModel().refresh();

                this.triggerShowLivePreview();
            },

            triggerAddControlInAggregation: function () {
                var lsAggregationNodePath = this.getSelectedItemContext().getPath();
                var laTemp = lsAggregationNodePath.split("/");
                laTemp.pop();
                laTemp.pop();
                var lsControlPath = laTemp.join("/");
                var loControlNode = this.getProjectModel().getProperty(lsControlPath);

                if (arguments[2].aggregationType === "Templates") {
                    this.oBlock.addControlToAggregation(lsAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(arguments[2].control));
                } else {
                    if (!this.getSelectedItem().multiple && loControlNode.nodes && loControlNode.nodes.length === 1) {
                        sap.m.MessageToast.show("Cannot add Multiple Controls to Single Aggregation Type");
                    } else {
                        this.oBlock.addControlToAggregation(lsAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(arguments[2].control));
                    }
                }

                this.triggerShowLivePreview();
            },

            onPressRemoveControlFromTree: function (ioEvent) {
                var loSelectedItemContext = this.getSelectedItemContext();
                var lsContextPath = ioEvent.getSource().getBindingContext("projectModel").getPath();
                var laTemp = lsContextPath.split("/");
                var liControlPosition = laTemp[laTemp.length - 1];
                laTemp.pop();
                laTemp.pop();

                var loImmediateNode = this.getProjectModel().getProperty(laTemp.join("/"));
                loImmediateNode.nodes.splice(liControlPosition, 1);
                this.getProjectModel().refresh();
            },

            onPressSaveBlock: function (ioEvent) {
                var lsAggregationPath = ioEvent.getSource().getBindingContext("projectModel").getPath();
                this.oBlock.updateBlock(lsAggregationPath, this.getModel("projectModel"), this.getTree());
            }
        });

        return Project;
    }, /* bExport= */ true);