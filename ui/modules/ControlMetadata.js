sap.ui.define([
    "sap/ui/Device"
], function (Device) {
    "use strict";

    var ControlMetadata = {
        getMetadata: function (isControlKey) {
            var loControl = eval("new " + isControlKey + "()");
            var roControlMetadata = {
                properties: this.getProps(loControl),
                aggregations: this.getControlAggregations(loControl),
                events: this.getControlEvents(loControl)
            };
            loControl.destroy();

            return roControlMetadata;
        },

        getProps: function (ioControl) {
            var raProperties = [];
            var loNode = {};
            if (ioControl) {
                var loProperties = ioControl.getMetadata().getAllProperties();
                for (var key in loProperties) {
                    loNode = loProperties[key];
                    loNode.name = loProperties[key].name;
                    loNode.deprecated = loProperties[key].deprecated;
                    loNode.label = loProperties[key].name;
                    loNode.value = loProperties[key].defaultValue;
                    loNode.fixedValue = false;
                    loNode.metadataType = "property";
                    loNode.show = false;
                    loNode.rowSelected = false;
                    raProperties.push(loNode);

                    try {
                        var laInvalidProps = ["sap.ui.core.CSSSize", "sap.ui.core.URI"];
                        var loType = eval(loNode.type);
                        if (typeof loType === "object" && Object.keys(loType) && Object.keys(loType).length && laInvalidProps.indexOf(loNode.type) ===
                            -1) {
                            loNode.show = true;
                            loNode.probableValues = [];
                            for (var val in Object.keys(loType)) {
                                loNode.probableValues.push({
                                    key: Object.keys(loType)[val],
                                    text: Object.keys(loType)[val]
                                });
                            }
                        }
                    } catch (err) {

                    }
                }
            }

            return raProperties;
        },

        getControlAggregations: function (ioControl) {
            var raAggregations = [];
            if (ioControl) {
                var loAggregations = ioControl.getMetadata().getAllAggregations();
                for (var key in loAggregations) {
                    if (!loAggregations[key].deprecated) {						//Exclude Deprecated Aggregations
                        loAggregations[key].label = loAggregations[key].name;
                        loAggregations[key].rowSelected = false;
                        raAggregations.push(loAggregations[key]);
                        loAggregations[key].defaultAggregation = ioControl.getMetadata().getDefaultAggregationName() === key ? true : false;
                    }
                }
            }

            return raAggregations;
        },

        getControlEvents: function (ioControl) {
            var raEvents = [];
            var loNode = {};
            if (ioControl) {
                var loEvents = ioControl.getMetadata().getAllEvents();
                for (var key in loEvents) {
                    if (!loEvents[key].deprecated) {
                        loNode = loEvents[key];
                        loNode.label = loNode.name;
                        loNode.rowSelected = false;
                        raEvents.push(loNode);
                    }
                }
            }

            return raEvents;
        }
    };

    return ControlMetadata;
});