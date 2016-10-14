var Command = require("./command.js");
var Helper = require("../helper.js");

YdkCommand.prototype = new Command();
function YdkCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "ydk", 							// Name of command
		commands:  ["^\\.ydk .*$"], 				// Keyword(s) using regex
		usage: ".ydk [url]", 						// Example usage
		description: "Parses a .ydk file", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true, 								// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "ydk",
		path: "ydk",
		usage: "/ydk?url={URL}&format=(compact|expanded)",
		description: "Parses a .ydk file, returning human readable JSON",
		enabled: true,
		visible: true
	};
	this.m_persistence = {
		db : "./data/yugioh/cards.cdb"
	};
}
YdkCommand.prototype.connect = function( request, response, uri ) {
	var that = this.clone();
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(that.m_persistence.db);
	
	var url = uri.query.url;
	var format = uri.query.format ? uri.query.format : "compact";
	require("request").get({url: url, encoding: 'binary'}, function (err, r, ydk) {
		if(err) {
			Helper.handleError(err,that.m_message);
			return;
		}

		ydk = ydk.replace(/(?:\r\n|\r|\n)/g, '\n');
		var deck = {main:{},side:{},extra:{}};
		deck.main = {ids: "", cards: {}}; /* parse main */ {
			var raw = /#main\n([\s\S]+?)#extra/gi;
			var regexp = new RegExp(raw);
			var match = regexp.exec(ydk);
			if ( match ) deck.main.ids = match[0].split("\n");
		}
		deck.extra = {ids: "", cards: {}}; /* parse extra */ {
			var raw = /#extra\n([\s\S]+?)\!side/gi;
			var regexp = new RegExp(raw);
			var match = regexp.exec(ydk);
			if ( match ) deck.extra.ids = match[0].split("\n");
		}
		deck.side = {ids: "", cards: {}}; /* parse side */ {
			var raw = /\!side\n([\s\S]+?)$/gi;
			var regexp = new RegExp(raw);
			var match = regexp.exec(ydk);
			if ( match ) deck.side.ids = match[0].split("\n");
		}
		var i = 0;
		db.each("SELECT id, name from texts", function(e, row){
			if(err) { Helper.handleError(err,that.m_message); return; }
			var id = row.id+"";
			var name = row.name;

			var main_count = 0;
			var extra_count = 0;
			var side_count = 0;

			if ( deck.main.ids.indexOf(id)>0) main_count =deck.main.ids.filter(function(x){return x==id}).length;
			if ( deck.extra.ids.indexOf(id)>0) extra_count =deck.extra.ids.filter(function(x){return x==id}).length;
			if ( deck.side.ids.indexOf(id)>0) side_count =deck.side.ids.filter(function(x){return x==id}).length;

			if ( format === "expanded" ) {
				if ( main_count > 0) deck.main.cards[name] = { name: name, count: main_count, set: "????" }; //, position: ++i };
				if ( extra_count > 0) deck.extra.cards[name] = { name: name, count: extra_count, set: "????" }; //, position: ++i };
				if ( side_count > 0) deck.side.cards[name] = { name: name, count: side_count, set: "????" }; //, position: ++i };
			} else {
				if ( main_count > 0) deck.main.cards[name] = main_count; //, position: ++i };
				if ( extra_count > 0) deck.extra.cards[name] = extra_count; //, position: ++i };
				if ( side_count > 0) deck.side.cards[name] = side_count; //, position: ++i };
			}
		}, function(){
			var combined = {
				main: deck.main.cards,
				extra: deck.extra.cards,
				side: deck.side.cards
			};
			response.end(JSON.stringify(combined, null, "\t"));
			db.close();
		});
	});
}

YdkCommand.prototype.execute = function() {
	var that = this.clone();
	
	var url = that.m_arguments;
	var response = {
		end: function( string ) {
			var deck = JSON.parse(string);
			var reply = "\n";
			reply += "```Main Deck: "+JSON.stringify(deck.main, null,"\t")+"```\n";
			reply += "```Extra Deck: "+JSON.stringify(deck.extra, null,"\t")+"```\n";
			reply += "```Side Deck: "+JSON.stringify(deck.side, null,"\t")+"```\n";
			Helper.replyMessage(that.m_message, reply);
		}
	}
	this.connect(null, response, require("url").parse("/?url="+that.m_arguments, true));
}
YdkCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}

// Export
module.exports = new YdkCommand();