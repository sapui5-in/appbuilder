sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule",
        "sapui5in/appbuilder/modules/ControlHighlight",
        "sapui5in/appbuilder/modules/UI5CodeDataGenerator/UI5CodeDataGenerator"
    ],
    function (jQuery, BaseModule, ControlHighlight, UI5CodeDataGenerator) {
        "use strict";

        var Designer = BaseModule.extend("sapui5in.appbuilder.modules.designer.Designer", {

            metadata: {
                properties: {
                    containerId: {
                        type: "string"
                    }
                }
            },

            init: function () {
                this.sBlockId = "";
                this.viewId = "";

                if (!this._oUI5CodeDataGenerator) {
                    this._oUI5CodeDataGenerator = new UI5CodeDataGenerator();
                }

                this.oControlHighlight = new ControlHighlight({
                    clickControl: this.onClickControl.bind(this)
                });

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("designer", "renderBlock", this.showLivePreview, this);
            },

            onClickControl: function (ioEvent) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("project", "clickControl", {
                    control: ioEvent.getParameter("control")
                });
            },

            showLivePreview: function () {
                this.renderBlock(arguments[2]);
            },

            renderBlock: function (ioData) {
                var _self = this;
                this.oControlHighlight.hideOverlay();

                var lsBlockId = ioData.block._id;
                var loCodeData = this._oUI5CodeDataGenerator.getCode(ioData.block);
                var loXML = $.parseXML(loCodeData[0]);

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("appBuilder", "updateCodeData", {
                    code: loCodeData[0],
                    data: JSON.stringify(loCodeData[1], null, 2)
                });

                if (this.sBlockId !== lsBlockId || ioData.treeChanged) {
                    this.sBlockId = lsBlockId;

                    sap.ui.view({
                        async: true,
                        type: sap.ui.core.mvc.ViewType.XML,
                        viewContent: loXML
                    }).loaded().then(function (ioView) {
                        _self.viewId = ioView.getId();
                        _self.onViewLoaded(ioView, loCodeData[1], ioData.controlId);
                    });
                } else {
                    if (ioData.controlId) {
                        var loView = sap.ui.getCore().byId(this.viewId);
                        this.highlightControlOnTreeSelectionChange(loView.byId(ioData.controlId));
                    }
                }
            },

            onViewLoaded: function (ioView, ioData, isControlId) {
                var _self = this;
                sap.ui.getCore().byId(this.getContainerId()).destroyItems();
                sap.ui.getCore().byId(this.getContainerId()).addItem(ioView);

                ioView.setModel(new sap.ui.model.json.JSONModel(ioData), "appModel");

                if (isControlId) {
                    ioView.addDelegate({
                        onAfterRendering: function (ioEvent) {
                            _self.highlightControlOnTreeSelectionChange(ioView.byId(isControlId));
                        }
                    });
                }
            },

            highlightControlOnTreeSelectionChange: function (ioControl) {
                if (ioControl) {
                    this.oControlHighlight.highlightUI5Control(ioControl, this.getContainerId());
                }
            }
        });

        return Designer;
    }, /* bExport= */ true);