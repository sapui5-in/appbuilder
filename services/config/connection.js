const keys = require('./keys');
const mongoose = require("mongoose");

//Connect to MongoDB
mongoose.connect(keys.mongodb.dbURI, {useNewUrlParser: true});
mongoose.connection.once("open", function() {
  console.log("MongoDB Connection has been established");
}).on("error", function(error) {
  console.log("Connection error " + error);
});
