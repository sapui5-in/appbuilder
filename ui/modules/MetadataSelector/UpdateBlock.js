sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule"
    ],
    function (jQuery, BaseModule) {
        "use strict";

        var MetadataSelector = BaseModule.extend("sapui5in.appbuilder.modules.MetadataSelector.UpdateBlock", {

            init: function () {
                this._UBContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.UpdateBlock", this);
                this._UBContainer.setModel(new sap.ui.model.json.JSONModel(), "msModel");
                this.getModel().setSizeLimit(10000);

                // Subscribe to an Event here
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("updateBlock", "setSelectedBlock", this.setSelectedBlock, this);
            },

            getUBContainer: function () {
                return this._UBContainer;
            },

            getModel: function () {
                return this._UBContainer.getModel("msModel");
            },

            setSelectedBlock: function () {
                var loBlock = arguments[2].block;
                this.getModel().setProperty("/", {
                    type: loBlock.type,
                    name: loBlock.name,
                    rootControl: loBlock.nodes && loBlock.nodes.length === 1 ? loBlock.nodes[0].name : "",
                    controlList: arguments[2].controlList
                });
            },

            onChangeBlockName: function (ioEvent) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("project", "changeBlockName", {
                    name: ioEvent.getSource().getValue()
                });
            },

            onSelectionChangeRootControl: function (ioEvent) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("project", "changeRootControl", {
                    name: ioEvent.getSource().getSelectedKey()
                });
            }
        });

        return MetadataSelector;
    }, /* bExport= */ true);