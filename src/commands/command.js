var Helper = require("../helper.js");

// Defining prototype for Command
function Command() {
	// Static variables
	this.m_properties = { 					// Properties; used for `.help`
		name: "Command", 					// Name of command
		commands:  ["^command"], 			// Keyword(s) using regex
		usage: "null", 						// Example usage
		description: "A basic command", 	// Description
		regex: true, 						// Does the command rely on commanding through regex?
		visible: true, 						// Visible to `man` and `help`
		enabled: true,
		override: false,
		lastTime: 0,
		deltaTime: 0
	};
	this.m_uri = {
		name: "Command",
		path: "",
		usage: "/?=",
		description: "A basic command",
		contentType: "text/plain",
		enabled: true,
		visible: false
	};
	
	this.m_message = null; 					// Discord.js's Message
	this.m_arguments = []; 					// Arguments for our own purposes
	this.m_persistence = null; 				// Persistent storage used for each command's needs
}
Command.prototype.should = function( message ) {
	if ( message ) this.parse(message); 									// Attempt to parse in the event it was never called

 	// Iterate through our commands
	for ( var i = 0; i < this.m_properties.commands.length; ++i ) {
		var command = this.m_properties.commands[i];
		if ( (this.m_properties.regex && this.m_message.content.search(new RegExp(command)) >= 0) || (!this.m_properties.regex && this.m_message.content.indexOf(command) >= 0) ) {
			return true;
		}
	}
	this.clean();
	return false;
}
Command.prototype.execute = function() {
}
Command.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ", 1);
}
Command.prototype.clean = function() {
	this.m_message = null; 					// Discord.js's Message
	this.m_arguments = []; 					// Arguments for our own purposes
}
Command.prototype.clone = function() {
	var that = new Command();
	that.m_message = this.m_message;
	that.m_arguments = JSON.parse(JSON.stringify(this.m_arguments))
	that.m_persistence = JSON.parse(JSON.stringify(this.m_persistence))
//	var that = JSON.parse(JSON.stringify(this));
	return that;
}

// Export
module.exports = Command;