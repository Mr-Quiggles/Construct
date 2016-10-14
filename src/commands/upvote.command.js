var Command = require("./command.js");
var Helper = require("../helper.js");

UpvoteCommand.prototype = new Command();
function UpvoteCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "upvote", 									// Name of command
		commands:  ["^\\^$", "^this$", "^reblogged$", "^retweeted$", "^followed$", "^upvoted$"], 					// Keyword(s) using regex
		usage: "^", 								// Example usage
		description: "soudane", 							// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	}
}

UpvoteCommand.prototype.execute = function() {
	var that = this.clone();
	var verbs = ["liked", "reblogged", "retweeted", "followed", "upvoted"];
	var verb = that.m_message.content !== "^" ? that.m_message.content : verbs[Math.floor(Math.random()*verbs.length)];
	var msg = "<@"+that.m_message.author.id+"> "+ verb +" this post.";
	Helper.sendMessage(that.m_message.channel, msg);
	Helper.deleteMessage(that.m_message);
}


// Export
module.exports = new UpvoteCommand();