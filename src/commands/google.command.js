var Command = require("./command.js");
var Helper = require("../helper.js");
var google = require("google");

GoogleCommand.prototype = new Command();
function GoogleCommand() {
	// Static variables
	this.m_properties = { 													// Properties; used for `.help`
		name: "google", 													// Name of command
		commands:  ["^\\.g .*$", "^\\.google .*$", "^\\.google-random .*$"], 				// Keyword(s) using regex
		usage: ".google [query]", 											// Example usage
		description: "Returns a google search", 							// Description
		regex: true, 														// Does the command rely on commanding through regex?
		visible: true 														// Visible to `man` and `help`
	}
}
var _message = null;
GoogleCommand.prototype.execute = function() {
	var random = this.m_message.content.search(new RegExp("^\\.google-random .*$")) >= 0;
	var minimal = this.m_message.content.search(new RegExp("^\\.g .*$")) >= 0;
	google.resultsPerPage = 50;
	var query = this.m_arguments;
	_message=this.m_message;
	google(query, function (err, res){
		for ( var i = (random) ? Math.floor(Math.random() * res.links.length) : 0; i < res.links.length; ++i ){
			var result = res.links[i];
			var url = result.href;
			var title = result.title;
			var desc = result.description;
			if ( !url || url === null || url === "null" || url === "" ) {
				console.log(url);
				continue;
			}
			var response = 
			(!minimal?"\n__**Title:**__ ":"\n**") + title + (minimal?"**":"") +
			(!minimal?"\n__**Description:**__ ":"\n") + desc + 
			(!minimal?"\n__**URL:**__ ":"\n") + url +
			"";
			Helper.replyMessage(_message, response);

			return;
		}
		Helper.replyMessage(_message, "????	");
	});
}

GoogleCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new GoogleCommand();