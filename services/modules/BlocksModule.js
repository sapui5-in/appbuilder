const express = require('express');
const app = express();

require('../config/connection');
const Blocks = require('../models/Blocks');

module.exports = {
		create: function(ioBlock, fnReturn) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioBlock);

			Blocks.findOne(loQueryObject, function(ioErr, ioData) {
				if (ioErr) {	//Connection Error
					roReturn = {
							messages: [{
								code: "E",
								message: ioErr
							}],
							status: 400,
							data: {}
					};
					fnReturn(roReturn);
				} else if (ioData) {	//Block Name Exists
					roReturn = {
							messages: [{
								code: "E",
								message: "Please select a different Block Name"
							}],
							status: 300,
							data: {}
					};
					fnReturn(roReturn);
				} else {	//Create new Block
					Blocks(ioBlock).save(function(ioBlocksError, ioBlocksData) {
						if (ioBlocksError) {
							roReturn = {
									messages: [{
										code: "E",
										message: "Error in Block creation."
									}],
									status: 400,
									data: {}
							};
							fnReturn(roReturn);
						} else {
							roReturn = {
									messages: [{
										code: "S",
										message: "New Block Created"
									}],
									status: 200,
									data: ioBlocksData
							};
							fnReturn(roReturn);
						}
					});
				}
			});
		},

		list: function(ioBlock, fnReturn) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioBlock);

			Blocks.find(loQueryObject, function(ioErr, iaData) {
				if (ioErr) {	//Connection Error
					roReturn = {
							messages: [{
								code: "E",
								message: ioErr
							}],
							status: 400,
							data: {}
					};
					fnReturn(roReturn);
				} else {
					roReturn = {
							messages: [{
								code: "S",
								message: ""
							}],
							status: 200,
							data: iaData
					};
					fnReturn(roReturn);
				}
			});
		},

		getBlocks: function(ioBlock, fnReturn) {
			this.list(ioBlock, fnReturn);
		},

		update: function(ioBlock, fnReturn, ioNewObject) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioBlock);

			if (ioBlock._id) {
				var loQueryObject = this.getQueryObject(ioBlock);

				Blocks.findOne(loQueryObject, function(ioErr, ioData) {
					if (ioErr) {	//Connection Error
						roReturn = {
								messages: [{
									code: "E",
									message: ioErr
								}],
								status: 400,
								data: {}
						};
						fnReturn(roReturn);
					} else {	//Update the Block
						if (ioData._id) {
							ioData.name = ioNewObject.name;
							ioData.code = ioNewObject.code;
							ioData.userOid = ioNewObject.userOid;

							ioData.save(function(ioBlocksError, ioBlocksData) {
								if (ioBlocksError) {
									roReturn = {
											messages: [{
												code: "E",
												message: ioBlocksError
											}],
											status: 400,
											data: {}
									};
									fnReturn(roReturn);
								} else {
									roReturn = {
											messages: [{
												code: "S",
												message: "The Block has been Updated"
											}],
											status: 200,
											data: ioBlocksData
									};
									fnReturn(roReturn);
								}
							});
						} else {
							roReturn = {
									messages: [{
										code: "E",
										message: "No Block exists with the selected id"
									}],
									status: 300,
									data: {}
							};
							fnReturn(roReturn);
						}
					}
				});
			} else {
				roReturn = {
						messages: [{
							code: "E",
							message: "Please select a Block id to Update"
						}],
						status: 400,
						data: {}
				};
				fnReturn(roReturn);
			}
		},

		deleteBlock: function(ioBlock, fnReturn) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioBlock);

			Blocks.findOne(loQueryObject, function(ioErr, ioData) {
				if (ioErr) {	//Connection Error
					roReturn = {
							messages: [{
								code: "E",
								message: ioErr
							}],
							status: 400,
							data: {}
					};
					fnReturn(roReturn);
				} else {	//Delete the Block
					if (ioData && ioData._id) {
						Blocks.remove(loQueryObject, function(ioBlocksError, ioBlocksData) {
							if (ioBlocksError) {
								roReturn = {
										messages: [{
											code: "E",
											message: ioBlocksError
										}],
										status: 400,
										data: {}
								};
								fnReturn(roReturn);
							} else {
								roReturn = {
										messages: [{
											code: "S",
											message: "The Block has been Deleted"
										}],
										status: 200,
										data: ioBlocksData
								};
								fnReturn(roReturn);
							}
						});
					} else {
						roReturn = {
								messages: [{
									code: "E",
									message: "No Block exists with the selected id"
								}],
								status: 300,
								data: {}
						};
						fnReturn(roReturn);
					}
				}
			});
		},

		getQueryObject: function(ioBlock) {
			var roQueryObject = {};

			if (ioBlock._id) {
				roQueryObject._id = ioBlock._id;
			}
			if (ioBlock.name) {
				roQueryObject.name = ioBlock.name;
			}
			if (ioBlock.projectOid) {
				roQueryObject.projectOid = ioBlock.projectOid;
			}
			if (ioBlock.userOid) {
				roQueryObject.userOid = ioBlock.userOid;
			}
			if (ioBlock.type) {
				roQueryObject.type = ioBlock.type;
			}
			if (ioBlock.isDesignerBlock) {
				roQueryObject.isDesignerBlock = ioBlock.isDesignerBlock;
			}

			return roQueryObject;
		}
};