var Command = require("./command.js");
var Helper = require("../helper.js");
var request = require("request");
var fs = require("fs");
var ffmpeg = require("ffmpeg");

ConvertCommand.prototype = new Command();
function ConvertCommand() {
	// Static variables
	this.m_properties = { 															// Properties; used for `.help`
		name: "convert", 															// Name of command
		commands:  ["^\\.convert .* .*"], 											// Keyword(s) using regex
		usage: ".convert [format] [url] (arguments)", 								// Example usage
		description: "Converts a file at [url] to [format] and optional flags", 	// Description
		regex: true, 																// Does the command rely on commanding through regex?
		visible: true 																// Visible to `man` and `help`
	};
	this.m_persistence = {
		filename: ""
	};
}
ConvertCommand.prototype.execute = function() {
	var that = this.clone();

	var to = that.m_arguments[0];
	var url = that.m_arguments[1];
	var scale = (that.m_arguments.length == 3) ? that.m_arguments[2] : "1.0";
	var from = url.split('.').pop();
	var folder = "./data/converts";
//	var target_from = "tmp+"+new Date().getTime() + "." + from;
	var target_from =  url.split('/').pop();
	var target_to = target_from + "." + to;
	var filename = folder+"/"+target_to;
	that.m_persistence.filename = filename;

	(that.m_message.channel.startTyping())
	request.get({url: url, encoding: 'binary'}, function (err, response, body) {
		if(err) {
			(that.m_message.channel.stopTyping());
			Helper.handleError(err,that.m_message);
			return;
		}
		Helper.replyMessage(that.m_message, "Downloading...").then(message1 => {
			fs.writeFile(folder+"/"+target_from, body, 'binary', function(err) {
				try {
					var process = new ffmpeg(folder+"/"+target_from);
					Helper.deleteMessage(message1);
					Helper.replyMessage(that.m_message, "Converting...").then(message2=>{
						process.then(function (video) {
							video.addCommand('-f', to);
							video.addCommand('-threads', 6);
						
							video.addCommand('-qmin', 0);
							video.addCommand('-qmax', 8);
							video.addCommand('-vf', "scale=iw*"+scale+":ih*"+scale+"");
						
							video.save(folder+"/"+target_to, function (error, file) {
								if (error) {
									(that.m_message.channel.stopTyping());
									Helper.handleError(err,that.m_message);
									return;
								}
								Helper.deleteMessage(message2);
								Helper.replyMessage(that.m_message, "Uploading...").then(message3=>{
									Helper.deleteMessage(message3);
									Helper.upload(that.m_persistence, function(json){
										(that.m_message.channel.stopTyping());
										var response = json.url;
										Helper.sendMessage(response);
									});
								/*
									Helper.sendFile(that.m_message, folder+"/"+target_to, target_to).then(message4 => {
										(that.m_message.channel.stopTyping());
									});
								*/
								});
							});

						}, function (err) {
							if ( err ) {	
								(that.m_message.channel.stopTyping());
								Helper.handleError(err,that.m_message);
							} 
						});
					});
				} catch (e) {
					(that.m_message.channel.stopTyping());
					Helper.handleError(e,that.m_message);
				}
			}).catch(function(){
				(that.m_message.channel.stopTyping());
			}); 
		});
	});
}
ConvertCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ", 1);
}

// Export
module.exports = new ConvertCommand();