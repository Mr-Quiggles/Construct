var Command = require("./command.js");
var Helper = require("../helper.js");

DubsCommand.prototype = new Command();
function DubsCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "dubs", 							// Name of command
		commands:  ["^(C|c)heck(| )(em|it)$"], 				// Keyword(s) using regex
		usage: "checkem", 						// Example usage
		description: "Check my digits", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

DubsCommand.prototype.execute = function() {
	var that = this.clone();
	Helper.deleteMessage(that.m_message);
	Helper.replyMessage(that.m_message, ":thinking: "+Math.floor(Math.random()*10)+Math.floor(Math.random()*10));
}
// Export
module.exports = new DubsCommand();