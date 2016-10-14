var Command = require("./command.js");
var Helper = require("../helper.js");

YdkPriceCommand.prototype = new Command();
function YdkPriceCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "ydkprice", 							// Name of command
		commands:  ["^\\.ydkprice .*$"], 				// Keyword(s) using regex
		usage: ".ydkprice [url]", 						// Example usage
		description: "Parses a .ydk file", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true, 								// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "ydkprice",
		path: "ydkprice",
		usage: "/ydkprice?url={URL}&use=(min|max|average)&mode=(ydk|json|guess)&booji",
		description: "Parses a .ydk file (or JSON equivalent) pricing it out using min, max, or average pricing.",
		enabled: true,
		visible: true
	};
	this.m_persistence = {
		db : "./data/yugioh/cards.cdb"
	};
}
YdkPriceCommand.prototype.connect = function( request, response, uri ) {
	var that = this.clone();

	var url = uri.query.url;
	var level = uri.query.use ? uri.query.use : "average";
	var mode = uri.query.mode ? uri.query.mode : "guess";
	var booji = uri.query.booji != undefined;
	
	var isJson = function(str) {try {JSON.parse(str);} catch (e) {return false;}return true;}
	var first = function( array ) {for ( var x in array ) return x;}
	var last = function( array ) {var y; for ( var x in array ) {y=x;} return y;}

	var thing = function(string){
		var decks = JSON.parse(string);

		var job = 0;
		var jobs = Object.keys(decks.main).length + Object.keys(decks.extra).length + Object.keys(decks.side).length;

		Object.keys(decks).forEach(function(k) {
			var deck = decks[k];
			deck.price = 0;
			Object.keys(deck).forEach(function(key) {
				var card = deck[key];
				var name = card.name;
				var set = card.set;
				var count = card.count;
				Helper.queryApi("/ygoprices?name="+name, function( ygopricesString ) {
					if ( name == undefined ) return; 
					
					++job;
					var data = JSON.parse(ygopricesString);
					if ( data.status === "error" ) return;
					if ( set === "????" || data[set] == undefined ) set = booji ? last(data) : first(data);
					if (data[set] == undefined ) return;
					deck.price += count * data[set].prices[level];

					if ( job >= jobs ) {
						var res = {
							main: decks.main.price.toFixed(2),
							extra: decks.extra.price.toFixed(2),
							side: decks.side.price.toFixed(2),
							total: (decks.main.price + decks.extra.price + decks.side.price).toFixed(2),
							method: level,
							booji: booji
						};
						response.end(JSON.stringify(res, null, "\t"));
					}
				});
			});
		});
	}

	// Check if JSON
	if ( mode === "guess" ) {
		require("request").get({url: url, encoding: 'binary'}, function (err, r, json) {
			if(err) {
				response.end({status: 'error', code: err}, null, "\t");
				return;
			}
			isJson(json) ? thing(json) : Helper.queryApi("/ydk?url="+url+"&format=expanded", function( string ) {thing(string)});	
		});
	} else if ( mode === "json" ) {	
		require("request").get({url: url, encoding: 'binary'}, function (err, r, json) {
			if(err) {
				response.end({status: 'error', code: err}, null, "\t");
				return;
			}
			if (!isJson(json)) {
				response.end({status: 'error', code: "url is not valid json!"}, null, "\t");
				return;
			}
			thing(json);
		});
	} else if ( mode === "ydk" ) {
		Helper.queryApi("/ydk?url="+url+"&format=expanded", function( string ) {thing(string)});
	}
}

YdkPriceCommand.prototype.execute = function() {
	var that = this.clone();
	
	var url = that.m_arguments;
	var response = {
		end: function( string ) {
			var result = JSON.parse(string);
			if ( result.status === "error" ) {
				Helper.replyMessage(that.m_message, "Error: ```" + result.code + "```");
				return;
			}
			var reply = "Price for deck @ " + url + ":\n";
			reply += "**__Main:__** `$" + result.main + "`\n";
			reply += "**__Extra:__** `$" + result.extra + "`\n";
			reply += "**__Side:__** `$" + result.side + "`\n";
			reply += "**__Total:__** `$" + result.total + "`\n";
			Helper.replyMessage(that.m_message, reply);
		}
	}
	this.connect(null, response, require("url").parse("/?url="+that.m_arguments, true));
}
YdkPriceCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new YdkPriceCommand();