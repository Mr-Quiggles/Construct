var Command = require("./command.js");
var Helper = require("../helper.js");

VaporwaveCommand.prototype = new Command();
function VaporwaveCommand() {
	// Static variables
	this.m_properties = { 											// Properties used for `.help`
		name: "vaporwave", 											// Name of command
		commands:  ["^\\.vaporwave$"], 								// Keyword(s) using regex
		usage: ".vaporwave", 										// Example usage
		description: "Toggles playing Floral Shoppe", 		// Description
		regex: true, 												// Does the command rely on commanding through regex?
		visible: true 												// Visible to `man` and `help`
	}
}
VaporwaveCommand.prototype.execute = function() {
	var that = this.clone();

	pplay = function( message, voiceConnection, folder, i, loop ) {
		if ( loop == null ) loop = true;
		var songs = require('fs').readdirSync(folder);
		var dispatcher = voiceConnection.playFile(folder + "/" + songs[i], {volume:0.125});//.catch(Helper.handleError);
		
		console.log("Now playing: " + folder + "/" + songs[i]);
		Helper.construct.client.user.setStatus("online", songs[i]);

		dispatcher.on("end", function (error) {
			if ( error ) Helper.handleError(error, message);

			var voiceChannel = Helper.vc.channel;
			if ( Helper.vc != null ) {
				Helper.vc.disconnect();
				Helper.vc = null;
			}
			voiceChannel.join().then(connection => {
				Helper.vc = connection;
				if ( i + 1 >= songs.length && !loop ) return;
				var next = (( i + 1 >= songs.length ) ? 0 : i + 1);
				pplay( message, connection, folder, next );
			}).catch(Helper.handleError);
		});
		dispatcher.on("error", function (error) {
			if ( error ) Helper.handleError(error, message);
		});
	};

	Helper.deleteMessage(that.m_message);
	var array = Helper.construct.client.channels.array();
	for ( var key in array ) {
		var channel = array[key];
		if ( that.m_message.guild.id != that.m_message.guild.id ) continue;
		if ( channel && channel.name === "ｖａｐｏｒｗａｖｅ" && channel.type === "voice" ) {
	//	if ( channel && channel.id == 105257612311851008 && channel.type === "voice" ) {
	//	if ( channel && channel.name === "General" && guild.name === "/furry/" && channel.type === "voice" ) {
			if ( Helper.vc != null ) {
				Helper.vc.disconnect();
				Helper.vc = null;
			}
			channel.join().then(connection => {
				Helper.vc = connection;
			//	Helper.playFolder(that.m_message, connection, "./data/audio/vaporwave", 0);
				pplay(that.m_message, connection, "./data/audio/vaporwave", 0);
			}).catch(Helper.handleError);
		}
	}	
}

VaporwaveCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new VaporwaveCommand();

