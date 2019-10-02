sap.ui.define(["jquery.sap.global",
        "sapui5in/appbuilder/modules/BaseModule",
        "sapui5in/appbuilder/modules/ControlMetadata",
        "sapui5in/appbuilder/modules/MetadataSelector/IconSelection",
        "sapui5in/appbuilder/modules/Project/Formatter"
    ],
    function (jQuery, BaseModule, ControlMetadata, IconSelection, Formatter) {
        "use strict";

        var MetadataSelector = BaseModule.extend("sapui5in.appbuilder.modules.MetadataSelector.MetadataSelector", {

            formatter: Formatter,

            init: function () {
                this._MSContainer = sap.ui.xmlfragment("AppDesigner", "sapui5in.appbuilder.modules.MetadataSelector.fragments.MetadataSelector", this);
                this._MSContainer.setModel(new sap.ui.model.json.JSONModel(), "msModel");

                // Subscribe to an Event here
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.subscribe("ms", "renderMetadata", this.renderMetadata, this);
            },

            getMSContainer: function () {
                return this._MSContainer;
            },


            getModel: function () {
                return this._MSContainer.getModel("msModel");
            },

            renderMetadata: function () {
                var ioControl = arguments[2];
                var loControlMetadata = ControlMetadata.getMetadata(ioControl.name);
                this.getModel().setProperty("/controlMetadata", loControlMetadata);

                if (!ioControl.selections) {
                    ioControl.selections = {};
                }

                //Select the Selected Properties, Aggregations and Events
                this.addSelectedKeyInTable("idControlProperties", ioControl.selections.properties, loControlMetadata.properties);
                this.addSelectedKeyInTable("idControlAggregations", ioControl.nodes, loControlMetadata.aggregations);
                this.addSelectedKeyInTable("idControlEvents", ioControl.selections.events, loControlMetadata.events);
                if (ioControl.selections && ioControl.selections.properties
                    && ioControl.selections.properties.styleClass && ioControl.selections.properties.styleClass.value) {
                    sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue(ioControl.selections.properties.styleClass.value);
                } else {
                    sap.ui.core.Fragment.byId("AppDesigner", "idControlStyleClass").setValue();
                }

                this.getModel().refresh();
            },

            addSelectedKeyInTable: function (isTableId, iaSelections, iaMetadata) {
                var loTable = sap.ui.core.Fragment.byId("AppDesigner", isTableId);
                loTable.setSelectedIndex(-1);

                if (isTableId === "idControlAggregations") {
                    if (iaSelections && iaMetadata) {
                        for (var i = 0; i < iaMetadata.length; i++) {
                            for (var j = 0; j < iaSelections.length; j++) {
                                if (iaSelections[j].name === iaMetadata[i].name) {
                                    loTable.getContextByIndex(i).getObject().rowSelected = true;
                                    loTable.addSelectionInterval(i, i);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    if (iaSelections && iaMetadata) {
                        for (i = 0; i < iaMetadata.length; i++) {
                            for (j = 0; j < Object.keys(iaSelections).length; j++) {
                                if (Object.keys(iaSelections)[j] === iaMetadata[i].name) {
                                    loTable.addSelectionInterval(i, i);
                                    loTable.getContextByIndex(i).getObject().rowSelected = true;
                                    if (iaSelections[iaMetadata[i].name].fixedValue) {
                                        loTable.getContextByIndex(i).getObject().value = iaSelections[iaMetadata[i].name].value;
                                        loTable.getContextByIndex(i).getObject().fixedValue = iaSelections[iaMetadata[i].name].fixedValue;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            },

            onSelectPropertyRow: function (ioEvent) {
                this.triggerPropertyChange(ioEvent.getSource().getBindingContext("msModel").getObject());
            },

            onChangeValueProperty: function (ioEvent) {
                ioEvent.getSource().getBindingContext("msModel").getObject().fixedValue = true;
                this.triggerPropertyChange(ioEvent.getSource().getBindingContext("msModel").getObject());
            },

            // Boolean
            onSelectCBValueProperty: function (ioEvent) {
                var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
                loSelectedContext.fixedValue = true;
                loSelectedContext.value = ioEvent.getSource().getSelected();
                this.triggerPropertyChange(loSelectedContext);
            },

            // Set of Values
            onSelectionChangeValueProperty: function (ioEvent) {
                ioEvent.getSource().getBindingContext("msModel").getObject().fixedValue = true;
                this.triggerPropertyChange(ioEvent.getSource().getBindingContext("msModel").getObject());
            },

            //ToDo - to move it to Metadata Selector
            onValueHelpRequest: function (ioEvent) {
                var _self = this;
                var loEvent = ioEvent;
                if (!this._oIconSelection) {
                    this._oIconSelection = new IconSelection({
                        iconSelectFromDialog: function (ioEvent) {
                            // _self.triggerPropertyChange(ioEvent.mParameters.fixedValue);
                            _self.onChangeValueProperty(ioEvent.mParameters);
                        }
                    });
                }

                this._oIconSelection.open(ioEvent);
            },

            // To set a Fixed value
            onPressIconFixedValue: function (ioEvent) {
                var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
                loSelectedContext.fixedValue = !loSelectedContext.fixedValue;
                this.triggerPropertyChange(loSelectedContext);
            },

            //Trigger the property Change event and publish the Event
            triggerPropertyChange: function (ioSelectedContext) {
                var loProperty = {
                    name: ioSelectedContext.name,
                    rowSelected: ioSelectedContext.rowSelected,
                    fixedValue: ioSelectedContext.fixedValue,
                    value: ioSelectedContext.value
                };
                this.getModel().refresh();

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("ms", "propertyChanged", loProperty);
            },

            onRowSelectionChangeControlAggregations: function (ioEvent) {
                var loRowContextObj = ioEvent.getSource().getBindingContext("msModel").getObject();

                var loSelectedNode = {
                    name: loRowContextObj.name,
                    rowSelected: loRowContextObj.rowSelected,
                    label: loRowContextObj.label,
                    type: "Aggregation",
                    aggregationType: "Manual",
                    multiple: loRowContextObj.multiple,
                    bindable: loRowContextObj.bindable
                };

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("ms", "aggregationChanged", loSelectedNode);
            },

            onRowSelectionChangeControlEvents: function (ioEvent) {
                var loSelectedContext = ioEvent.getSource().getBindingContext("msModel").getObject();
                var loEventNode = {
                    name: loSelectedContext.name,
                    rowSelected: loSelectedContext.rowSelected
                };

                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("ms", "eventChanged", loEventNode);
            }
        });

        return MetadataSelector;
    }, /* bExport= */ true);