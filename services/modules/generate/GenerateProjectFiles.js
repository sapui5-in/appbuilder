var fs = require('fs');

module.exports = {

		generate: function(ioProject) {			
			var lsPath = "services/modules/generate/tmp/";
			var lsPath = lsPath + "/" + ioProject.projectName + "/";

			if (!fs.existsSync(lsPath)) {
				fs.mkdirSync(lsPath);
			}
			
			dir = lsPath + 'controller';

			if (!fs.existsSync(dir)) {
				fs.mkdir(dir, function() {
					//Controllers
					for (var i=0;i<ioProject.generatedCode.controllers.length;i++) {
						fs.writeFile(dir + "/" + ioProject.generatedCode.controllers[i].viewName + ".controller.js", ioProject.generatedCode.controllers[i].code.join(""), function (err) {
							if (err) throw err;
						});
					}
				});
			} else {
				//Controllers
				for (var i=0;i<ioProject.generatedCode.controllers.length;i++) {
					fs.writeFile(dir + "/" + ioProject.generatedCode.controllers[i].viewName + ".controller.js", ioProject.generatedCode.controllers[i].code.join(""), function (err) {
						if (err) throw err;
					});
				}
			}

			dir = lsPath + 'view';

			if (!fs.existsSync(dir)) {
				fs.mkdir(dir, function() {
					//Views
					for (var i=0;i<ioProject.generatedCode.views.length;i++) {
						fs.writeFile(dir + "/" + ioProject.generatedCode.views[i].viewName + ".view.xml", ioProject.generatedCode.views[i].xml, function (err) {
							if (err) throw err;
						});
					}
				});
			} else {
				//Views
				for (var i=0;i<ioProject.generatedCode.views.length;i++) {
					fs.writeFile(dir + "/" + ioProject.generatedCode.views[i].viewName + ".view.xml", ioProject.generatedCode.views[i].xml, function (err) {
						if (err) throw err;
					});
				}
			}

			//Manifest
			fs.writeFile(lsPath + "manifest" + ".json", JSON.stringify(ioProject.generatedCode.manifest), function (err) {
				if (err) throw err;
			});

			//Component
			fs.writeFile(lsPath + "Component" + ".js", ioProject.generatedCode.component.join(""), function (err) {
				if (err) throw err;
			});
		},
};