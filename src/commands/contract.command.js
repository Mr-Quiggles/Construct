var Command = require("./command.js");
var Helper = require("../helper.js");

ContractCommand.prototype = new Command();
function ContractCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "contract", 							// Name of command
		commands:  ["^\\.contract$"], 				// Keyword(s) using regex
		usage: ".contract", 						// Example usage
		description: "Posts the special contract", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}

ContractCommand.prototype.execute = function() {
	var that = this.clone();

	Helper.sendFile(that.m_message.channel, "./data/images/contract.jpg", "contract.jpg", Helper.fromBot(that.m_message)?"":Helper.mentionUser(that.m_message)).then(message=>{
		Helper.deleteMessage(that.m_message);
	})
}

// Export
module.exports = new ContractCommand();