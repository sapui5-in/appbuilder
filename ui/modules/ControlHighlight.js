/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sapui5in/appbuilder/modules/BaseModule"],
		function(jQuery, BaseModule) {
	"use strict";
	/**
	 * Class to enable Control Selection
	 * 
	 * @class Class to enable Control Selection
	 * @param {object} mProperties
	 *
	 * @author SAPUI5.in
	 * @version 1.0
	 * 
	 * @constructor
	 * @public
	 * @extends sapui5in.appbuilder.modules.BaseModule
	 * @name sapui5in.appbuilder.modules.ControlHighlight
	 * 
	 */
	var ControlHighlight = BaseModule.extend("sapui5in.appbuilder.modules.ControlHighlight", {
		metadata: {
			properties: {

				/**
				 * text
				 */
				containerId: {
					type: "string",
					group: "Misc"
				}
			},
			events: {
				clickControl: {}
			}
		},

		init: function() {
			this.prevElement = null;
			this._oSelectionBtn = new sap.m.SegmentedButton({
				selectedKey: "disable",
				items: [
					new sap.m.SegmentedButtonItem({
						text: "Enable",
						key: "enable",
						width: "auto"
					}),
					new sap.m.SegmentedButtonItem({
						text: "Disable",
						key: "disable",
						width: "auto"
					})
					],
					selectionChange: [function(ioEvent) {
						this.switchControlHighlight();
					}, this]
			});
			this._oOverlayDiv = $("#overlayControl");
			this._iCounter = 0;
		},

		switchControlHighlight: function() {
			var lsKey = this._oSelectionBtn.getSelectedKey();
			if (lsKey === "enable") {
				this.enableMouseOver();
			} else {
				this.disableMouseOver();
			}
		},

		getSelectionButton: function() {
			return this._oSelectionBtn;
		},

		enableMouseOver: function() {
			var _self = this;

			function highlight(e) {
				var loSelectedUI5DOMControl = _self.getSelectedUI5DOMControl(e);

				_self.highlightUI5Control(loSelectedUI5DOMControl);
			}

			function click(e) {
				_self.clickUI5Control(e);
			}
//			$("#" + this.getContainerId()).mousemove(highlight);
			$("#" + this.getContainerId()).click(click);
		},

		disableMouseOver: function() {
			if (this.prevElement !== null) {
				this.prevElement.classList.remove("ControlHighlight");
			}
			$("#" + this.getContainerId()).unbind();
		},

		getSelectedUI5DOMControl: function(e) {
			var roUI5DOMControl = null;
			var loSelectedDOMElement = e.target || e.srcElement;

			// Show Control Name
			var loDOMElem = loSelectedDOMElement;
			while (loDOMElem.id === "") {
				loDOMElem = loSelectedDOMElement.parentElement;
				if (!loDOMElem) {
					break;
				}
			}
			if (loDOMElem && loDOMElem.id) {
				roUI5DOMControl = $("#" + loDOMElem.id).control(0);
				if (roUI5DOMControl) {
					this.prevElement = document.getElementById(roUI5DOMControl.getId());
				}
			}

			return roUI5DOMControl;
		},

		highlightUI5Control: function(ioSelectedUI5DOMControl) {
			var _self = this;
			if (ioSelectedUI5DOMControl) {
				this._oOverlayDiv.css({
					"display": "initial",
					"top": $("#" + ioSelectedUI5DOMControl.getId()).offset().top,
					"left": $("#" + ioSelectedUI5DOMControl.getId()).offset().left,
					"height": $("#" + ioSelectedUI5DOMControl.getId()).height(),
					"width": $("#" + ioSelectedUI5DOMControl.getId()).width()
				});
			}

			setTimeout(function() {
				_self._oOverlayDiv.css({display: "none"});
			}, 1000);				
		},

		clickUI5Control: function(e) {
			var _self = this;

			var loSelectedUI5DOMControl = this.getSelectedUI5DOMControl(e);
			if (loSelectedUI5DOMControl) {
				this._oOverlayDiv.css({
					"display": "initial",
					"top": $("#" + loSelectedUI5DOMControl.getId()).offset().top,
					"left": $("#" + loSelectedUI5DOMControl.getId()).offset().left,
					"height": $("#" + loSelectedUI5DOMControl.getId()).height(),
					"width": $("#" + loSelectedUI5DOMControl.getId()).width()
				});
				this._iCounter = 1000;

				try {
					this.fireClickControl(loSelectedUI5DOMControl);
				} catch (ioError) {
					console.log(ioError);
				}
			}

			setTimeout(function() {
				_self._oOverlayDiv.css({display: "none"});
			}, this._iCounter);				

		}
	});

	return ControlHighlight;
}, /* bExport= */ true);