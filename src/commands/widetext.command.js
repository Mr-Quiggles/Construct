var Command = require("./command.js");
var Helper = require("../helper.js");

WideTextCommand.prototype = new Command();
function WideTextCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "wide", 							// Name of command
		commands:  ["^\\.wide .*$", "^\\.wide .*$"], 	// Keyword(s) using regex
		usage: ".wide [message]", 					// Example usage
		description: "Adds wide to your message", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "wide",
		path: "wide",
		usage: "/wide?text={text}",
		description: "Converts {text} to wide-width text for ａｅｓｔｈｅｔｉｃｓ",
		enabled: true,
		visible: true
	}
}
WideTextCommand.prototype.connect = function( request, response, uri ) {
	var text = uri.query.text;
	var wide = text.replace( /[A-Za-z ]/g, function(ch) { 
		return (( ch == ' ' ) ? "　" : String.fromCharCode(ch.charCodeAt(0) + 'Ａ'.charCodeAt(0) - 'A'.charCodeAt(0))); }
	);
	response.end(JSON.stringify({text: wide}, null, 2));
}

WideTextCommand.prototype.execute = function() {
	var that = this.clone();
	var query = that.m_arguments;

	var response = {
		end: function( string ) {
			var response = JSON.parse(string);
			Helper.replyMessage(that.m_message, response.text);
			Helper.deleteMessage(that.m_message);
		}
	}
	this.connect(null, response, require("url").parse("/?text="+query, true));
}

WideTextCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new WideTextCommand();