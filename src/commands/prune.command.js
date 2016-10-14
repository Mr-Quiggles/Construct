var Command = require("./command.js");
var Helper = require("../helper.js");

PruneCommand.prototype = new Command();
function PruneCommand() {
	// Static variables
	this.m_properties = { 										// Properties; used for `.help`
		name: "prune", 											// Name of command
		commands:  ["^\\.prune \\d*(| \\*)$", "^\\.prune \\d* \\<@.*$"], 	// Keyword(s) using regex
		usage: ".prune (@User) [x]", 									// Example usage
		description: "Prunes up to [x] messages!", 				// Description
		regex: true, 											// Does the command rely on commanding through regex?
		visible: true 											// Visible to `man` and `help`
	}
}

PruneCommand.prototype.execute = function() {
	var that = this.clone();
	var goal = parseInt(that.m_arguments[0]);
	var privileged = Helper.privilege(that.m_message.author);
	var wildcard = that.m_arguments[1] === "*";
	var mentions = []; {
		var ar = that.m_message.mentions.users.array();
		for ( var i in ar ) {
			var user = ar[i];
			mentions.push(user.id);
		}
	}
	var mentioned = mentions.length > 0;

	that.m_message.channel.fetchMessages( {limit: 100 }).then(logs => {
		var messages = [];
		var array = logs.array();
		for ( var i in array ) {
		//	console.log(array[i].author.id);
			var ok = false;
			if ( messages.length >= goal ) continue;
			if ( privileged && wildcard ) ok = true;
			else if ( privileged && array[i].author.id in mentions ) ok = true;
			else if ( !mentioned && array[i].author.id == that.m_message.author.id ) ok = true;
			if ( ok ) {
				messages.push(array[i]);
				Helper.deleteMessage(array[i]);
			}
		}
	//	console.log(messages);
	//	that.m_message.channel.bulkDelete( messages ).then(Helper.handleError);
	}).catch(Helper.handleError);
}

PruneCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ", 1);
}

// Export
module.exports = new PruneCommand();
