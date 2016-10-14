var Command = require("./command.js");
var Helper = require("../helper.js");

FabricatorCommand.prototype = new Command();
function FabricatorCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "fabricator", 							// Name of command
		commands:  ["^\\.fabricat(or|e) \\<@.*\\>"], 				// Keyword(s) using regex
		usage: ".fabricat(or|e) [@User] [message]", 						// Example usage
		description: "Generates a '''real''' screenshot of a message", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

FabricatorCommand.prototype.execute = function() {
	var that = this.clone();
	var target = that.m_message.author;
	if (that.m_message.mentions.users.array().length) {
		target = that.m_message.mentions.users.array()[0];
		if ( that.m_message.mentions.users.array().length > 1 ) {	
			var regexp = new RegExp("\\<@(!|)(.+?)\\>");
			var matches = that.m_message.content.match(regexp);
			if ( matches ) {
				var id = regexp.exec(matches[0])[2];
				target = that.m_message.mentions.users.find("id", id);
			}
		}
	}

	var data = {
		target: target,
		message: that.m_message,
		content: that.m_arguments
	}
	var html = Helper.generateHtml(data);
	require('fs').writeFileSync("./data/html/fabricator/fabricated.html", html, 'binary');
	Helper.deleteMessage(that.m_message);

	try{
		var html2png = require('html2png');
		var screenshot = html2png({width: 1920, height: 1080, browser: 'chrome'});
		screenshot.render(html, function (err, data) {
			if (err) { console.log(err); return}
			require('fs').writeFileSync("./data/images/fabricated.png", data, 'binary');
			screenshot.close();
			require('jimp').read("./data/images/fabricated.png").then(function (image) {
				image.autocrop();
				image.write( "./data/images/screenshot.png", function(){
					Helper.sendFile(that.m_message.channel, "./data/images/screenshot.png", "screenshot.png", "<@"+target.id+">");
				})
			}).catch(function (err) {
				console.log(err)
			});
		});
	} catch (e) {
		console.log(e);
	}
}

FabricatorCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", (message.mentions && message.mentions.users.array().length)?2:1)," ");
}

// Export
module.exports = new FabricatorCommand();