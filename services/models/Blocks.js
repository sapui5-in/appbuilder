const mongoose = require("mongoose")
const Schema = mongoose.Schema;

//Create Schema and Model
const BlocksSchema = new Schema({
  userOid: String,
  projectOid: String,
  name: String,
  type: String,			//Block or View
  viewType: String,
  description: String,
  icon: String,
  category: String,
  isDesignerBlock: Boolean,
  code: String,
  data: String
});

const Blocks = mongoose.model("blocks", BlocksSchema);

module.exports = Blocks;
