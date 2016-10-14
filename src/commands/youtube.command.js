var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");
var cheerio = require("cheerio");

YoutubeCommand.prototype = new Command();
function YoutubeCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "youtube", 									// Name of command
		commands: ["^\\.y(|ou)t(|ube) .*$", "^\\.jewtube .*$"], 						// Keyword(s) using regex
		usage: ".youtube [query]", 							// Example usage
		description: "Posts the first result of a YouTube search", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	}
}

YoutubeCommand.prototype.execute = function() {
	var that = this.clone();
	var query = that.m_arguments;

	var options = {
		host: 'www.youtube.com',
		port: 443,
		method: 'GET',
		path: "/results?search_query="+encodeURIComponent(query),
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
			var $ = cheerio.load(returned);
			var res = "https://youtube.com"+$('.yt-uix-tile-link:not([href*="googleads"])').not(".g-hovercard").attr("href");
			Helper.replyMessage(that.m_message, res);
		});
	});
}

YoutubeCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new YoutubeCommand();