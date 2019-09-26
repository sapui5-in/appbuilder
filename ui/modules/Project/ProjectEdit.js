sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, Ajax) {
	"use strict";

	var Project = BaseModule.extend("sapui5in.appbuilder.modules.Project.ProjectEdit", {

		metadata: {
			events: {
				ProjectEdited: {}
			}
		},

		init: function() {
			var loModel = new sap.ui.model.json.JSONModel();
			this.oWizard = sap.ui.xmlfragment("ProjectEdit", "sapui5in.appbuilder.modules.Project.fragments.ProjectWizard", this);

			loModel.setProperty("/mode", "Edit");
			this.oWizard.setModel(loModel);
		},
		
		getWizard: function() {
			return this.oWizard;
		},

		initialize: function(ioProject) {
			if (ioProject) {
				this.oWizard.getModel().setProperty("/projectBasics", {
					projectOid: ioProject._id,
					projectName: ioProject.name,
					projectNamespace: ioProject.namespace
				});

				this.oWizard.getModel().setProperty("/projectSettings", {});
			}
		},

		edit: function() {
			var _self = this;
			var loWSProjectBasics = this.oWizard.getModel().getProperty("/projectBasics");
			var loProject = {
					name: loWSProjectBasics.projectName,
					namespace: loWSProjectBasics.projectNamespace
			};

			var loParams = {
					type: "POST",
					url: "/projects/update",
					data: loProject,
					fnSuccess: function(iaData) {
						_self.fireProjectEdited(iaData);
					}
			};
			Ajax.call(loParams, this.oWizard);
		}
	});

	return Project;
}, /* bExport= */ true);