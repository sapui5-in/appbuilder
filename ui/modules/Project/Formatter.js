sap.ui.define([
    "sap/ui/core/IconColor"
], function (IconColor) {
    "use strict";
    return {

		showValueInputField: function(isType, ibShow) {
			if (isType === "boolean") {
				return false;
			} else {
				if (ibShow) {
					return false;
				} else {
					return true;
				}
			}
		},

		showValueCheckBox: function(isType) {
			if (isType === "boolean") {
				return true;
			} else {
				return false;
			}
		},

		setPropertyValueSelected: function(isType, value) {
			if (isType === "boolean") {
				if (value) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		setPropertyValueInputType: function(isType) {
			if (isType === "int" || isType === "float") {
				return sap.m.InputType.Number;
			} else {
				return sap.m.InputType.Text;
			}
		},

		setFixedValueIconColor: function(ibFixedValue, ibRowSelected) {
			if (ibRowSelected) {
				if (ibFixedValue) {
					return "red";
				} else {
					return "green";
				}
			} else {
				return "#dfdfdf";
			}
		},

		selectRootControl: function(isType, iaNodes) {
			if ((isType === "Block" || isType === "View") && iaNodes && iaNodes.length) {
				return iaNodes[0].name;
			} else {
				return "";
			}
		}
    }
}, true);