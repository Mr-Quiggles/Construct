var Command = require("./command.js");
var Helper = require("../helper.js");

PukeCommand.prototype = new Command();
function PukeCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "puke", 							// Name of command
		commands:  ["^\\.puke$"], 				// Keyword(s) using regex
		usage: ".puke", 						// Example usage
		description: "Posts the special puke", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

PukeCommand.prototype.execute = function() {
	var that = this.clone();
	Helper.sendFile(that.m_message.channel, "./data/images/puke.gif", "puke.gif", Helper.fromBot(that.m_message)?"":Helper.mentionUser(that.m_message));
	Helper.deleteMessage(that.m_message);
}

// Export
module.exports = new PukeCommand();