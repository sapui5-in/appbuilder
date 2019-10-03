sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule"
    ],
    function (jQuery, BaseModule) {
        "use strict";

        var Project = BaseModule.extend("sapui5in.appbuilder.modules.designer.Designer", {

            metadata: {
                properties: {
                    containerId: {
                        type: "string"
                    }
                }
            },


            init: function () {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("designer", "renderBlock", this.showLivePreview, this);
            },

            showLivePreview: function () {
                this.renderBlock(arguments[2]);
            },

            renderBlock: function (ioCodeData) {
                var _self = this;
                var loXML = $.parseXML(ioCodeData[0]);

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("appBuilder", "updateCodeData", {
                    code: ioCodeData[0],
                    data: JSON.stringify(ioCodeData[1], null, 2)
                });

                sap.ui.view({
                    async: true,
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewContent: loXML
                }).loaded().then(function (ioView) {
                    sap.ui.getCore().byId(_self.getContainerId()).destroyItems();
                    sap.ui.getCore().byId(_self.getContainerId()).addItem(ioView);

                    var loModel = new sap.ui.model.json.JSONModel();
                    ioView.setModel(loModel, "appModel");
                    loModel.setData(ioCodeData[1]);
                });
            }
        });

        return Project;
    }, /* bExport= */ true);