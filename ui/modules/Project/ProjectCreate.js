sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, Ajax) {
	"use strict";

	var Project = BaseModule.extend("sapui5in.appbuilder.modules.Project.ProjectCreate", {

		metadata: {
			events: {
				projectCreated: {}
			}
		},

		init: function() {
			var loModel = new sap.ui.model.json.JSONModel();
			this.oDialog = sap.ui.xmlfragment("ProjectCreate", "sapui5in.appbuilder.modules.Project.Dialogs.NewProjectDialog", this);

			loModel.setProperty("/mode", "New");
			this.oDialog.setModel(loModel);
		},

		onBeforeOpen: function() {
			this.initialize();
		},

		initialize: function() {
			this.oDialog.getModel().setProperty("/projectBasics", {
				projectName: "",
				projectNamespace: "sapui5in",
				createView: true,
				viewName: ""
			});

			this.oDialog.getModel().setProperty("/projectSettings", {});
		},

		openWizard: function() {
			this.oDialog.open();
		},

		onPressBtnCreate: function() {
			this.create();
		},

		create: function() {
			var _self = this;
			var loWSProjectBasics = this.oDialog.getModel().getProperty("/projectBasics");
			var loProject = {
					name: loWSProjectBasics.projectName,
					namespace: loWSProjectBasics.projectNamespace
			};

			if (loWSProjectBasics.createView) {
				loProject.view = {
						name: loWSProjectBasics.viewName
				};
			}

			var loParams = {
					type: "POST",
					url: "/projects/create",
					data: loProject,
					fnSuccess: function(iaData) {
						_self.fireProjectCreated(iaData);
					}
			};
			Ajax.call(loParams, this.oDialog);

			this.oDialog.close();
		},

		onPressBtnClose: function() {
			this.oDialog.close();
		}
	});

	return Project;
}, /* bExport= */ true);