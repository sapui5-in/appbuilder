sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sapui5in/appbuilder/modules/Ajax",
	"sap/ui/codeeditor/CodeEditor",
	"sapui5in/appbuilder/modules/Project/Project",
	"sapui5in/appbuilder/modules/ControlMetadata",
	"sapui5in/appbuilder/modules/UI5CodeDataGenerator/UI5CodeDataGenerator",
	"sapui5in/appbuilder/modules/ControlHighlight",
	"sapui5in/appbuilder/modules/BlockHierarchy"
	], function(Controller, Ajax, CodeEditor, Project, ControlMetadata, UI5CodeDataGenerator, ControlHighlight, BlockHierarchy) {
	"use strict";

	return Controller.extend("sapui5in.appbuilder.controller.Home", {

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("appDesigner").attachPatternMatched(this._onRouteMatched, this);
			this.initializeProject();
		},

		_onRouteMatched: function(ioEvent) {
			this.resetProject();
		},

		initializeProject: function() {
			var _self = this;
			var loModel = new sap.ui.model.json.JSONModel();
			var loModel1 = new sap.ui.model.json.JSONModel();
			this._oRenderedBlock = {};

			loModel.setSizeLimit(2000);

			this.getView().setModel(loModel, "appModel");
			this.getView().setModel(loModel1, "viewModel");
			loModel1.setProperty("/pageLayout", {
				showLeftSidebar: true,
				showRightSidebar: false
			});

			this.oControlHighlight = new ControlHighlight({
				containerId: "idContainer",
				clickControl: function(ioEvent) {
					_self.onClickControlSection(ioEvent);
				}
			});

			this.byId("idHeaderToolbar").addContent(this.oControlHighlight.getSelectionButton());
		},

		getProjectModel: function() {
			return this._oProject.getModel("projectModel");
		},

		onClickControlSection: function(ioEvent) {
			var lsPath = this._oProject.getSelectedItemContext().getPath();
			var lsTreeItemPathFromControlId = this._oProject.getTreeItemPathFromControlId(lsPath, this._sGeneratedViewId, ioEvent.mParameters.getId());

//			this._oProject.getTree().setSelectedContextPaths([lsTreeItemPathFromControlId]);
//			this._oProject.getTree().getModel("projectModel").refresh();
//			this.onSelectionChangeTree();
		},

		setNonLeftSidebarWidth: function(ioPageLayout) {
			var raWidth = "calc(100%";

			if (ioPageLayout && !ioPageLayout.showLeftSidebar) {
				raWidth += " - 225px";
			}

			raWidth += ")";

			return raWidth;
		},

		toggleLeftSidebar: function(ioEvent) {
			this.getView().getModel("viewModel").setProperty("/pageLayout/showLeftSidebar", 
					!this.getView().getModel("viewModel").getProperty("/pageLayout/showLeftSidebar"));
		},

		setMiddleSectionWidth: function(ioPageLayout) {
			var raWidth = "calc(100%";

			if (ioPageLayout && ioPageLayout.showRightSidebar) {
				raWidth += " - 375px";
			}

			raWidth += ")";

			return raWidth;
		},

		toggleRightSidebar: function(ioEvent) {
			this.getView().getModel("viewModel").setProperty("/pageLayout/showRightSidebar", !this.getView().getModel("viewModel").getProperty("/pageLayout/showRightSidebar"));
		},

		toggleBlockTree: function(ioEvent) {
			if (this.byId("idLeftSidebar").getCurrentPage().getId() === this.byId("idProjectHierarchyContainer").getId()) {
				this.byId("idLeftSidebar").to(this.byId("idBlockHierarchyContainer").getId());
			} else {
				this.byId("idLeftSidebar").to(this.byId("idProjectHierarchyContainer").getId());
			}
		},

		resetProject: function() {
			var _self = this;
			if (!this._oUI5CodeDataGenerator) {
				this._oUI5CodeDataGenerator = new UI5CodeDataGenerator();
			}
			if (!this._oProject) {
				this._oProject = new Project({
					treeItemPress: function(ioEvent) {
						_self.onPressTreeItem(ioEvent);
					},
					selectionChangeTree: function(ioEvent) {
						_self.onSelectionChangeTree(ioEvent);
					},
					selectItem: function(ioEvent) {
						_self.onSelectItem(ioEvent);
					},
					selectBlock: function(ioEvent) {
						_self.onSelectBlock(ioEvent);
					},
					pressGenerateProject: function(ioEvent) {
						_self.onPressGenerateProject(ioEvent);	
					},
					changeMS: function(ioEvent) {
						_self.onChangeMS(ioEvent);
					},
					blockModified: function(ioEvent) {
						_self.generateLivePreview();
					}
				});

				this.byId("idProjectHierarchyContainer").addItem(this._oProject.getTreeContainer());

				this.byId("idMiddleSection").addItem(
						new sap.m.NavContainer({
							height: "100%",
							pages: [
								new sap.m.VBox({
									id : "idContainer",
									height: "100%",
									width: "100%"
								}),
								new sap.ui.codeeditor.CodeEditor({
									id: "Code",
									type: "xml"
								}),
								new sap.ui.codeeditor.CodeEditor({
									id: "Data",
									type: "json",
									liveChange: function(ioEvent) {
//										_self.updateData(ioEvent.getSource().getValue());
									}
//								value: "{appModel>/}"
								}),
								this._oProject.oProjectEdit.getWizard()
								]
						}));

				this.byId("idRightSidebar").getItems()[0].addContent(this._oProject.getMSContainer());

				if (!this.oBlockHierarchy) {
					this.oBlockHierarchy = new BlockHierarchy({
						itemPress: function(ioEvent) {
							_self.onItemPressBlockHierarchy(ioEvent);
						}
					});

					this.byId("idBlockHierarchyContainer").addItem(this.oBlockHierarchy.getHierarchyTree());
				}
			}
		},

		onItemPressBlockHierarchy: function(ioEvent) {
			var loSelectedItem = ioEvent.mParameters;
			this.oControlHighlight.highlightUI5Control(sap.ui.getCore().byId(loSelectedItem.id));

			//First Set the selected Item
			this._oProject.onSelectionControl(this._oProject.getSelectedItem());
		},

		onSelectionChangeSBLivePreview: function(ioEvent) {
			sap.ui.getCore().byId("idContainer").getParent().to(ioEvent.getSource().getSelectedKey());
		},

		onPressTreeItem: function(ioEvent) {
			console.log(ioEvent)
		},

		onSelectionChangeTree: function(ioEvent) {
			this.getView().getModel("viewModel").setProperty("/pageLayout/showRightSidebar", true);

			if (this._oProject.getSelectedItem().type === "Project") {
				sap.ui.getCore().byId("idContainer").getParent().to(this._oProject.oProjectEdit.getWizard().getId());
				this.getView().getModel("viewModel").setProperty("/pageLayout/showRightSidebar", false);
			} else if (this._oProject.getSelectedItem().type === "Block") {
				this.generateLivePreview();
			} else if (this._oProject.getSelectedItem().type === "View") {
				this.generateLivePreview();
			} else if (this._oProject.getSelectedItem().type === "Control") {
				this.generateLivePreview();
			} else if (this._oProject.getSelectedItem().type === "Aggregation") {
				this.generateLivePreview();
			}
		},

		onChangeMS: function() {
			this.generateLivePreview();
		},

		onSelectItem: function() {

		},

		//TODO: Move to Project.js
		onPressGenerateProject: function(ioEvent) {
			var loProjectContext = jQuery.extend(true, {}, ioEvent.mParameters.oSource.getBindingContext("projectModel").getObject());
			var laViews = [];

			for (var i = 0; i < loProjectContext.nodes.length; i++) {
				if (loProjectContext.nodes[i].type === "ViewRoot") {
					laViews = loProjectContext.nodes[i].nodes;
					break;
				}
			}

			var laCodeData = [];	//Code and Data of the Views
			var laLibraries = [];

			for (i = 0;i<laViews.length;i++) {
				var loCodeData = this._oUI5CodeDataGenerator.getCode(laViews[i]);
				laCodeData.push({
					viewName: laViews[i].name,
					code: loCodeData[0],
					data: loCodeData[1]
				});
				laLibraries = _.union(laLibraries, this._oUI5CodeDataGenerator._aXmlns);

				laViews[i].viewName = laViews[i].name;
				delete (laViews[i].name);

				if (laViews[i].nodes) {
					delete (laViews[i].nodes);
				}
				if (laViews[i].code) {
					delete (laViews[i].code);
				}
			}

			var loProject = {
					_id: loProjectContext._id,
					projectName: loProjectContext.name,
					namespace: loProjectContext.namespace,
					libraries: laLibraries,
					theme: loProjectContext.theme,
					views: laViews,
					codeData: laCodeData
			};

			var loParams = {
					type: "POST",
					url: "/generateProject/create",
					data: {
						project: JSON.stringify(loProject),
					},
					fnSuccess: function(iaData) {

					}
			};

			Ajax.call(loParams);
		},

		updateData: function(ioData) {
			Core("Data").setValue(ioData);
		},

		generateLivePreview: function(isPath) {
			var _self = this;
			var lsCorrespondingBlockPath = this._oProject.getCorrespondingBlockFromPath(isPath);
			var loNewBlock = this.getProjectModel().getProperty(lsCorrespondingBlockPath);

			sap.ui.getCore().byId("idContainer").getParent().to("idContainer");

			if (!_.isEqual(loNewBlock, this._oRenderedBlock)) {
				this._oRenderedBlock = jQuery.extend(true, {}, loNewBlock);
				this.renderBlock(this._oRenderedBlock);

				this.getProjectModel().refresh();
			} else {
				if (this._oProject.getSelectedItem() && _self._oProject.getSelectedItem().controlId) {
					this.highlightControlOnTreeSelectionChange();
				}
			}
		},

		highlightControlOnTreeSelectionChange: function() {
			if (this._oProject.getSelectedItem().type === "Control") {
//				var lsId = this.oPreviewView.getId() + "--" + this._oProject.getSelectedItem().controlId;

//				this.oControlHighlight.highlightUI5Control(sap.ui.getCore().byId(lsId));
			}
		},

		renderBlock: function(ioContext) {
			var _self = this;
			var loCodeData = this._oUI5CodeDataGenerator.getCode(ioContext);
			this.getView().getModel("appModel").setProperty("/", loCodeData[1]);
			this.updateData(JSON.stringify(this.getView().getModel("appModel").getData(), null, 2));

			var loXML = $.parseXML(loCodeData[0]);

			sap.ui.view({
				async: true,
				type: sap.ui.core.mvc.ViewType.XML,
				viewContent: loXML
			}).loaded().then(function(ioView) {
				_self.oPreviewView = ioView;
				sap.ui.getCore().byId("idContainer").destroyItems();
				sap.ui.getCore().byId("idContainer").addItem(ioView);
				_self._sGeneratedViewId = ioView.getId();

				if (_self._oProject.getSelectedItem() && _self._oProject.getSelectedItem().controlId) {

					ioView.addDelegate({
						onAfterRendering: function(ioEvent) {
							if (!this._bFlag) {
								this._bFlag = true;
								_self.highlightControlOnTreeSelectionChange();
							}
						}
					});
				}
			});

			sap.ui.getCore().byId("Code").setValue(loCodeData[0]);
		},

		onPressBtnLogout: function() {
			console.log("Logout Pressed");
			window.location.replace(window.location.origin + "/auth/logout");
		}
	});
});