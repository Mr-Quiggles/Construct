var Command = require("./command.js");
var Helper = require("../helper.js");

ManCommand.prototype = new Command();
function ManCommand() {
	// Static variables
	this.m_properties = { 								// Properties; used for `.help`
		name: "man", 									// Name of command
		usage: ".man [command]", 						// Example usage
		commands:  ["^\\.man .*$"], 						// Keyword(s) using regex
		description: "Returns details of a command", 	// Description
		regex: true, 									// Does the command rely on commanding through regex?
		visible: true 									// Visible to `man` and `help`
	}
}
ManCommand.prototype.execute = function() {
	var that = this.clone();
	var response = "";
	var commands = require("../commands.js");
	for ( var i = 0; i < commands.length; ++i ) {
		var command = commands[i];
		if ( !command ) continue;
		if ( command.m_properties.name === that.m_arguments[0] ) {
			var condition = Helper.combine(command.m_properties.commands, "; ");
			response += "Usage: `"+command.m_properties.usage + "` | Commands: `" + condition + "` (Uses Regex: " + that.m_properties.regex + " ) |  " + command.m_properties.description;
		}
	}
	if ( response === "" ) {
		response = "Cannot find command under `" + that.m_arguments[0] + "`.";
	}
	Helper.replyMessage(that.m_message, response);
}
ManCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ", 1);
}

// Export
module.exports = new ManCommand();