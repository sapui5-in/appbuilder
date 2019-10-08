sap.ui.define([
        "sapui5in/appbuilder/modules/Ajax"
    ],
    function (Ajax) {
        "use strict";

        return {

            changeBlockName: function (ioBlock, isBlockName) {
                if (isBlockName) {
                    ioBlock.name = isBlockName;
                }

                return ioBlock;
            },

            changeRootControl: function (ioBlock, isControlName, iaControlList) {
                if (ioBlock && isControlName) {
                    ioBlock.nodes = [];
                    ioBlock.nodes.push(iaControlList);
                }

                return ioBlock;
            },

            changeProperty: function (ioBlock, ioProperty) {
                var loProperty = ioProperty;

                if (loProperty.rowSelected) {
                    var loTempProp = {
                        fixedValue: loProperty.fixedValue,
                        value: loProperty.value
                    };

                    if (!ioBlock.selections.properties) {
                        ioBlock.selections.properties = {};
                    }
                    ioBlock.selections.properties[loProperty.name] = loTempProp;
                } else {
                    if (ioBlock.selections.properties
                        && ioBlock.selections.properties[loProperty.name]) {
                        delete (ioBlock.selections.properties[loProperty.name]);
                    }
                }

                return ioBlock;
            },

            changeAggregation: function (ioBlock, ioAggregation) {
                var loAggregation = ioAggregation;

                if (loAggregation.rowSelected) {
                    delete (loAggregation.rowSelected);

                    if (!ioBlock.nodes) {
                        ioBlock.nodes = [];
                    }
                    ioBlock.nodes.push(loAggregation);
                } else {
                    if (ioBlock.nodes) {
                        for (var i = 0; i < ioBlock.nodes.length; i++) {
                            if (ioBlock.nodes[i].name === loAggregation.name) {
                                ioBlock.nodes.splice(i, 1);
                                break;
                            }
                        }
                    }
                }

                return ioBlock;
            },

            changeEvent: function (ioBlock, ioEvent) {
                var loEventNode = ioEvent;

                if (loEventNode.rowSelected) {
                    delete (loEventNode.rowSelected);

                    if (!ioBlock.selections.events) {
                        ioBlock.selections.events = {};
                    }
                    ioBlock.selections.events[loEventNode.name] = {};
                } else {
                    if (ioBlock.selections.events
                        && ioBlock.selections.events[loEventNode.name]) {
                        delete (ioBlock.selections.events[loEventNode.name]);
                    }
                }

                return ioBlock;
            },

            changeStyleClass: function (ioBlock, ioStyleClass) {
                if (!ioBlock.selections.properties) {
                    ioBlock.selections.properties = {};
                }
                ioBlock.selections.properties["styleClass"] = {
                    value: ioStyleClass.styleClass,
                    fixedValue: true
                };

                return ioBlock;
            },

            changeAggregationType: function () {
                ioBlock.aggregationType = arguments[2].aggregationType;
                ioBlock.nodes = [];

                return ioBlock;
            },

            addControlInAggregation: function () {
                var lsAggregationNodePath = this.getSelectedItemContext().getPath();
                var laTemp = lsAggregationNodePath.split("/");
                laTemp.pop();
                laTemp.pop();
                var lsControlPath = laTemp.join("/");
                var loControlNode = this.getProjectModel().getProperty(lsControlPath);

                if (arguments[2].aggregationType === "Templates") {
                    this.oBlock.addControlToAggregation(lsAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(arguments[2].control));
                } else {
                    if (!ioBlock.multiple && loControlNode.nodes && loControlNode.nodes.length === 1) {
                        sap.m.MessageToast.show("Cannot add Multiple Controls to Single Aggregation Type");
                    } else {
                        this.oBlock.addControlToAggregation(lsAggregationNodePath, this.getProjectModel(), this.oBlock.getNewControlNode(arguments[2].control));
                    }
                }

                return ioBlock;
            }
        };
    }, /* bExport= */ true);