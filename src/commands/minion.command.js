var Command = require("./command.js");
var Helper = require("../helper.js");

MinionCommand.prototype = new Command();
function MinionCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "minion", 							// Name of command
		commands:  [""], 							// Keyword(s) using regex
		usage: "minion", 							// Example usage
		description: "minion", 						// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	};
	this.m_persistence = {
		channels : [
			"210105174440673280"
		],
		ignore: [
			"168209090667872258"
		],
		responses: [
			"minion memes",
		]
	};
}

MinionCommand.prototype.execute = function() {
	var that = this.clone();
	if ( Helper.fromBot(that.m_message) ) return;
	if ( that.m_persistence.ignore.indexOf(that.m_message.author.id) >= 0 ) return;
	if ( that.m_persistence.channels.indexOf(that.m_message.channel.id) >= 0 ) {
		var i = Math.floor(Math.random() * that.m_persistence.responses.length);
		var response = that.m_persistence.responses[i];
		Helper.sendMessage(that.m_message.channel, ".gi " + response).then(message => {
		/*
			message.edit(response).then(message => {
				message.delete();
				that.m_message.delete();
			});
		*/
			message.delete();
		//	that.m_message.delete();
			return true;
		});
	}
}

// Export
module.exports = new MinionCommand();