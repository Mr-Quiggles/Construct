var Command = require("./command.js");
var Helper = require("../helper.js");

MemeArrowCommand.prototype = new Command();
function MemeArrowCommand() {
	// Static variables
	this.m_properties = { 				// Properties; used for `.help`
		name: "meme-arrow", 			// Name of command
		commands:  ["^>.*"], 			// Keyword(s) using regex
		usage: ">$CURRENT_YEAR", 		// Example usage
		description: ">$CURRENT_YEAR", 	// Description
		regex: true, 					// Does the command rely on commanding through regex?
		visible: true 					// Visible to `man` and `help`
	}
}

MemeArrowCommand.prototype.execute = function() {
	var that = this.clone();
	var msg = "";
	var prob = Math.random() * 100;
	var replacement = ">";
	if ( prob >= 66 ) 		replacement = ":point_right::skin-tone-"+(Math.floor(Math.random() * 5) + 1)+":";
	else if ( prob >= 33 ) 	replacement = ":arrow_right:";
	else 					that.m_arguments = "```css\n"+that.m_arguments+"```";
	that.m_arguments = Helper.combine(Helper.split(that.m_arguments, "\n>", 0), "\n"+replacement);
	Helper.replyMessage(that.m_message, that.m_arguments);
/*
	if ( prob >= 66 ) 		Helper.replyMessage(that.m_message, ":point_right::skin-tone-"+(Math.floor(Math.random() * 5) + 1)+":" + that.m_arguments[0]);
	else if ( prob >= 33 ) 	Helper.replyMessage(that.m_message, ":arrow_right: " + that.m_arguments[0]);
	else 					Helper.replyMessage(that.m_message, "```css\n>"+that.m_arguments+"```");	
*/
	Helper.deleteMessage(that.m_message);
}

MemeArrowCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = "\n"+message.content;
}

// Export
module.exports = new MemeArrowCommand();