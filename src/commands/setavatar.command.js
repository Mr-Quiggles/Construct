var Command = require("./command.js");
var Helper = require("../helper.js");

AvatarCommand.prototype = new Command();
function AvatarCommand() {
	// Static variables
	this.m_properties = { 										// Properties; used for `.help`
		name: "avatar-changer", 											// Name of command
		commands:  ["^\\.setav .*$"], 							// Keyword(s) using regex
		usage: ".setav [url]", 									// Example usage
		description: "Changes the bot's avatar", 				// Description
		regex: true, 											// Does the command rely on commanding through regex?
		visible: true, 											// Visible to `man` and `help`
	}
}
AvatarCommand.prototype.execute = function() {
	var that = this.clone();
	if ( !Helper.privilege(that.m_message.author) ) return;

	var url = that.m_arguments;
	require("request").get({url: url, encoding: 'binary'}, function (err, response, body) {
		if(err) {
			Helper.handleError(err,that.m_message);
			return;
		}
		fs.writeFile("./data/tmp", body, 'binary', function(err) {
			Helper.client.user.setAvatar(require("fs").readFileSync("./data/tmp"));
		});
	});
}

AvatarCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new AvatarCommand();