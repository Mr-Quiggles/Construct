var Command = require("./command.js");
var Helper = require("../helper.js");

ReloadCommand.prototype = new Command();
function ReloadCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "reload", 							// Name of command
		commands:  ["^\\.reload$"], 					// Keyword(s) using regex
		usage: ".reload", 							// Example usage
		description: "Reload all commands", 		// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "reload",
		path: "reload",
		usage: "/reload?k={key}",
		description: "Reloads the bot's commands only if the correct key is provided.",
		enabled: true,
		visible: true
	};
	this.m_persistence = {
		k: "placeholder"
	};
}

ReloadCommand.prototype.connect = function( request, response, uri ) {
	var that = this.clone();
	if ( uri.query.k !== that.m_persistence.k ) {
		response.end(JSON.stringify({status: 'error', code: 'invalid request'},null,2));
		return;
	}

	try {
		delete require.cache[require.resolve('../commands.js')]
		Helper.construct.containers.commands = require("../commands.js");
		response.end(JSON.stringify({status: 'OK'}, null, 2));
	} catch ( e ) {
		response.end(JSON.stringify({status: 'error', code: "" + e},null,2));
	}
}

ReloadCommand.prototype.execute = function() {
	var that = this.clone();
	if ( !Helper.privilege(that.m_message.author) ) return;
	Helper.deleteMessage(that.m_message);
	Helper.replyMessage(that.m_message, "reloading...").then(message => {
		var response = {
			end: function( string ) {
				var json = JSON.parse(string);
				Helper.deleteMessage(message);
				if  ( json.status !== "OK" ) {
					Helper.replyMessage(that.m_message, "Failed to reload: " + json.code);
					return;
				}
				Helper.replyMessage(that.m_message, "reloaded!");
			}
		}
		this.connect(null, response, require("url").parse("/?k="+that.m_persistence.k, true));
	});
}

// Export
module.exports = new ReloadCommand();