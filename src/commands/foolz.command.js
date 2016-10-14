var Command = require("./command.js");
var Helper = require("../helper.js");
var https = require("https");
var cheerio = require("cheerio");

FoolzCommand.prototype = new Command();
function FoolzCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "foolz", 									// Name of command
		commands: ["\\.foolz \/.*\/.*", "\\.foolz-random \/.*\/.*", "\\.foolz-upload \/.*\/.*", "\\.foolz-random-upload \/.*\/.*"], 						// Keyword(s) using regex
		usage: ".foolz /[board]/[query]", 							// Example usage
		description: "Posts the first/a random post from a search on fireden.net", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	}
}

FoolzCommand.prototype.execute = function() {
	var that = this.clone();
	var query = that.m_arguments;

	var options = {
		host: 'boards.fireden.net',
//		host: 'archived.moe',
		method: 'GET',
		path: encodeURI(query),
	};
	try {
		https.get(options, function(res) {
			var returned = '';
			
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				returned += chunk;
			});
			res.on('end', function() {			
				var $ = cheerio.load(returned);
				var posts = $("article.post");
				var rand = (that.m_message.content.search(new RegExp("^\\.foolz-random(-upload|)"))=== 0)?Math.floor( Math.random() * posts.length ):0;
				var shouldDL = 	(that.m_message.content.search(new RegExp("^\\.foolz-(random-|)upload"))=== 0);

				function htmlDecodeWithLineBreaks(html) {
					var breakToken = '_______break_______',
					lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken).replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + '$1' + breakToken);
					return $('<div>').html(lineBreakedHtml).text().replace(new RegExp(breakToken, 'g'), '\n');
				}

				posts.each(function(i, element){
					if ( i != rand ) return;
					var output = "";
					var post = $(this).children(".post_wrapper");
					var file = post.children(".post_file").children("a.post_file_filename");
					var fileUrl = (file)?file.attr("href"):"";
					var filenameActual = (file.attr("title"))?file.attr("title").trim():"";
					var filenameServer = (fileUrl)?fileUrl.split("/").pop():"";
					var meta = post.children(".post_file").children("span.post_file_metadata");
					var href = post.children("header").children(".post_data").children("span.post_controls").children("a.btnr[href]").attr("href");
					var header = post.children("header").children().text().replace("ViewReport","").trim();
					var text = htmlDecodeWithLineBreaks( post.children(".text").html() ).trim();
					output += href + "\n";
					if ( fileUrl && !shouldDL ) output += (fileUrl) + "\n";
					if ( fileUrl ) {
						output += "```" + "\n";
						output += filenameActual + ", " + meta.text().trim() + "\n";
						output += "```";
					}
					if ( header ) {
						output += "```" + "\n";
						output += header + "\n";
						output += "```";
					}
					if ( text ) {
						output += "```css" + "\n";
						output += text + "\n";
						output += "```";
					}
					
					if ( fileUrl && shouldDL ) {
						Helper.replyMessage(that.m_message, "Downloading/Uploading "+fileUrl+"...").then(message1 => {
							process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
							function doThing() {
								Helper.deleteMessage(message1);
								Helper.sendFile(that.m_message.channel, "./data/images/foolz/"+filenameServer, filenameActual, output);
							}
							require('fs').stat("./data/images/foolz/"+filenameServer, function(err, stat) {
								var exists = (err == null);
								if ( !exists ) {
									require('request').get({url: fileUrl, encoding: 'binary'}, function (err, response, body) {
										if(err) { Helper.handleError(err,that.m_message); return; }
										require('fs').writeFile("./data/images/foolz/"+filenameServer, body, 'binary', function(err2) {
											if(err2) { Helper.handleError(err2,that.m_message); return; }
											doThing();
										});
									});
								} else doThing();
							});
						});
					} else Helper.replyMessage(that.m_message, output);
				})

			});
		}).on('error', e => {
			Helper.handleError(e);
		});
	} catch ( e ) {
		Helper.handleError(e);
	}
}

FoolzCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new FoolzCommand();