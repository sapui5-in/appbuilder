const express = require('express');
const app = express();

var bodyParser = require('body-parser');
require('../config/connection');

var urlencodedParser = bodyParser.urlencoded({
	extended: true
});

var router = express.Router();
const Projects = require('../models/Projects');/* GET Blocks. */
const Blocks = require('../models/Blocks');
const ProjectsModule = require("../modules/ProjectsModule");

/* POST Project. */
router.post('/create', urlencodedParser, function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	req.body.userOid = req.user._id;
	ProjectsModule.create(req.body, fnReturn);
});

/* POST Project. */
router.post('/update', urlencodedParser, function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};

	var loQuery = {
			_id: {
				$ne: req.body._id
			},
			userOid: req.body.userOid,
			name: req.body.name
	};

	var loNewOb = {
			userOid: req.user._id,
			name: req.body.name,
			namespace: req.body.namespace
	};

	ProjectsModule.update(loQuery, fnReturn, loNewOb);
});

/* GET Projects. */
router.get('/list', function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	ProjectsModule.list({
		userOid: req.user._id
	}, fnReturn);
});

/* GET Projects. */
router.get('/getProject/:projectOid', function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};

	var loQuery = {
			_id: req.params.projectOid,
			userOid: req.user._id,
	};
	ProjectsModule.list(loQuery, fnReturn);
});

router.delete("/delete/:projectOid", function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	var loQuery = {
			_id: req.params.projectOid,
			userOid: req.user._id
	};

	ProjectsModule.deleteProject(loQuery, fnReturn);
});

module.exports = router;
