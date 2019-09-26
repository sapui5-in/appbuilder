sap.ui.define(["jquery.sap.global",
	"sapui5in/appbuilder/modules/BaseModule",
	"sap/m/MessageToast"
	],
	function(jQuery, BaseModule, MessageToast) {
	"use strict";

	var Ajax = BaseModule.extend("sapui5in.appbuilder.modules.Ajax", {});

	Ajax.call = function(ioParams, ioControl) {
		if (ioParams.url) {
			if (ioControl) {
				ioControl.setBusyIndicatorDelay(10);
				ioControl.setBusy(true);
			}
			$.ajax({
				type: ioParams.type ? ioParams.type : "GET",
				url: ioParams.url,
				data: ioParams.data ? ioParams.data : {},
				success: function(ioData) {
					if (ioParams.fnSuccess) {
						ioParams.fnSuccess(ioData.data);
					}
					if (ioControl) {
						ioControl.setBusy(false);
					}
				},
				error: function(ioError) {
					if (ioParams.fnError) {
						ioParams.fnError(ioError);
					}
					if (ioControl) {
						ioControl.setBusy(false);
					}
				}
			});
		}
	};

	return Ajax;
}, /* bExport= */ true);