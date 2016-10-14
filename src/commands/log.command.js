var Command = require("./command.js");
var Helper = require("../helper.js");

LogCommand.prototype = new Command();
function LogCommand() {
	// Static variables
	this.m_properties = { 					// Properties; used for `.help`
		name: "Log", 						// Name of command
		commands:  [""], 					// Keyword(s) using regex
		usage: "", 							// Example usage
		description: "Used to datamine", 	// Description
		regex: false, 						// Does the command rely on commanding through regex?
		visible: false, 					// Visible to `man` and `help`
		override: true
	}
}

LogCommand.prototype.execute = function() {
	var that = this.clone();
	Helper.log(that.m_message);
}

// Export
module.exports = new LogCommand();