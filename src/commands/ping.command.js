var Command = require("./command.js");
var Helper = require("../helper.js");

PingCommand.prototype = new Command();
function PingCommand() {
	// Static variables
	this.m_properties = { 				// Properties; used for `.help`
		name: "ping", 					// Name of command
		commands:  ["^\\.ping$"], 		// Keyword(s) using regex
		usage: ".ping", 				// Example usage
		description: "pong", 			// Description
		regex: true, 					// Does the command rely on commanding through regex?
		visible: true 					// Visible to `man` and `help`
	}
}

PingCommand.prototype.execute = function() {
	var that = this.clone();
	var prevTime = that.m_message.timestamp;
	var curTime = new Date();
	var delta = (curTime.getTime()-prevTime.getTime())/1000.0;
	var ping = "Pong: " + delta + " seconds";
	Helper.replyMessage(that.m_message, ping);
}


// Export
module.exports = new PingCommand();