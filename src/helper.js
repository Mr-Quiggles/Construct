var fs = require("fs");

var Helper = {
	construct: null,
	client: null,
	vc: null,
	jukebox: {
		loop: false,
		position: 0,
		playlist: {
			urls:[],
			titles:[]
		}
	}
};
// Generate HTML
Helper.generateHtml = function(data) {
	var time = {
		hour: new Date().getHours(),
		min: new Date().getMinutes(),
	}
	time.hour = (time.hour < 10 ? "0" : "") + time.hour;
	time.min = (time.min < 10 ? "0" : "") + time.min;

	var regex = {
		avatar: new RegExp("\\{\\$AVATAR\\}"),
		username: new RegExp("\\{\\$USERNAME\\}"),
		timestamp: new RegExp("\\{\\$TIMESTAMP\\}"),
		message: new RegExp("\\{\\$MESSAGE\\}"),
		color: new RegExp("\\{\\$COLOR\\}"),
	}
	var user = {
		avatar: data.target.avatarURL,
		username: data.target.username,
		timestamp: "Today at "+(time.hour%12==0?12:(time.hour%12))+":"+time.min+" "+(time.hour>12?"P":"A")+"M",
		message: data.content,
		color: "255,255,255",
	}

	var gmember = data.message.guild.member(data.target);
	if ( gmember && gmember.nickname != null && gmember.nickname !== user.username ) user.username = gmember.nickname;

	if( data.message.guild ) {
		var roles = data.message.guild.member(data.target).roles.array();
		for ( var i in roles ) {
			var role = roles[i];
			if ( role.color ) {
				function hexToRgb(hex) {
				    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
				    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
				    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				        return r + r + g + g + b + b;
				    });

				    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				    return result ? {
				        r: parseInt(result[1], 16),
				        g: parseInt(result[2], 16),
				        b: parseInt(result[3], 16)
				    } : null;
				}
				rgb = hexToRgb(role.hexColor);
				user.color = rgb.r+","+rgb.g+","+rgb.b;
			}
		}
	}

	user.message = Helper.formatHtml(user.message, data.message);

	var html = fs.readFileSync("./data/html/fabricator/quote.html").toString();
	html = html.replace(regex.avatar, user.avatar);
	html = html.replace(regex.username, user.username);
	html = html.replace(regex.timestamp, user.timestamp);
	html = html.replace(regex.message, user.message);
	html = html.replace(regex.color, user.color);
	return html;
}
Helper.formatHtml = function(html, message) {
	/* parse mentions */ {
		var regexp = new RegExp(/\<@(.+?)\>/g);
		var match;
		while (message && (match = regexp.exec(html))) {
			var id = match[1];
			if ( id.charAt(0)+"" === "!" )
				id = id.substring(1);

			var user = message.guild.member(id);
			var name = ( user.nickname != null && user.nickname !== user.username ) ? user.nickname : user.username;
			var replacement = "<span class=\"highlight\">"+"@"+name+"</span>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse code block tags */ {
		var regexp = new RegExp(/```((.|\n)*)```/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<pre><code class=\"hljs\">" + match[1] +"</code></pre>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse code tags */ {
		var regexp = new RegExp(/`(.+?)`/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<code class=\"inline\">" + match[1] +"</code>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse bold italics */ {
		var regexp = new RegExp(/\*\*\*(.+?)\*\*\*/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<strong><em>" + match[1] +"</em></strong>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse bold */ {
		var regexp = new RegExp(/\*\*(.+?)\*\*/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<strong>" + match[1] +"</strong>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse italics */ {
		var regexp = new RegExp(/\*(.+?)\*/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<em>" + match[1] +"</em>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse strikethrough */ {
		var regexp = new RegExp(/\~\~(.+?)\~\~/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<s>" + match[1] +"</s>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse underscore */ {
		var regexp = new RegExp(/\_\_(.+?)\_\_/g);
		var match;
		while (match = regexp.exec(html)) {
			var replacement = "<u>" + match[1] +"</u>";
			html = html.replace(match[0], replacement);
		}
	}
	/* parse URLS */ {	
		var regexp = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
		var matches = html.match(regexp);
		if ( matches )
		for ( var i = 0; i < matches.length; ++i ) {
			var url = matches[i];
			var replacement = "<a href=\""+url+"\">"+url+"</a>";
			html = html.replace(url, replacement);
		}
	}

	return html;
}
// Upload
Helper.upload = function(data,callback) {
	var https = require('https');
	var formData = require('form-data');
	var form = new formData();
	form.append('k', "placeholder");
	if ( data.filename && !data.contents )
		form.append('uf[]', fs.createReadStream(data.filename));
	else if ( data.contents )
		form.append('uf[]', data.contents, {
			filename: data.filename
		});

	var options = {
		method: 'post',
		host: 'bambis.cat',
		path: '/uf/sh/upload/',
		headers: form.getHeaders()
	}
	var request = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(body) {
			try {
				var json = JSON.parse(body);
				callback(json);
			} catch (e) {
				
			}
		});
	});
	form.pipe(request);
}
// Prints to console
Helper.println = function( message ) {
	var time = new Date(Date.now());
	var msg = "["+time.toISOString()+"] ["+Helper.construct.name+"] "+message;
	console.log(msg);

	var bot_id = Helper.construct.id;
	var yyyymmdd = "" + time.getUTCFullYear() + time.getUTCMonth() + time.getUTCDate();
	fs.appendFileSync("./data/logs/["+bot_id+"] "+yyyymmdd+".log", msg+"\n");
}
// Truncates a message
Helper.truncateMessage = function ( response ) {
	return response.substring(0,2000);
}
// Truncates a reply
Helper.truncateReply = function ( response, max ) {
	var lim = 2000;
	var responses = [];
	while ( response !== "" ) {
		var tmp = response.substring(0,lim);
		responses.push(tmp);
		response = response.substring(lim);
		if ( responses.length >= max ) break;
	}
	return responses;
}
// Spits out errors
Helper.handleError = function( error, message ) {
	// Helper.println(error);
	Helper.println(error);
	error = "```" + error + "```";
	if ( message ) {
		Helper.replyMessage(message, error);
	} else if ( Helper.client ) {
		var errorChannel = Helper.getChannel("debug");
		if ( errorChannel ) Helper.sendMessage(errorChannel, error).catch(console.log);
	}
}
// Get channel by name, and by server, if provided.
Helper.getChannel = function( options ) {
	if ( options && !options.channel ) { // options is string
		var name = options;
		options = {
			channel: name,
		}
	} 
	for ( var key in Helper.client.channels.array() ) {
		var channel = Helper.client.channels.array()[key];
		if ( !channel ) continue;

		if ( options.channel !== channel.name ) continue;
		if ( options.type ) if ( channel.type && channel.type !== options.type ) continue;
		return channel;
	}
	return null;
}
// Attempts to delete a message
Helper.sendFile = function( channel, path, filename, callback ) {
	return channel.sendFile( path, filename ).catch(Helper.handleError).then(message => {callback(message)});
}
Helper.deleteMessage = function( message, options, callback ) {
	if (callback == null) callback = function(){};
	return message.delete( options ).catch(Helper.handleError).then(message => {callback(message)});
}
// Attempt to send a message, with proper error handling
Helper.sendMessage = function( channel, message, m ) {
/*
	var data = {
		target: target,
		message: that.m_message,
		content: that.m_arguments
	}
	var html = Helper.generateHtml(data);
*/
	if ( !m ) {
		m = {};
		m.id = new Date().getTime();
		m.channel = channel;
		m.guild = channel.guild;
	}
	if ( message.length >= 2000 )
		Helper.upload({
			filename: (m.id) + ".html",
			contents: Helper.generateHtml({target: Helper.construct.client.user, message: m, content: message})
		}, function(json){
			var response = "Message too long: " + json.url;
			return channel.sendMessage(response).catch(Helper.handleError);
		})
	else
		return channel.sendMessage(message).catch(Helper.handleError);
}
Helper.fromBot = function( message ) {
	if ( !message || !message.author ) return false;
	return message.author.id+"" == Helper.construct.id;
}
Helper.mentionUser = function( message ) {
	return "<@"+message.author.id+">"
}
Helper.userFromMessage = function( message ) {
	return "<@"+message.author.username+">"
}
Helper.commandEnabled = function( channel, command ) {
	return Helper.construct;
}
// Attempt to reply to a message, with proper error handling
Helper.replyMessage = function( message, reply ) {
	if ( message.author.id != Helper.construct.id ) {
		reply = ( reply.search(new RegExp("^```css\\n")) === 0 )
		? reply.replace(new RegExp("^```"), Helper.mentionUser(message)+"```")
		: Helper.mentionUser(message)+": " + reply;
	}
	return Helper.sendMessage(message.channel, reply, message);
}
// Attempt to PM a user
Helper.pmUser = function( user, message, callback ) {
/*
	var pmChans = Helper.construct.client.internal.private_channels;
	for ( var key in pmChans ) {
		var chan = pmChans[key];
		Helper.construct.client.getChannelLogs(chan, 50, function(error, messages){
			if ( error ) {
				Helper.handleError(error);
				return;
			}
			for ( var kkey in messages ) {
				var msg = messages[kkey];
				if ( msg.author.id == user ) {
					Helper.sendMessage(msg.channel, message, callback(error));
					return;
				}
			}
		});
	}
	if ( !callback ) {
		Helper.handleError("Failed to find supplied user! Perhaps they never sent a PM?");
	} else {
		callback("Failed to find supplied user! Perhaps they never sent a PM?");
	}
*/
}
// Is Privileged Enough
Helper.privilege = function( user ) {
	if ( !user.id ) {
		var id = user;
		user = { id: id };
	}
	return (user.id+"") === "170271159441424384";
}
Helper.privileged = function( message ) {
	var content = message.content;
	var privileges = Helper.construct.containers.permissions;
	var priority = privileges.priority;
	var server = {
		id: ""+message.channel.id,
		mode: null,
		priority: null,
		fallback: null,
		matched: null,
	}
	if ( message.guild ) {
		server.id = message.guild.id;
	}
	var user = {
		id: ""+message.author.id,
		mode: null,
		priority: null,
		fallback: null,
		matched: null,
	}

	var check = function( type, table, id ) {
		if ( !id ) id = type.id;
		if ( id in table ) {
			type.mode = table[id].mode;
			type.priority = table[id].priority;
			var commands = table[id].matches;
			for ( var i = 0; i < commands.length; ++i ) {
				var command = commands[i];
				var matched = content.search(new RegExp(command)) >= 0;
				if ( type.matched == null && matched ) type.matched = true;
			}
			return true;
		}
		return false;
	}
	var exists = check(server, privileges.servers);
	if ( (!exists||server.fallback) && server.matched == null ) check(server, privileges.servers, "*");

	var exists = check(user, privileges.users);
	if ( (!exists||user.fallback) && user.matched == null ) check(user, privileges.users, "*");

	if ( user.mode === server.mode ) {
		if ( user.mode === "blacklist" ) return !(user.matched || server.matched);
		if ( user.mode === "whitelist" ) return user.matched && server.matched;
	}
	if ( server.matched == null && server.mode == "blacklist" ) server.matched = false;
	if ( server.matched == null && server.mode == "whitelist" ) server.matched = true;
	if ( user.matched == null && user.mode == "blacklist" ) user.matched = false;
	if ( user.matched == null && user.mode == "whitelist" ) user.matched = true;

	if ( user.priority && !server.priority ) {
		if ( user.mode === "whitelist" && user.matched ) return true;
		if ( user.mode === "blacklist" && user.matched ) return false;
		if ( server.mode === "whitelist" && server.matched ) return true;
		if ( server.mode === "blacklist" && server.matched ) return false;
	} else if ( server.priority && !user.priority ) {
		if ( server.mode === "whitelist" && server.matched ) return true;
		if ( server.mode === "blacklist" && server.matched ) return false;
		if ( user.mode === "whitelist" && user.matched ) return true;
		if ( user.mode === "blacklist" && user.matched ) return false;
	} else if ( server.priority == user.priority ) {
		if ( privileges.priority === "user" ) {
			if ( user.mode === "whitelist" && user.matched ) return true;
			if ( user.mode === "blacklist" && user.matched ) return false;
			if ( server.mode === "whitelist" && server.matched ) return true;
			if ( server.mode === "blacklist" && server.matched ) return false;
		} else if ( privileges.priority === "server" ) {
			if ( user.mode === "whitelist" && user.matched ) return true;
			if ( user.mode === "blacklist" && user.matched ) return false;
			if ( server.mode === "blacklist" && server.matched ) return false;
			if ( server.mode === "blacklist" && server.matched ) return false;
		}
	}

	return false;
}
Helper.playFolder = function( message, voiceConnection, folder, i, loop ) {
	if ( loop == null ) loop = true;
	var songs = fs.readdirSync(folder);
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
			Helper.playFolder( message, connection, folder, next );
		}).catch(Helper.handleError);
	});
	dispatcher.on("error", function (error) {
		if ( error ) Helper.handleError(error, message);
	});
}
Helper.playPlaylist = function( message, voiceConnection, songs, i, loop ) {
	if ( loop == null ) loop = true;
	var ytdl = require('ytdl');
	var url = songs[i];
	var stream = ytdl(url, {filter : 'audioonly'});
	var dispatcher = voiceConnection.playStream(stream);//.catch(Helper.handleError);

	console.log("Now playing: " + url);
	Helper.construct.client.user.setStatus("online", url);
	ytdl.getInfo(url, function(err, info) {
		console.log("Now playing: " + info.title);
		Helper.construct.client.user.setStatus("online", info.title);
	});
			
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
			Helper.playPlaylist( message, connection, songs, next );
		}).catch(Helper.handleError);
	});
	dispatcher.on("error", function (error) {
		if ( error ) Helper.handleError(error, message);
	});
}
// Gets a response from the API server
Helper.queryApi = function ( url, callback ) {
	var request = { url: url };
	var response = { end: callback, writeHead: function(){} };
	return Helper.construct.broadcastHttpRequest( request, response );
}
// Split a `string` by `char`, and drops the `n` elements from the start, and `o` elements from the end.
Helper.split = function( string, char, n, o ) {
	var args = string.split(char);
	return args.slice(n,o);
}
// Combines an `array` by char, and drops the `n` elements from the start, and `o` elements from the end
Helper.combine = function( array, char, n, o ) {
	var ret = "";
	for ( var i = (n||0); i < array.length-(o||0); ++i ) {
		ret+=array[i];
		if (i + 1 != array.length-(o||0)) ret+=char;
	}
	return ret;
}
// Logs
Helper.log = function( message ) {
	var bot_id = Helper.construct.id;
	var time = message.timestamp.toISOString();
	var yyyymmdd = "" + message.timestamp.getUTCFullYear() + message.timestamp.getUTCMonth() + message.timestamp.getUTCDate();
	var server_name = (message.guild != null) ? message.guild.name : message.author.name;
	var server_id = (message.guild != null) ? message.guild.id : message.author.id;
	var channel = message.channel.name;
	var channel_id = message.channel.id;
	var user = message.author.username;
	var user_id = message.author.id;
	var msg = message.content;

	var log = "["+time+"] <"+server_name+" #"+channel+" @"+user+">: "+msg+"\n";
	fs.appendFileSync("./data/logs/["+bot_id+"] "+yyyymmdd+".log", log);
}
// Convert to readable human file size
Helper.humanFileSize = function(size) {
	var i = Math.floor( Math.log(size) / Math.log(1024) );
	return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'KiB', 'MiB', 'GiB', 'TiB'][i];
};

// Export
module.exports = Helper;