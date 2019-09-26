const express = require('express');
const app = express();
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

var router = express.Router();
const Blocks = require('../models/Blocks');
const BlocksModule = require("../modules/BlocksModule");

/* GET Blocks. */
router.get('/list', function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};

	BlocksModule.list({
		userOid: req.user._id
	}, fnReturn);
});

/* GET Blocks. */
router.get('/getBlocks/:projectOid/', function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	var loQuery = {
			userOid: req.user._id,
			projectOid: req.params.projectOid,
			type: "Block"
	};
	BlocksModule.getBlocks(loQuery, fnReturn);
});

/* GET Blocks List. */
router.post('/getDesignerBlocklist', function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	var loQuery = {
			isDesignerBlock: true,
			type: "Block"
	};
	BlocksModule.getBlocks(loQuery, fnReturn);
});

/* POST Block. */
router.post('/create', urlencodedParser, function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	req.body.userOid = req.user._id;
	BlocksModule.create(req.body, fnReturn);
});

/* PUT Block. */
router.put('/update/:blockOid', urlencodedParser, function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	var loQuery = {
			_id: req.params.blockOid
	};
	var loNewOb = {
			userOid: req.user._id,
			name: req.body.name,
			code: req.body.code
	};

	BlocksModule.update(loQuery, fnReturn, loNewOb);
});

//DELETE Block
router.delete("/delete/:blockOid", function(req, res) {
	var fnReturn = function(ioReturn) {
		res.status(ioReturn.status).send(ioReturn);
	};
	var loQuery = {
			_id: req.params.blockOid,
			userOid: req.user._id
	};

	BlocksModule.deleteBlock(loQuery, fnReturn);
});

module.exports = router;
