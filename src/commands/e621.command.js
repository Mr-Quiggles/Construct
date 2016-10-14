var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");

E621Command.prototype = new Command();
function E621Command() {
	// Static variables
	this.m_properties = { 													// Properties; used for `.help`
		name: "e621", 														// Name of command
		commands:  ["^\\.e621 .*$", "^\\.e .*$", "^\\.e621# \\d*$", "^\\.e# \\d*$"], 			// Keyword(s) using regex
		usage: ".e621 [tags]", 			// Example usage
		description: "Searches e621 according to [tags]; .e returns a minimalized response", 		// Description
		regex: true, 														// Does the command rely on commanding through regex?
		visible: true 														// Visible to `man` and `help`
	}
}

E621Command.prototype.execute = function() {
	var that = this.clone();
	var full = that.m_message.content.search(new RegExp("^\.e621")) === 0;
	var idGiven = that.m_message.content.search(new RegExp("^\.e(621|)#")) === 0;
	var query = that.m_arguments;

	var options = {
		host: 'e621.net',
		port: 443,
		method: 'GET',
		path: (idGiven) ? ("/post/show.json?id=" + query) : ("/post/index.json?tags=" + query + "+order:random"),
//		path: (idGiven) ? ("/post/show.json?id=" + query) : ("/post/index.json?tags=" + (query.replace("-mlp","")+"+mlp")+ "+order:random"),
		headers: {
			'User-Agent': "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:38.9) Gecko/20100101 Goanna/2.1 Firefox/38.9 PaleMoon/26.3.3",
		}
	};
	https.get(options, function(res) {
		var returned = '';
		
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			returned += chunk;
		});
		
		res.on('end', function() {
			var parsed = JSON.parse(returned);
			if (idGiven) parsed = [parsed];
			if (parsed.length == 0) {
				// error
				Helper.replyMessage(that.m_message, "No matches (Tags: `" + Helper.combine(query.split("+"), " ") + "`)");
			} else {
				var i = 0;
				var image = parsed[i];
				if ( !image ) {
					Helper.handleError("A JSON error occurred!");
					return;
				}
				var file_url = image.file_url;
				var id = image.id;
				var url = "https://e621.net/post/show/"+id;
				var artist = image.artist;
				var source = image.source;
				var score = image.score;
				var rating = image.rating;
				var size = image.width + "x" + image.height + "@" + (Helper.humanFileSize(image.file_size));
				var tags = image.tags.replace(new RegExp(" ", 'g'), ", ");
				var reply = "#" + id + ": " + file_url;
				if ( full ) {
					var reply = 
					"__**Image**__: " + file_url + 
					"\n__**URL**__: " + url + 
					"\n__**Artist**__: " + artist; 
					"\n__**Score**__: " + score + 
					"\n__**Rating**__: " + rating + 
					"\n__**Size**__: " + size + 
					"\n__**Tags**__: `{\n\t" + tags + "\n}`" +
					"";
				}
				Helper.replyMessage(that.m_message, reply);
			}
		});
	});
}

E621Command.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), "+");
}


// Export
module.exports = new E621Command();