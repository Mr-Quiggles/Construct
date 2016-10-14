var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");
var cheerio = require("cheerio");
var ytdl = require('ytdl-core');

YTDLCommand.prototype = new Command();
function YTDLCommand() {
	// Static variables
	this.m_properties = { 														// Properties; used for `.help`
		name: "play", 															// Name of command
		commands: ["^\\.play( .*|list|-loop|-(next|skip))$", "^\\.frick$"], 	// Keyword(s) using regex
		// Example usage
		usage: ".play [url]", 	
		// Description
		description: "Plays (a list of) youtube URLs. `.play [URL]` queues a YouTube video, `.playlist` lists the queue, `.play-loop` toggles looping, `.play-next` and `.play-skip` skips to the next song.", 							
		regex: true, 															// Does the command rely on commanding through regex?
		visible: true 															// Visible to `man` and `help`
	}
	this.m_persistence = {
		loop: false,
		position: 0,
		playlist: {
			urls:[],
			titles:[]
		}
	}
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

next = function( data ) {
	var atEnd = Helper.jukebox.position + 1 >= Helper.jukebox.playlist.urls.length;
	var voiceChannel = Helper.vc.channel;
	if ( Helper.vc != null ) {
		Helper.vc.disconnect();
		Helper.vc = null;
	}
	if ( atEnd && !Helper.jukebox.loop ) {
		Helper.jukebox.playlist.urls = [];
		Helper.jukebox.playlist.titles = [];
		Helper.jukebox.position = 0;
		return;
	}
	Helper.jukebox.position = atEnd ? 0 : Helper.jukebox.position + 1;
	voiceChannel.join().then(connection => {
		Helper.vc = connection;
		play( Helper.jukebox, connection );
	}).catch(Helper.handleError);
}
play = function( data, voiceConnection ) {
	var url = Helper.jukebox.playlist.urls[Helper.jukebox.position];

	var stream = ytdl(url, {filter : 'audioonly'});
	var dispatcher = voiceConnection.playStream(stream);

	Helper.construct.client.user.setStatus("online", Helper.jukebox.playlist.titles[Helper.jukebox.position]);
			
	dispatcher.on("end", function (error) {
		if ( error ) Helper.handleError(error);
		next(Helper.jukebox);
	});
	dispatcher.on("error", function (error) {
		if ( error ) Helper.handleError(error);
	});
}
YTDLCommand.prototype.execute = function() {
	var that = this.clone();
	var notPlaying = Helper.jukebox.playlist.urls.length == 0;
	var video = that.m_arguments;

	if ( that.m_message.content.search(new RegExp("^\.play-loop$")) === 0 ) {
		Helper.jukebox.loop = !Helper.jukebox.loop;
		Helper.replyMessage(that.m_message, "Toggled looping to `"+Helper.jukebox.loop+"`");
		Helper.deleteMessage(that.m_message);
		return;
	}
	if ( that.m_message.content.search(new RegExp("^\.play-(skip|next)$")) === 0 ) {
		next(Helper.jukebox);
		Helper.replyMessage(that.m_message, "Skipped to next video");
		Helper.deleteMessage(that.m_message);
		return;
	}
	if ( video === "" ) {
		// list playlist
		if ( that.m_message.content.search(new RegExp("^\.playlist$")) === 0 ) {
			var string = "Playlist position: `"+Helper.jukebox.position+"`, Loop: `"+Helper.jukebox.loop+"`\n```";
			for ( var i in Helper.jukebox.playlist.urls ) {
				string += "\t" + i + ": " + Helper.jukebox.playlist.urls[i] + ": " + Helper.jukebox.playlist.titles[i] + "\n";
			}
			string += "```";
			string = string.replace("``````", "``` ```");
			Helper.replyMessage(that.m_message, string);
			return;	
		}
		// default state
		if ( that.m_message.content.search(new RegExp("^\.frick$")) === 0 ) {
			Helper.jukebox.playlist.urls = [
				"https://www.youtube.com/watch?v=ElpYScRKREM",
				"https://www.youtube.com/watch?v=_4yDVKidRqA",
				"https://www.youtube.com/watch?v=MGXlr_hZYm4"
			];
			var that_m_persistence = Helper.jukebox;
			for ( var i in Helper.jukebox.playlist.urls ) {	
				var ii = i;
				var video = Helper.jukebox.playlist.urls[ii];
				ytdl.getInfo(video, function(err, info) {
					that_m_persistence.playlist.titles[ii] = info.title;
				});
			}
		}
	} else {
		if ( notPlaying ) {
			Helper.jukebox.playlist.urls = [];
			Helper.jukebox.playlist.titles = [];
		}
		Helper.jukebox.playlist.urls.push(video);
		Helper.jukebox.playlist.titles.push(video);
		var last = Helper.jukebox.playlist.urls.length;
		var that_m_persistence = Helper.jukebox;
		ytdl.getInfo(video, function(err, info) {
			Helper.replyMessage(that.m_message, "Added video: `"+info.title+"`");
			that_m_persistence.playlist.titles[last-1] = info.title;
		});
	}
	Helper.deleteMessage(that.m_message);

	if ( notPlaying ) {
		var array = Helper.construct.client.channels.array();
		for ( var key in array ) {
			var channel = array[key];
			if ( that.m_message.guild.id != that.m_message.guild.id ) continue;
			if ( channel && channel.name === "General" && channel.type === "voice" ) {
				if ( Helper.vc != null ) {
					Helper.vc.disconnect();
					Helper.vc = null;
				}
				channel.join().then(connection => {
					Helper.vc = connection;
					play( Helper.jukebox, connection);
				}).catch(Helper.handleError);
			}
		}
	}
}

YTDLCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new YTDLCommand();