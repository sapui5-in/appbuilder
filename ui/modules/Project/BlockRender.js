sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sapui5in/appbuilder/modules/UI5CodeDataGenerator/UI5CodeDataGenerator",
	],
	function(jQuery, BaseModule, UI5CodeDataGenerator) {
	"use strict";

	var BlockRender = BaseModule.extend("sapui5in.appbuilder.modules.Project.BlockRender", {

		metadata: {
			properties: {
				container: {
					type: "object"
				}
			}
		},

		init: function() {
			this.UI5CodeDataGenerator = new UI5CodeDataGenerator();
		},

		generateLivePreview: function(isPath) {
			var _self = this;
			var lsCorrespondingBlockPath = this._oProject.getCorrespondingBlockFromPath(isPath);
			var loNewBlock = this.getProjectModel().getProperty(lsCorrespondingBlockPath);

			this.getContainer().getParent().to("idContainer");

			if (!_.isEqual(loNewBlock, this._oRenderedBlock)) {
				this._oRenderedBlock = jQuery.extend(true, {}, loNewBlock);
				this.createView(this._oRenderedBlock);

				this.getProjectModel().refresh();
			} else {
				if (this._oProject.getSelectedItem() && _self._oProject.getSelectedItem().controlId) {
					this.highlightControlOnTreeSelectionChange();
				}
			}
		},

		createView: function(ioBlock) {
			if (ioBlock) {
				var _self = this;
				var loCodeData = this._oUI5CodeDataGenerator.getCode(ioBlock);
				this.getView().getModel("appModel").setProperty("/", loCodeData[1]);
				this.updateData(JSON.stringify(this.getView().getModel("appModel").getData(), null, 2));

				var loXML = $.parseXML(loCodeData[0]);

				sap.ui.view({
					async: true,
					type: sap.ui.core.mvc.ViewType.XML,
					viewContent: loXML
				}).loaded().then(function(ioView) {
					_self.renderBlock(ioView);
				});

				sap.ui.getCore().byId("Code").setValue(loCodeData[0]);
			}
		},
		
		renderBlock: function(ioView) {
			var _self = this;
			this.oPreviewView = ioView;
			this._sGeneratedViewId = ioView.getId();

			this.getContainer().destroyItems();
			this.getContainer().addItem(ioView);

			if (this._oProject.getSelectedItem() && this._oProject.getSelectedItem().controlId) {
				ioView.addDelegate({
					onAfterRendering: function(ioEvent) {
						if (!this._bFlag) {
							this._bFlag = true;
							_self.highlightControlOnTreeSelectionChange();
						}
					}
				});
			}
		},

		highlightControlOnTreeSelectionChange: function() {
			if (this._oProject.getSelectedItem().type === "Control") {
				var lsId = this.oPreviewView.getId() + "--" + this._oProject.getSelectedItem().controlId;

				this.oControlHighlight.highlightUI5Control(sap.ui.getCore().byId(lsId));
			}
		}
	});

	return BlockRender;
}, /* bExport= */ true);