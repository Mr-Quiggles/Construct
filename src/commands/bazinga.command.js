var Command = require("./command.js");
var Helper = require("../helper.js");

BazingaCommand.prototype = new Command();
function BazingaCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "bazinga", 							// Name of command
		commands:  [""], 				// Keyword(s) using regex
		usage: "bazinga", 						// Example usage
		description: "bazinga", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	};
	this.m_persistence = {
		channels : [
			"222918907810283520",
			"222921044082556928"
		],
		responses: [
			"bazinga bojangles zimbabwe sheldor",
			"bojangles bazinga",
			"blizzaga bazinga",
			"zimbabwe bazinga"
		]
	};
}

BazingaCommand.prototype.execute = function() {
	var that = this.clone();
	if ( Helper.fromBot(that.m_message) ) return;
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
module.exports = new BazingaCommand();