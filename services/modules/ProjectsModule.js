require('../config/connection');

const Projects = require('../models/Projects');
const Blocks = require('../models/Blocks');
const BlocksModule = require('../modules/BlocksModule');

module.exports = {
		create: function(ioProject, fnReturn) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioProject);

			Projects.findOne(loQueryObject, function(ioErr, ioData) {
				if (ioErr) {	//Connection Error
					roReturn = {
							messages: [{
								code: "E",
								message: "Connection Error!"
							}],
							status: 400,
							data: {}
					};
					fnReturn(roReturn);
				} else if (ioData) {	//Project Name Exists
					roReturn = {
							messages: [{
								code: "E",
								message: "Please select a different Project Name"
							}],
							status: 301,
							data: {}
					};
					fnReturn(roReturn);
				} else {	//Create new Project
					Projects(ioProject).save(function(ioProjCreateErr, ioProjCreateData) {
						if (ioProjCreateErr) {
							roReturn = {
									messages: [{
										code: "E",
										message: "Error in Project creation"
									}],
									status: 400,
									data: {}
							};
							fnReturn(roReturn);
						} else {
							if (ioProject.view) {
								var fnBlockReturn = function(ioBlockReturn) {
									fnReturn(ioBlockReturn);
								};
								var loBlock = ioProject.view;
								loBlock.type = "View";
								loBlock.projectOid = ioProjCreateData._id;
								loBlock.userOid = ioProjCreateData.userOid;

								BlocksModule.create(loBlock, fnBlockReturn);
							} else {
								roReturn = {
									messages: [{
										code: "S",
										message: "New Project Created"
									}],
									status: 200,
									data: ioProjCreateData
								};
								fnReturn(roReturn);
							}
						}
					});
				}
			});
		},

		update: function(ioProject, fnReturn, ioNewObject) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioProject);

			Projects.findOne(loQueryObject, function(ioErr, ioData) {
				if (ioErr) {	//Connection Error
					roReturn = {
							messages: [{
								code: "E",
								message: "Connection Error!"
							}],
							status: 400,
							data: {}
					};
					fnReturn(roReturn);
				} else if (ioData) {	//Project Name Exists
					roReturn = {
							messages: [{
								code: "E",
								message: "Please select a different Project Name"
							}],
							status: 301,
							data: {}
					};
					fnReturn(roReturn);
				} else {	//Update Project
					ioData.userOid = ioNewObject.userOid;
					ioData.name = ioNewObject.name;
					ioData.namespace = ioNewObject.namespace;

					ioData.save(function(ioProjCreateErr, ioProjUpdateData) {
						if (ioProjCreateErr) {
							roReturn = {
									messages: [{
										code: "E",
										message: "Error in Project Updation"
									}],
									status: 400,
									data: ioProjCreateErr
							};
							fnReturn(roReturn);
						} else {
							roReturn = {
									messages: [{
										code: "S",
										message: "Project Updated"
									}],
									status: 400,
									data: ioProjUpdateData
							};
							fnReturn(roReturn);
						}
					});
				}
			});
		},

		deleteProject: function(ioProject, fnReturn) {
			var roReturn = {};
			if (ioProject._id) {
				var loQueryObject = this.getQueryObject(ioProject);

				Projects.findOne(loQueryObject, function(ioErr, ioData) {
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
							Projects.remove(loQueryObject, function(ioProjectsError, ioProjectsData) {
								if (ioProjectsError) {
									roReturn = {
											messages: [{
												code: "E",
												message: ioProjectsError
											}],
											status: 400,
											data: {}
									};
									fnReturn(roReturn);
								} else {
									var fnBlockReturn = function(ioBlockReturn) {
										// fnReturn(ioBlockReturn);
									};
									var loBlockQuery = {
											projectOid: ioProject._id,
											userOid: ioProject.userOid
									};
									BlocksModule.deleteBlock(loBlockQuery, fnBlockReturn);

									roReturn = {
										messages: [{
											code: "S",
											message: "Project Deleted"
										}],
										status: 200,
										data: ioProjectsData
									};
									fnReturn(roReturn);
								}
							});
						} else {
							roReturn = {
									messages: [{
										code: "E",
										message: "No Project exists with the selected id"
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
							message: "Please select a Project id to delete"
						}],
						status: 400,
						data: {}
				};
				fnReturn(roReturn);
			}
		},

		list: function(ioProject, fnReturn) {
			var roReturn = {};
			var loQueryObject = this.getQueryObject(ioProject);

			Projects.find(loQueryObject, function(ioErr, iaData) {
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
					if (iaData) {
						var loProjects = {
								projects: iaData,
								blocks: []
						};
						var laBlockQuery = [];
						for (var i=0;i<iaData.length;i++) {
							laBlockQuery.push({
								projectOid: iaData[i]._id,
								userOid: iaData[i].userOid
							});
						}
						var loQuery = {};
						if (laBlockQuery.length) {
							loQuery = {"$or": laBlockQuery};
						}

						Blocks.find(loQuery, function(err, foundBlocks) {
							if (err) {
								roReturn = {
										messages: [{
											code: "E",
											message: err
										}],
										status: 400,
										data: {}
								};
								fnReturn(roReturn);
							} else {
								if (foundBlocks) {
									loProjects.blocks = foundBlocks;
									roReturn = {
											messages: [{
												code: "S",
												message: ""
											}],
											status: 200,
											data: loProjects
									};
									fnReturn(roReturn);
								} else {
									roReturn = {
											messages: [{
												code: "S",
												message: "No Blocks found"
											}],
											status: 200,
											data: {}
									};
									fnReturn(roReturn);
								}
							}
						});
					} else {
						roReturn = {
								messages: [{
									code: "S",
									message: "No Project found"
								}],
								status: 200,
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

			return roQueryObject;
		}
};