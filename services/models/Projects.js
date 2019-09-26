const mongoose = require("mongoose")
const Schema = mongoose.Schema;

//Create Schema and Model
const ProjectsSchema = new Schema({
	userOid: String,
	name: String,
	namespace: String,
	projectVersion: String,
	sapUiVersion: String,
	sapUiMinVersion: String,
	viewType: String,
	fullWidth: Boolean,
	supportedThemes: String
});

const Projects = mongoose.model("projects", ProjectsSchema);

module.exports = Projects;