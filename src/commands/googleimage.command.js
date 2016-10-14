var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");
var cheerio = require("cheerio");

GoogleImageCommand.prototype = new Command();
function GoogleImageCommand() {
	// Static variables
	this.m_properties = { 													// Properties; used for `.help`
		name: "google-image", 												// Name of command
		commands:  ["^\\.gi .*$", "^\\.google-image .*$", "^\\.gi-random .*$"], 				// Keyword(s) using regex
		usage: ".gi [query]", 											// Example usage
		description: "Returns a gi search", 							// Description
		regex: true, 														// Does the command rely on commanding through regex?
		visible: true 														// Visible to `man` and `help`
	}
}
GoogleImageCommand.prototype.execute = function() {
	var that = this.clone();
	var random = true; //that.m_message.content.search(new RegExp("^\\.gi-random .*$")) >= 0;
	var query = (that.m_arguments);
	// https://www.google.com/search?tbm=ish&gws_rd=cr&q=

	var options = {
		host: 'www.google.com',
		port: 443,
		method: 'GET',
		path: "/search?tbm=isch&gws_rd=cr&q="+encodeURIComponent(query),
		headers: {
			'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:38.9) Gecko/20100101 Goanna/2.1 Firefox/38.9 PaleMoon/26.3.3"
		}
	};
	https.get(options, function(res) {
		var returned = '';
		
		res.setEncoding('utf8');
		res.on('error', function(e) {
			console.log(e);
		});
		res.on('data', function(chunk) {
			returned += chunk;
		});
		
		res.on('end', function() {			
			var matches = returned.match(new RegExp('"ou":"(.+?)"', "g"));
			var i = Math.floor(matches.length * Math.random());
			var image = matches[i].substring('"ou":"'.length);
			Helper.replyMessage(that.m_message, encodeURI(image.substring(0,image.length-1)));
		});
	});
/*
	var searcher = new (require('images-scraper')).Google();
	searcher.list({
		keyword: query,
		num: 32,
		detail: false,
		nightmare: {
			show: false
		}
	})
	.then(function (res) {
		var i = (random?Math.floor(Math.random()*res.length):0);
		var url = res[i].url;
		Helper.replyMessage(_message, url);
	}).catch(function(err) {
		Helper.handleError(err, _message);
	});
*/
}

GoogleImageCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new GoogleImageCommand();