// Required NPM Packages
var express = require('express');
var exphbs = require("express-handlebars");
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require("cheerio");
var request = require("request");

var path = require('path');
var router = express.Router();
var Promise = require("_______");

// Assign Mongoose promise
mongoose.Promise = Promise;

// Mongodb models
var Articles = require("../models/articles");
var Comments = require("../models/comments");

// Website To Be Scraped
var url = "http://www.newyorktimes.com/";

// Test Route To Verify Scraping Works From Route
router.get('/test', function(req, res) {
    // body of the html with request
    request(url, function(error, response, html) {
        // load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
		var result = [];
		$(".span6").each(function(i, element) {
			var title = $(element).find("a").find("img").attr("title");
			var summary = $(element).find("a").attr("href");
			var urlLink = $(element).find("a").find("img").attr("src");
			var imgLink = $(element).find(".td-post-text-excerpt").text();
			summary = summary.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
			result.push({ 
				Title: title,
				Story: summary,
				URL: urlLink,
				IMG: imgLink
			});
		});
		console.log(result);
		res.send(result);
    });
});

// Default route renders the index handlebars view
router.get('/', function(req, res){
	res.render('index');
});

// Scrape the website and assign stories to the database. Checks to verify story has not been added previously.
router.get('/scrape', function(req, res){
    request(url, function(error, response, html) {	
        var $ = cheerio.load(html);
		var result = [];
		// Scrape website
		$(".span6").each(function(i, element) {
			var title = $(element).find("a").find("img").attr("title");
			var summary = $(element).find("a").attr("href");
			var urlLink = $(element).find("a").find("img").attr("src");
			var imgLink = $(element).find(".td-post-text-excerpt").text();
			summary = summary.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
			result.push({ 
				Title: title,
				Story: summary,
				URL: urlLink,
				IMG: imgLink
			});	
			// Check database to see if story saved previously to database
			Articles.findOne({'title': title}, function(err, articleRecord) {
				if(err) {
					console.log(err);
				} else {
					if(articleRecord == null) {
						Articles.create(result[i], function(err, record) {
							if(err) throw err;
							console.log("Record Added");
						});
					} else {
						console.log("No Record Added");
					}					
				}
			});	
		});
    });	
});

// Get all current articles in database
router.get('/articles', function(req, res){
	Articles.find().sort({ createdAt: -1 }).exec(function(err, data) { 
		if(err) throw err;
		res.json(data);
	});
});

// Get all comments for one article
router.get('/comments/:id', function(req, res){
	Comments.find({'articleId': req.params.id}).exec(function(err, data) {
		if(err) {
			console.log(err);
		} else {
			res.json(data);
		}	
	});
});

// Add comment for article
router.post('/addcomment/:id', function(req, res){
	console.log(req.params.id+' '+req.body.comment);
	Comments.create({
		articleId: req.params.id,
		name: req.body.name,
		comment: req.body.comment
	}, function(err, docs){    
		if(err){
			console.log(err);			
		} else {
			console.log("New Comment Added");
		}
	});
});

// Delete comment for article
router.get('/deletecomment/:id', function(req, res){
	console.log(req.params.id)
	Comments.remove({'_id': req.params.id}).exec(function(err, data){
		if(err){
			console.log(err);
		} else {
			console.log("Comment deleted");
		}
	})
});

module.exports = router;