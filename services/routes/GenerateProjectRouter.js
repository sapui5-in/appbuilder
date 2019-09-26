const express = require('express');
const app = express();

var bodyParser = require('body-parser');
var Beautify = require("js-beautify");

const GenerateProject = require("../modules/generate/GenerateProject");
const GenerateProjectFiles = require("../modules/generate/GenerateProjectFiles");

var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

var router = express.Router();

/* POST Block. */
router.post('/create', urlencodedParser, function(req, res, next) {
	res.set('Content-Type', 'text/html');
	var loGeneratedCode = GenerateProject.getCode(JSON.parse(req.body.project));
	
	GenerateProjectFiles.generate({
		projectName: JSON.parse(req.body.project).projectName,
		generatedCode: loGeneratedCode
	});

	res.send(loGeneratedCode);
});

router.get('/get/:id', urlencodedParser, function(req, res, next) {

	var loGeneratedCode = Project.getCode(req.body);

	if (req.params.id === "manifest") {
		res.set('Content-Type', 'text/json');
		var loManifest = loGeneratedCode.manifest;
		res.send(loManifest);
	} else if (req.params.id === "controller") {
		res.set('Content-Type', 'text/javascript');
		var lsController = loGeneratedCode.controller.join("");
		res.send(Beautify.js_beautify(lsController, { indent_size: 4 }));
	} else if (req.params.id === "i18n") {
		res.set('Content-Type', 'text/json');
		var lsI18n = loGeneratedCode.i18n.join("\n");
		res.send(lsI18n);
	} else if (req.params.id === "component") {
		res.set('Content-Type', 'text/javascript');
		var lsComponent = loGeneratedCode.component.join("");
		res.send(Beautify.js_beautify(lsComponent, { indent_size: 4 }));
	} else {

	}
});

module.exports = router;