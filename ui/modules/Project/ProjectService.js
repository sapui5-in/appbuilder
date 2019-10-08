sap.ui.define([
        "sapui5in/appbuilder/modules/Ajax"
    ],
    function (Ajax) {
        "use strict";

        return {

            update: function (loContext, fnResolve) {
                var loContext = ioEvent.getSource().getBindingContext("projectModel").getObject();
                var laBlocks = [];

                laBlocks = laBlocks.concat(loContext.nodes[0].nodes).concat(loContext.nodes[1].nodes);

                var loProject = {
                    _id: loContext._id,
                    name: loContext.name,
                    namespace: loContext.namespace,
                    blocks: laBlocks
                };

                var loParams = {
                    type: "POST",
                    url: "/projects/update",
                    data: loProject,
                    fnSuccess: fnResolve()
                };
                Ajax.call(loParams);
            }
        };
    }, /* bExport= */ true);