var Command = require("./command.js");
var Helper = require("../helper.js");

AnonCommand.prototype = new Command();
function AnonCommand() {
	// Static variables
	this.m_properties = { 										// Properties; used for `.help`
		name: "anon", 											// Name of command
		commands:  ["^\\.anon .*$"], 							// Keyword(s) using regex
		usage: ".anon [message]", 								// Example usage
		description: "Sends a message \"anonymously\"", 		// Description
		regex: true, 											// Does the command rely on commanding through regex?
		visible: true 											// Visible to `man` and `help`
	}
}
AnonCommand.prototype.execute = function() {
	var that = this.clone();
	var channel = Helper.getChannel({channel: "anon-anonymous", type: "text"});

	Helper.deleteMessage(that.m_message).then(function(){
		Helper.sendMessage(channel, that.m_arguments)
	});
}

AnonCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new AnonCommand();