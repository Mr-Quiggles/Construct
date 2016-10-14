var Command = require("./command.js");
var Helper = require("../helper.js");

CawCommand.prototype = new Command();
function CawCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "caw", 							// Name of command
		commands:  ["^ca+?w$"], 				// Keyword(s) using regex
		usage: "cawwww", 						// Example usage
		description: "He died for your sins!", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

CawCommand.prototype.execute = function() {
	var that = this.clone();

	Helper.sendFile(that.m_message.channel, "./data/images/caw.jpg", "caw.jpg", Helper.fromBot(that.m_message)?"":Helper.mentionUser(that.m_message)).then(message => {
		Helper.deleteMessage(that.m_message);
	})
}

// Export
module.exports = new CawCommand();