/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sapui5in/appbuilder/modules/BaseModule"],
		function(jQuery, BaseModule) {
	"use strict";
	/**
	 * Class to enable Control Selection
	 * 
	 * @class Class to enable Control Selection
	 * @param {object} mProperties
	 *
	 * @author SAPUI5.in
	 * @version 1.0
	 * 
	 * @constructor
	 * @public
	 * @extends sapui5in.appbuilder.modules.BaseModule
	 * @name sapui5in.appbuilder.modules.BlockHierarchy
	 * 
	 */
	var BlockHierarchy = BaseModule.extend("sapui5in.appbuilder.modules.BlockHierarchy", {
		metadata: {
			properties: {

				/**
				 * text
				 */
				containerId: {
					type: "string",
					group: "Misc"
				}
			},
			events: {
				itemPress: {}
			}
		},

		init: function() {
			var _self = this;
			var loModel = new sap.ui.model.json.JSONModel();

			this._oTree = new sap.m.Tree({
				mode: "SingleSelectMaster",
				includeItemInSelection: true,
				items: {
					path:'blockHierarchyModel>/blockHierarchy',
					parameters: {
						arrayNames:['nodes']
					},
					template: new sap.m.CustomTreeItem({
						type: "Active",
						content: [new sap.m.VBox({
							items: [new sap.m.ObjectIdentifier({
								title: "{blockHierarchyModel>elementName}",
								text: "{blockHierarchyModel>id}"
							}).addStyleClass("blockHierarchyTreeItemText")]
						})]
					}).addStyleClass("blockHierarchyTreeItem")
				},
				itemPress: function(ioEvent) {
					_self.onItemPress(ioEvent);
				}
			});
			this._oTree.setModel(loModel, "blockHierarchyModel");
		},

		onItemPress: function(ioEvent) {
			if (ioEvent.getParameter("listItem")) {
				var loSelectedItemContext = ioEvent.getParameter("listItem").getBindingContext("blockHierarchyModel").getObject();
				this.fireItemPress(loSelectedItemContext);
			}
		},

		getHierarchyTree: function() {
			return this._oTree;
		},

		getHierachy: function(ioContainerDOM) {
			var raHierarchy = [];
			this.getHierachyRecursive(ioContainerDOM, raHierarchy);

			return raHierarchy;
		},

		getHierachyRecursive: function(ioContainerDOM, iaHierarchy) {
			var loNode = {};
			var loTemp = {};
			if (sap.ui.getCore().byId(ioContainerDOM.id)) {
				loNode = {
						id: ioContainerDOM.id,
						elementName: sap.ui.getCore().byId(ioContainerDOM.id).getMetadata().getElementName(),
						DOM: ioContainerDOM,
						nodes: []
				}
				for (var i=0;i<ioContainerDOM.children.length;i++) {
					loTemp = this.getHierachyRecursive(ioContainerDOM.children[i], loNode.nodes);
					if (loTemp && loTemp.length) {
						loNode.nodes.push(loTemp);
					}
				}
				iaHierarchy.push(loNode);
			} else {
				if (ioContainerDOM.children) {
					for (var i=0;i<ioContainerDOM.children.length;i++) {
						loTemp = this.getHierachyRecursive(ioContainerDOM.children[i], iaHierarchy);
						if (loTemp && loTemp.length) {
							iaHierarchy.nodes.push(loTemp);
						}
					}
				}
			}
		},

		clickUI5Control: function(isId) {
			var loSelectedUI5DOMControl = sap.ui.getCore().byId(isId);
			var lsId = loSelectedUI5DOMControl.data("id");
			this.fireClickControl({
				id: lsId
			});
		}
	});

	return BlockHierarchy;
}, /* bExport= */ true);