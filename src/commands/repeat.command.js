var Command = require("./command.js");
var Helper = require("../helper.js");

RepeatCommand.prototype = new Command();
function RepeatCommand() {
	// Static variables
	this.m_properties = { 											// Properties; used for `.help`
		name: "repeat", 											// Name of command
		commands:  ["^\\.repeat "], 								// Keyword(s) using regex
		usage: ".repeat [x]", 										// Example usage
		description: "Repeats a message, as if the bot said it!", 	// Description
		regex: true, 												// Does the command rely on commanding through regex?
		visible: false 												// Visible to `man` and `help`
	}
}

RepeatCommand.prototype.execute = function() {
	var that = this.clone();
	if ( !Helper.privilege(that.m_message.author) ) return;

	Helper.sendMessage(that.m_message.channel, that.m_arguments);
	Helper.deleteMessage(that.m_message);
}

RepeatCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new RepeatCommand();
