var Command = require("./command.js");
var Helper = require("../helper.js");

AvatarCommand.prototype = new Command();
function AvatarCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "av", 								// Name of command
		usage: ".av [@User]", 							// Example usage
		commands:  ["^\\.av \\<@.*\\>$"], 					// Keyword(s) using regex
		description: "Gives a link to a user's avatar", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	}
}
AvatarCommand.prototype.execute = function() {
	var that = this.clone();
	var user = that.m_message.mentions.users.array().length > 0 ? that.m_message.mentions.users.array()[0] : that.m_message.author;
	Helper.construct.client.syncGuilds([that.m_message.guild]);
	that.m_message.guild.fetchMembers().then(guild => {
		console.log(guild.members);
		var array = guild.members.array();
		for ( var i in array ) {
			var usr = array[i];
			if ( usr.id+"" === user.id+"" )
				that.m_message.reply(usr.user.avatarURL);
		}
	})
}

// Export
module.exports = new AvatarCommand();