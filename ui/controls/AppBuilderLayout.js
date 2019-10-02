sap.ui.define(["sap/ui/core/XMLComposite"], function (XMLComposite) {
    var AppBuilderLayout = XMLComposite.extend("sapui5in.appbuilder.controls.AppBuilderLayout", {
        metadata: {
            properties: {
                pageTitle: {type: "string", defaultValue: "App Designer"},
                previewSectionTitle: {type: "string", defaultValue: "Designer Live Preview"},
                userName: {type: "string", defaultValue: "SAPUI5.in"},
                showLeftSidebar: {type: "boolean", defaultValue: true},
                showRightSidebar: {type: "boolean", defaultValue: true},
                rightSidebarKey: {type: "string", defaultValue: ""}
            },
            aggregations: {
                projectContainerItems: {
                    type: "sap.ui.core.Control", multiple: true, forwarding: {
                        idSuffix: "--projectHierarchyContainer",
                        aggregation: "items"
                    }
                },
                updateBlockSection: {
                    type: "sap.ui.core.Control", multiple: true, forwarding: {
                        idSuffix: "--updateBlockSection",
                        aggregation: "content"
                    }
                },
                aggregationSelectionSection: {
                    type: "sap.ui.core.Control", multiple: true, forwarding: {
                        idSuffix: "--aggregationSelector",
                        aggregation: "content"
                    }
                },
                metadataSection: {
                    type: "sap.ui.core.Control", multiple: true, forwarding: {
                        idSuffix: "--metadataSelector",
                        aggregation: "content"
                    }
                }
            },
            events: {
                logout: {}
            }
        },

        toggleLeftSidebar: function () {
            this.setShowLeftSidebar(!this.getShowLeftSidebar());
        },

        toggleRightSidebar: function () {
            this.setShowRightSidebar(!this.getShowRightSidebar());
            this.rerender();
        },

        onPressLogout: function () {
            this.fireEvent("logout", {});
        },

        onSelectionChangeSBLivePreview: function (ioEvent) {
            this.byId("preview").getParent().to(this.byId(ioEvent.getSource().getSelectedKey()).getId());
        }
    });

    return AppBuilderLayout;
}, true);