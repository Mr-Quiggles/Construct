var Command = require("./command.js");
var Helper = require("../helper.js");

AppleCommand.prototype = new Command();
function AppleCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "apple", 							// Name of command
		commands:  ["^\\.apple$"], 				// Keyword(s) using regex
		usage: ".apple", 						// Example usage
		description: "You're an apple", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

AppleCommand.prototype.execute = function() {
	var that = this.clone();

	Helper.sendFile(that.m_message.channel, "./data/images/apple.gif", "apple.gif", Helper.fromBot(that.m_message)?"":Helper.mentionUser(that.m_message)).then(message=>{
		Helper.deleteMessage(that.m_message);
	});
}

// Export
module.exports = new AppleCommand();