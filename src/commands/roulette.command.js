var Command = require("./command.js");
var Helper = require("../helper.js");

RouletteCommand.prototype = new Command();
function RouletteCommand() {
	// Static variables
	this.m_properties = { 								// Properties; used for `.help`
		name: "roulette", 								// Name of command
		usage: ".roulette", 							// Example usage
		commands:  ["^\\.roulette$"], 					// Keyword(s) using regex
		description: "Do you have the furballs?", 		// Description
		regex: true, 									// Does the command rely on commanding through regex?
		visible: false, 								// Visible to `man` and `help`
		enabled: false
	}
}
var current = 0;
RouletteCommand.prototype.execute = function() {
	if ( this.m_message.author.id == Helper.construct.id ) {
		Helper.sendMessage(this.m_message.channel, "No thanks, I love myself.");
		return;
	}
	var rounds = 6;
	var _message = this.m_message;
	current = ( current <= 0 ) ? Math.floor(Math.random() * rounds + 1) : --current;
	// Dead
	if ( current == 0 ) {
		var user = this.m_message.author;
		var server = this.m_message.guild;
		
		Helper.construct.client.getInvites(server, function(error, invites) {
			console.log("!");
			if ( error ) {
				Helper.handleError(error);
				return;
			}
			if ( !invites || invites.length === 0 || !invites[0].code ) {
				Helper.handleError("Cannot send invite!");
				return;
			}
			var id = invites[0].code;
			Helper.pmUser(user.id, "http://discord.gg/"+id, function(error){
				Helper.construct.client.kickMember(user, server, function( error ) {
					if ( error ) Helper.handleError(error);
					Helper.sendMessage(_message.channel, "F.");
				});
			});
		
		});
	} else {
		Helper.sendMessage(this.m_message.channel, "Ping.");
	}
}

// Export
module.exports = new RouletteCommand();