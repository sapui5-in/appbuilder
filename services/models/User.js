const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: String,
	role: String, 	//User, Admin, SuperAdmin
	loginSource: String,
	googleId: String,
	language: String,
	url: String,
	thumbnail: String
});

const User = mongoose.model('user', userSchema);

module.exports = User;