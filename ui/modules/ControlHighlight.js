/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sapui5in/appbuilder/modules/BaseModule"],
    function (jQuery, BaseModule) {
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
                events: {
                    clickControl: {
                        parameters: {
                            control: {type: 'object'}
                        }
                    }
                }
            },

            init: function () {
                this._bFlag = true;
                this.prevElement = null;
                this._oOverlayDiv = $("#overlayControl");

                this._oOverlayDiv.mouseover(function (e) {
                    $("#__overlayText").css({"display": "initial"});
                });
                this._oOverlayDiv.mouseout(function () {
                    $("#__overlayText").css({"display": "none"});
                });
                this.enableClickOnOverlay();
            },

            initialize: function (isContainerId) {
                if (this._bFlag) {
                    this._bFlag = false;
                    this._sContainerId = isContainerId;
                    $("#" + this.getContainerId()).click(this.clickUI5Control.bind(this));
                }
            },

            getContainerId: function () {
                return this._sContainerId;
            },

            enableClickOnOverlay: function () {
                this._oOverlayDiv.click(function (e) {
                    console.log(e);
                });
            },

            hideOverlay: function () {
                this._oOverlayDiv.css({
                    display: "none"
                });
            },

            getSelectedUI5DOMControl: function (e) {
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

            highlightUI5Control: function (ioSelectedUI5DOMControl, isContainerId) {
                this.initialize(isContainerId);
                if (ioSelectedUI5DOMControl && $("#" + ioSelectedUI5DOMControl.getId()) && $("#" + ioSelectedUI5DOMControl.getId()).offset()) {
                    this._oOverlayDiv.css({
                        "display": "initial",
                        "top": $("#" + ioSelectedUI5DOMControl.getId()).offset().top,
                        "left": $("#" + ioSelectedUI5DOMControl.getId()).offset().left,
                        "height": $("#" + ioSelectedUI5DOMControl.getId()).height(),
                        "width": $("#" + ioSelectedUI5DOMControl.getId()).outerWidth()
                    });
                    if ($("#__overlayText")) {
                        $("#__overlayText").text(ioSelectedUI5DOMControl.getMetadata().getElementName());
                    }
                }
            },

            clickUI5Control: function (e) {
                var loSelectedUI5DOMControl = this.getSelectedUI5DOMControl(e);
                this.highlightUI5Control(loSelectedUI5DOMControl);
                this.fireClickControl({
                    control: loSelectedUI5DOMControl
                });
            }
        });

        return ControlHighlight;
    }, /* bExport= */ true);