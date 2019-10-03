sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/Ajax"
	],
	function(jQuery, BaseModule, Ajax) {
	"use strict";

	var MetadataSelector = BaseModule.extend("sapui5in.appbuilder.modules.MetadataSelector.IconSelection", {

		metadata: {
			events: {
				iconSelectFromDialog: {}
			}
		},

		open: function(ioEvent) {
			this.oSelectedInputField = ioEvent.getSource();

			if (!this.oIconSelectionDialog) {
				this.oIconSelectionDialog = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.dialogs.IconSelection", this);
				var loModelIconList = new sap.ui.model.json.JSONModel();
				this.oIconSelectionDialog.setModel(loModelIconList, "iconListModel");
				this.loadIconList(loModelIconList, "ui/modules/MetadataSelector/iconGroups.json");
			}

			this.oIconSelectionDialog.open();
		},

		loadIconList: function(ioModel, isUrl) {
			var fnSuccess = function(ioData) {
				var laIcons = [];
				var laFullIconList = [];
				for (var i=0;i<ioData.groups.length;i++) {
					for (var j=0;j<ioData.groups[i].icons.length;j++) {
						ioData.groups[i].icons[j].groupName = ioData.groups[i].name;
						ioData.groups[i].icons[j].groupText = ioData.groups[i].text;

						if (laFullIconList.indexOf(ioData.groups[i].icons[j].name) === -1) {
							laFullIconList.push(ioData.groups[i].icons[j].name);
							laIcons.push(ioData.groups[i].icons[j]);
						}
					}
				}

				ioModel.setProperty("/iconList", laIcons);
			};

			$.ajax({
				url: isUrl,
				dataType: "json",
				success: function(ioData) {
					fnSuccess(ioData);
				},
				error: function(e) {
					console.log("Could not get Icon List;")
				}
			});
		},

		onPresIconListItem: function(ioEvent) {
			var loSelectedItem = ioEvent.getSource().getBindingContext("iconListModel").getObject();
			var loSelectorContext = this.oSelectedInputField.getBindingContext("msModel").getObject();

			loSelectorContext.value = "sap-icon://" + loSelectedItem.name;
			loSelectorContext.fixedValue= true;
			loSelectorContext.rowSelected = true;

			this.fireIconSelectFromDialog(loSelectorContext);

			this.oIconSelectionDialog.close();
		},

		onPressClose: function(ioEvent) {
			ioEvent.getSource().getParent().close();
		},

		getGroupHeader: function (ioGroup){
			return new sap.m.GroupHeaderListItem({
				title: ioGroup.key,
				upperCase: false
			});
		}
	});

	return MetadataSelector;
}, /* bExport= */ true);