var Command = require("./command.js");
var Helper = require("../helper.js");

RandomYugiohSummon.prototype = new Command();
function RandomYugiohSummon() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "random-yugioh", 							// Name of command
		commands:  [""], 				// Keyword(s) using regex
		usage: "random-yugioh", 						// Example usage
		description: "random-yugioh", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: false 								// Visible to `man` and `help`
	};
	this.m_persistence = {
		channels : [
			"229705506875375618",
		]
	};
}

RandomYugiohSummon.prototype.execute = function() {
	var that = this.clone();
	if ( Helper.fromBot(that.m_message) ) return;
	if ( that.m_persistence.channels.indexOf(that.m_message.channel.id) >= 0 ) {
		Helper.sendMessage(that.m_message.channel, ".summon").then(message => {
			message.delete();
			return true;
		});
	}
}

// Export
module.exports = new RandomYugiohSummon();