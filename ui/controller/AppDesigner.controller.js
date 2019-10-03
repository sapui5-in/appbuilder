sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sapui5in/appbuilder/modules/Project/Project",
    "sapui5in/appbuilder/modules/designer/Designer",
    "sapui5in/appbuilder/modules/MetadataSelector/UpdateBlock",
    "sapui5in/appbuilder/modules/MetadataSelector/AggregationSelector",
    "sapui5in/appbuilder/modules/MetadataSelector/MetadataSelector"
], function (Controller, Project, Designer, UpdateBlock, AggregationSelector, MetadataSelector) {
    "use strict";

    return Controller.extend("sapui5in.appbuilder.controller.AppDesigner", {

        onInit: function () {
            var _self = this;
            this.getOwnerComponent().getRouter().getRoute("appDesigner").attachPatternMatched(this._onRouteMatched, this);

            this._oUpdateBlock = new UpdateBlock();
            this._oAggregationSelector = new AggregationSelector();
            this._oMetadataSelector = new MetadataSelector();
            this._oDesigner = new Designer({
                containerId: this.getView().byId("idAppBuilderLayout").getId() + "--preview"
            });
            this._oProject = new Project();

            //Render
            this.getView().byId("idAppBuilderLayout").addProjectContainerItem(this._oProject.getTreeContainer());
            this.getView().byId("idAppBuilderLayout").addUpdateBlockSection(this._oUpdateBlock.getUBContainer());
            this.getView().byId("idAppBuilderLayout").addAggregationSelectionSection(this._oAggregationSelector.getASContainer());
            this.getView().byId("idAppBuilderLayout").addMetadataSection(this._oMetadataSelector.getMSContainer());

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("appBuilder", "navigation", this.navigate, this);
        },

        navigate: function () {
            this.getView().byId("idAppBuilderLayout").setShowRightSidebar(true);
            this.getView().byId("idAppBuilderLayout").setRightSidebarKey(arguments[2].type);
        },

        _onRouteMatched: function (ioEvent) {

        },

        onPressLogout: function () {
            console.log("Logout Pressed");
            window.location.replace(window.location.origin + "/auth/logout");
        }
    });
});