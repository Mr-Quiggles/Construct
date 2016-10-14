var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");
var cheerio = require("cheerio");

SteamEmoteCommand.prototype = new Command();
function SteamEmoteCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: ":steam:", 									// Name of command
		commands: ["^:steam: .*$"], 						// Keyword(s) using regex
		usage: ":steam: [steam emote name]", 							// Example usage
		description: "Posts the (hopefully correct) first result of a steam market search for an emoticon", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	}
}

SteamEmoteCommand.prototype.execute = function() {
	var that = this.clone();
	var emote = that.m_arguments;

	var options = {
		host: 'steamcommunity.com',
		port: 443,
		method: 'GET',
		path: "/market/search?q=%3A"+emote+"%3A&category_753_Game%5B%5D=any&category_753_item_class%5B%5D=tag_item_class_4&appid=753",
		headers: {
			'User-Agent': '/furry/ chat bot'
		}
	};
	//"http://steamcommunity.com/market/search?q=%3A"+emote+"%3A&category_753_Game%5B%5D=any&category_753_item_class%5B%5D=tag_item_class_4&appid=753"
	https.get(options, function(res) {
		var returned = '';
		
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			returned += chunk;
		});
		
		res.on('end', function() {			
			var $ = cheerio.load(returned);
			var res = $("#result_0_image").attr("src");
			Helper.deleteMessage(that.m_message);
			Helper.replyMessage(that.m_message, res);
		});
	});
}

SteamEmoteCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new SteamEmoteCommand();