var Command = require("./command.js");
var Helper = require("../helper.js");
var wolfram = require('wolfram-alpha').createClient("QTR7Q4-2G9XW3J9VE");
var async = require('async');

WolframAlphaCommand.prototype = new Command();
function WolframAlphaCommand() {
	// Static variables
	this.m_properties = { 													// Properties; used for `.help`
		name: "wolfram-alpha", 													// Name of command
		usage: ".wolfram-alpha [query]", 											// Example usage
		commands:  ["^\\.w(|olfram-)a(|lpha)(|-i(|mage)) .*$"], 				// Keyword(s) using regex
		description: "Returns a wolfram-alpha search", 							// Description
		regex: true, 														// Does the command rely on commanding through regex?
		visible: true 														// Visible to `man` and `help`
	}
}
WolframAlphaCommand.prototype.execute = function() {
	var that = this.clone();
	var query = that.m_arguments;
	var useimage = that.m_message.content.search(new RegExp("i(|mage).*$")) >= 0;
	console.log(useimage);
	wolfram.query(query, function (err, results) {
		if (err) {
			Helper.handleError(err);
		}
		var reply = "";
		var q = async.queue(function(task, callback){
			callback();
		}, 1);
		var tostring = function(results) {
			var str = "";
			var image = "";
			str += "```";
			for ( var i = 0; i < Math.min(16,results.length); ++i ) {
				var result = results[i];
				var lastKey = "primary";
				for ( var key in result ) {
					if ( result[key] === "" ) continue;
					if ( result[key] === " " ) continue;
					if ( result[key] === "\b" ) continue;
					if ( key === "title" ) {continue}
					if ( key === "primary" ) continue;
					if ( key === "image" ) {image = result[key]; continue}
					if ( key === "text" ) {str += ""+result[key]+"\n"; continue}
					if ( key === "subpods" ) {
						tostring(result[key]);
						continue;
					}
					str += "__**"+key+":**__ `" + result[key] + "`\n";
				} 
			}
			str += '```';
		//	if ( image !== "" ) q.push({message: that.m_message, image: image, filename: "wolfram-alpha.png", str: str});
			if ( str !== "``````" )
			( image !== "" )
			? q.push({}, function(){Helper.sendFile(that.m_message.channel, image, "wolfram-alpha.png", str)})
			: q.push({}, function(){Helper.sendMessage(that.m_message.channel, str)});
		}
		var toimages = function(results) {
			var str = "";
			var image = "";
			for ( var i = 0; i < Math.min(16,results.length); ++i ) {
				var result = results[i];
				var lastKey = "primary";
				for ( var key in result ) {
					if ( key === "image" ) {image = result[key]; continue}
					if ( key === "subpods" ) {
						toimages(result[key]);
						continue;
					}
				} 
			}
		//	if ( image !== "" ) q.push({message: that.m_message, image: image, filename: "wolfram-alpha.png"});
			if ( image !== "" ) q.push({}, function(){Helper.sendFile(that.m_message.channel, image, "wolfram-alpha.png")});
		}
		(useimage) ? toimages(results) : tostring(results);
/*
		for ( var i = 0; i < results.length; ++i ) {
			var result = results[i];
			for ( var key in result ) {
				if ( key === "primary" ) continue;
				if ( key === "image" ) {reply += result[key]+"\n"; continue}
				if ( key === "Title" ) {reply += result[key]+"\n"; continue}
				if ( key === "subpods" ) {
					for ( var j = 0; j < result[key].length; ++j ) {
						for ( var kkey in result[key][j] ) {
							if ( key === "primary" ) continue;
							if ( key === "image" ) {reply += result[key]+"\n"; continue}
							if ( key === "title" ) {reply += result[key]+"\n"; continue}
							if ( result[key][j][kkey] && result[key][j][kkey] !== "" ) reply += "__**"+kkey+":**__ `" + result[key][j][kkey] + "`\n";
						}
					}
					continue;
				}
				reply += "__**"+key+":**__ `" + result[key] + "`\n";
			} 
		}
*/
	/*
		var reply = "" +
		"__**Title**__: " + result[]
		"";
	*/
	});
}
	

WolframAlphaCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new WolframAlphaCommand();