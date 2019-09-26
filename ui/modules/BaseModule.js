sap.ui.define(["jquery.sap.global",
	"sap/ui/base/ManagedObject"
	],
	function(jQuery, ManagedObject) {
	"use strict";

	var BaseModule = ManagedObject.extend("sapui5in.appbuilder.modules.BaseModule", {

		init: function() {

		},

		fragmentById: function(isFragmentId, isId) {
			return sap.ui.core.Fragment.byId(isFragmentId, isId);
		},

		isValidAggregation: function(isControlName, isAggregationName, isChildElementName) {
			var loControl = eval("new " + isControlName + "()");

			var laControlAllAggregations = loControl.getMetadata().getAllAggregations();
			loControl.destroy();

			try {
				if (laControlAllAggregations[isAggregationName]) {
					var lsAggregationType = laControlAllAggregations[isAggregationName].type;

					var loChild = eval("new " + isChildElementName + "()");
					var loChildMetadata = loChild.getMetadata();
					var lsTempControlName = loChildMetadata._sClassName;
					loChild.destroy();

					while (lsTempControlName) {
						if (loChildMetadata._sClassName === lsAggregationType) {
							return true;
						} else if (loChildMetadata.getInterfaces().indexOf(lsAggregationType) !== -1) {
							return true;
						} else {
							loChildMetadata = loChildMetadata.getParent();
							if (loChildMetadata) {
								lsTempControlName =  loChildMetadata._sClassName;
								if (lsTempControlName !== "sap.ui.core.Control") {
									continue;
								}
							} else {
								break;
							}
						}
					}
				}
			} catch(e) {
				return false;
			}

			return false;
		}
	});

	return BaseModule;
}, /* bExport= */ true);