var Command = require("./command.js");
var Helper = require("../helper.js");
var http = require("http");
var cheerio = require("cheerio");

JsonCommand.prototype = new Command();
function JsonCommand() {
	// Static variables
	this.m_properties = { 																// Properties; used for `.help`
		name: "json", 																	// Name of command
		commands: ["^\\.json .*$"], 													// Keyword(s) using regex
		usage: ".json [URI]", 															// Example usage
		description: "Returns the JSON representation of a command on the HTTP side", 	// Description
		regex: true, 																	// Does the command rely on commanding through regex?
		visible: true, 																	// Visible to `man` and `help`
	};
}

JsonCommand.prototype.execute = function() {
	var that = this.clone();
	var uri = require("url").parse("/"+that.m_arguments, true);

	var response = {
		end: function( string ) {
			Helper.replyMessage(that.m_message, "```"+string+"```");
		}
	}
	var apiVersion = 1;
	for ( var i = 0; i < Helper.construct.containers.commands.length; ++i ) {
		var command = Helper.construct.containers.commands[i];
		if ( !command ) continue;
		if ( command.m_properties.enabled == false ) continue;
		if ( command.m_uri.enabled == false ) continue;
		if ( command.m_uri.path === "" ) continue;

		if ( uri.pathname === "/" + command.m_uri.path || uri.pathname === "/" + command.m_uri.path + "/" || uri.pathname === "/api/"+apiVersion+"/" + command.m_uri.path || uri.pathname === "/api/"+apiVersion+"/" + command.m_uri.path + "/" ) {
			var ret = command.connect(null, response, uri);
			if ( ret == true ) break;
		}
	}
}

JsonCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new JsonCommand();