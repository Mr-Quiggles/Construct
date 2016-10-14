
var Command = require("./command.js");
var Helper = require("../helper.js");

ProtectedText.prototype = new Command();
function ProtectedText() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "protected", 							// Name of command
		commands:  ["^\\.protect(|ed) .*$"], 	// Keyword(s) using regex
		usage: ".protect [message]", 					// Example usage
		description: "Adds protection to your message", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "protect",
		path: "protect",
		usage: "/protect?text={text}",
		description: "Converts {text} to protected text for ａｅｓｔｈｅｔｉｃｓ",
		enabled: true,
		visible: true
	}
}
ProtectedText.prototype.connect = function( request, response, uri ) {
	var that = this.clone();
	var text = uri.query.text;

	var protect = "ᗩᗷᑕᗪᕮᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ";
	var msg = "";
	for ( var i = 0; i <text.length; ++i ) {
		var c = ""+text.charAt(i);
		if ( c >= 'A' && c <= 'Z' ) {
			msg += protect.charAt(c.charCodeAt(0)-"A".charCodeAt(0));
		} else if ( c >= 'a' && c <= 'z' ) {
			msg += protect.charAt(c.charCodeAt(0)-"a".charCodeAt(0));
		} else {
			msg += c;
		}
	}

	response.end( JSON.stringify( {text: msg}, null, 2 ) );
}

ProtectedText.prototype.execute = function() {
	var that = this.clone();

	var response = {
		end: function( string ) {
			var response = JSON.parse(string);
			Helper.replyMessage(that.m_message, response.text);
			Helper.deleteMessage(that.m_message);
		}
	}
	this.connect(null, response, require("url").parse("/?text="+query, true));
}

ProtectedText.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new ProtectedText();