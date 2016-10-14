var Command = require("./command.js");
var Helper = require("../helper.js");

SedCommand.prototype = new Command();
function SedCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "s/", 								// Name of command
		commands:  ["^\\.s\/.*\/.*$"], 				// Keyword(s) using regex
		usage: ".s/[regex]/[replacement]", 						// Example usage
		description: "`sed` is now on Discord", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false, 								// Visible to `man` and `help`
		enabled: false
	}
}

SedCommand.prototype.execute = function() {
	var that = this.clone();
	var regex = new RegExp(that.m_arguments[0], (that.m_arguments[0]===".*"?"i":"g"));
	var replacement = Helper.combine(that.m_arguments, "/", 1);

	that.m_message.channel.fetchMessages( {limit: 256, before:that.m_message}).then(logs => {
		for ( var i = 0; i < logs.length; ++i ) {
			var log = logs[i];
			if ( log.content.search(regex) === -1 ) continue;
			var replaced = log.content.replace(regex, replacement);
			Helper.sendMessage(that.m_message.channel, "<@"+log.author.id+">: " + replaced);
			break;
		}
	});
}

SedCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, "/", 1);
}

// Export
module.exports = new SedCommand();
