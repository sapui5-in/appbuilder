sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule",
        "sapui5in/appbuilder/modules/ControlMetadata",
        "sapui5in/appbuilder/modules/Project/Formatter"
    ],
    function (jQuery, BaseModule, ControlMetadata, Formatter) {
        "use strict";

        var AggregationSelector = BaseModule.extend("sapui5in.appbuilder.modules.MetadataSelector.AggregationSelector", {

            formatter: Formatter,

            init: function () {
                this._ASContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.AggregationSelector", this);
                this._ASContainer.setModel(new sap.ui.model.json.JSONModel(), "msModel");
                this.getModel().setSizeLimit(10000);

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("aggregationSelector", "populateAggregationList", this.populateAggregationList, this);
            },

            getASContainer: function () {
                return this._ASContainer;
            },


            getModel: function () {
                return this._ASContainer.getModel("msModel");
            },

            populateAggregationList: function (iaAllControlList, isControlName, isAggregationName) {
                var laAggregationControlsList = [];
                var laAllControlList = arguments[2].allControlList;

                for (var i = 0; i < laAllControlList.length; i++) {
                    if (this.isValidAggregation(arguments[2].controlName, arguments[2].aggregationName, laAllControlList[i].key)) {
                        laAggregationControlsList.push(laAllControlList[i]);
                    }
                }

                // Need to Add Support for Singular Aggregation type
                // ToDo
                this.getModel().setProperty("/", {
                    templateControls: laAggregationControlsList,
                    manualControls: laAggregationControlsList,
                    aggregationType: arguments[2].aggregationType,
                    selectedAggregationItem: arguments[2].selectedAggregationItem,
                    multiple: arguments[2].multiple
                });
            },

            onPressAddControlInAggregation: function (ioEvent) {
                var oModelData = this.getModel().getData();
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("project", "addControlInAggregation", {
                    aggregationType: oModelData.aggregationType,
                    control: oModelData.selectedAggregationItem
                });
            },

            onSelectionChangeAggregationType: function (ioEvent) {
                this.getModel().setProperty("/selectedAggregationItem", "");

                var oModelData = this.getModel().getData();
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("project", "changeAggregationType", {
                    aggregationType: oModelData.aggregationType
                });
            }
        });

        return AggregationSelector;
    }, /* bExport= */ true);