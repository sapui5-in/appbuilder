var CB = {
		"Type": "sap.m.ComboBox",
		"customData": [{
			"Type": "sap.ui.core.CustomData",
			"customData": [{
				"Type": "sap.ui.core.CustomData",
				"key": "id",
				"value": "id2"
			}],
			"key": "{appModel>/data/customData/0/key}",
			"value": "{appModel>/data/customData/0/value}"
		}],
		"enabled": "{appModel>/data/enabled}",
		"valueState": "{appModel>/data/valueState}",
		"name": "{appModel>/data/name}",
		"dependents": [{
			"Type": "sap.m.Button",
			"customData": [],
			"text": "{appModel>/data/dependents/0/text}",
			"type": "{appModel>/data/dependents/0/type}",
			"icon": "{appModel>/data/dependents/0/icon}"
		}, {
			"Type": "sap.m.Button",
			"customData": [{
				"Type": "sap.ui.core.CustomData",
				"customData": [{
					"Type": "sap.ui.core.CustomData",
					"key": "id",
					"value": "id5"
				}],
				"key": "key3",
				"value": "value4"
			}, {
				"Type": "sap.ui.core.CustomData",
				"customData": [{
					"Type": "sap.ui.core.CustomData",
					"key": "id",
					"value": "id6"
				}],
				"key": "key4",
				"value": "key4",
				"dependents": [{
					"Type": "sap.m.Button",
					"customData": [{
						"Type": "sap.ui.core.CustomData",
						"key": "id",
						"value": "id7"
					}],
					"text": "{appModel>/data/dependents/1/customData/1/dependents/0/text}",
					"type": "{appModel>/data/dependents/1/customData/1/dependents/0/type}",
					"width": "{appModel>/data/dependents/1/customData/1/dependents/0/width}",
					"icon": "{appModel>/data/dependents/1/customData/1/dependents/0/icon}"
				}]
			}],
			"visible": "{appModel>/data/dependents/1/visible}",
			"text": "{appModel>/data/dependents/1/text}"
		}],
		"items": {
			"path": "appModel>/data/items",
			"template": {
				"Type": "sap.ui.core.Item",
				"customData": [{
					"Type": "sap.ui.core.CustomData",
					"customData": [{
						"Type": "sap.ui.core.CustomData",
						"key": "id",
						"value": "id9"
					}],
					"key": "kei1",
					"value": "value1"
				}, {
					"Type": "sap.ui.core.CustomData",
					"customData": [{
						"Type": "sap.ui.core.CustomData",
						"key": "id",
						"value": "id10"
					}],
					"key": "key2",
					"value": "value2"
				}],
				"text": "{appModel>text}"
			}
		}
};