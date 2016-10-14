var Command = require("./command.js");
var Helper = require("../helper.js");

PermissionCommand.prototype = new Command();
function PermissionCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "permission", 							// Name of command
		commands:  ["^\\+p(| \\<@.*\\> .*)$", "^\\-p(| \\<@.*\\> .*)$", "^\\?p(| \\<@.*\\>)$"], 				// Keyword(s) using regex
		usage: "(+|-|?)p [@User] [command]", 						// Example usage
		description: "Restrict bot usage manually (no persistence at the moment)", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	}
}

PermissionCommand.prototype.execute = function() {
	var that = this.clone();
	if ( !Helper.privilege(that.m_message.author) ) return;
	var mentioned = that.m_message.mentions.users.array().length;
	var mode = that.m_arguments[0];
	var wildcard = !mentioned && (that.m_arguments[1] === "*" || that.m_arguments[1] === ".*");
	var target = (wildcard?{id: "*"}:(mentioned)?that.m_message.mentions.users.array()[0]:that.m_message.guild);
	var command = Helper.combine(that.m_arguments, " ", (mentioned)?2:1);
	var table = ((mentioned||wildcard)?Helper.construct.containers.permissions.users:Helper.construct.containers.permissions.servers)[target.id];

	if ( mode === "+p" ) {
		table.matches.push(command);
		Helper.replyMessage(that.m_message, "Added `"+command+"` from user "+Helper.mentionUser({author: target})+"");
	}
	if ( mode === "-p" ) {
		var i = table.matches.indexOf(command);
		if ( i > -1 ) table.matches.splice(i, 1);
		Helper.replyMessage(that.m_message, "Removed `"+command+"` from user "+Helper.mentionUser({author: target})+"");
	}
	if ( mode === "?p" ) {
		var str = ((mentioned)?("User "+Helper.mentionUser({author: target})):("Server "+target.name))+"'s permissions:\n```"+JSON.stringify(table)+"```";
		Helper.replyMessage(that.m_message, str);
	}
}

PermissionCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ");
}

// Export
module.exports = new PermissionCommand();