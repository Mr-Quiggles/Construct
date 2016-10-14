var Command = require("./command.js");
var Helper = require("../helper.js");

ForceRestart.prototype = new Command();
function ForceRestart() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "debug", 								// Name of command
		commands:  ["^\\.debug$"], 					// Keyword(s) using regex
		usage: ".debug", 							// Example usage
		description: "Does nothing for you :}", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	}
}
ForceRestart.prototype.execute = function() {
	var that = this.clone();
	process.exit();
}

// Export
module.exports = new ForceRestart();