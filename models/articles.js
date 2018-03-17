
var mongoose = require("mongoose");

var articlesSchema = new mongoose.Schema({
	title: {
		type: String, 
	},
	summary: {
		type: String, 
	},	
	urlLink: {
		type: String, 
	},
	imgLink: {
		type: String, 
	},		
	createdAt: {
		type: Date, 
		default: Date.now
	}
});

var Articles = mongoose.model("Articles", articlesSchema);

module.exports = Articles;