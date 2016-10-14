var Command = require("./command.js");
var Helper = require("../helper.js");
var http = require("http");
var cheerio = require("cheerio");

YugiohCommand.prototype = new Command();
function YugiohCommand() {
	// Static variables
	this.m_properties = { 																				// Properties; used for `.help`
		name: "yugioh", 																				// Name of command
		commands: ["^\\.yugioh .*$", "^\\.ygo .*$"], 													// Keyword(s) using regex
		usage: ".ygo [card]", 																			// Example usage
		description: "Posts the (hopefully correct) first result of a yugioh wiki search for a card", 	// Description
		regex: true, 																					// Does the command rely on commanding through regex?
		visible: true, 																					// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "yugioh",
		path: "ygo",
		usage: "/ygo?name={Card}",
		description: "Returns the (hopefully correct) first result of a yugioh wiki search for a card",
		enabled: true,
		visible: true
	}
}

YugiohCommand.prototype.connect = function( request, response, uri ) {
	var query = encodeURIComponent(uri.query.name);
	var search = function(url, callback){		
		var options = {
			host: 'yugioh.wikia.com',
			method: 'GET',
			path: url,
		};
		http.get(options, function(res) {
			var returned = '';
			
			res.setEncoding('utf8');
			res.on('data', function(chunk) {returned += chunk;});
			res.on('end', function() { callback(returned); });
		});
	}

	search("/api/v1/Search/List/?query="+query+"&limit=1&format=json", function(returned){
		var parsed = JSON.parse(returned);
		var baseString = "http://yugioh.wikia.com/wiki/"
		var fullUrl = parsed.items[0].url;
		var pathUrl = fullUrl.substring(fullUrl.indexOf(baseString)+baseString.length);
		search("/api.php?format=json&action=parse&prop=text&page="+pathUrl+"&*", function(result){
			var parsedJSON;
			try {
				parsedJSON = JSON.parse(result);
			} catch(e) {
				Helper.handleError(e, that.m_message);
				return;
			}
			var html = parsedJSON.parse.text["*"];
			var $ = cheerio.load(html);
			if ( $("*").find('th a[title="Passcode"]').length == 0 ) {
				response.end(JSON.stringify({status: 'error', code: 'Invalid card name'}, null, 2));
				return
			}
			var card = {
				name: $('.cardtable').find('tr.cardtablerow td.cardtablerowdata').eq(0).text().trim(),
				image: $('.cardtable').find('td.cardtable-cardimage').eq(0).find('img').eq(0).attr('src').trim(),
				type: "Other",
				effect: $('.cardtable').find('td table table').eq(0).find('tr').eq(2).find('td').eq(0).text().trim(),
				status: $('.cardtablerowdata').find('a[title="Advanced Format"]').eq(0).parents('td').eq(0).text().trim(),
				passcode: $(".cardtable").find('th a[title="Passcode"]').eq(0).parents('tr').eq(0).find('td').eq(0).text().trim()
			}
			if ( $('.cardtable').find('img[alt="TRAP"]').length ) card.type = "Trap";
			else if ( $('.cardtable').find('img[alt="SPELL"]').length ) card.type = "Spell";
			else if ( $('.cardtable').find('th a[title="Type"]').length ) card.type = "Monster";

			if ( card.type === "Monster" ) {
				card.attribute = ($('.cardtable').find('th a[title="Attribute"]').eq(0).parents('tr').eq(0).find('td a').eq(0).text().trim());
				if ( $('.cardtable').find('th a[title="Level"]') ) {
					card.level = $('.cardtable').find('th a[title="Level"]').eq(0).parents('tr').eq(0).find('td a').eq(0).text().trim();
				} else {
					card.rank = $('.cardtable').find('th a[title="Rank"]').eq(0).parents('tr').eq(0).find('td a').eq(0).text().trim();
				}
				card.subType = $('.cardtable').find('th a[title="Type"]').eq(0).parents('tr').eq(0).find('td').eq(0).text().trim();
				card.attack = ($('.cardtable').find('th a[title="ATK"]').eq(0).parents('tr').eq(0).find('td').eq(0).text()).split('/')[0].trim();
				card.defense = ($('.cardtable').find('th a[title="ATK"]').eq(0).parents('tr').eq(0).find('td').eq(0).text()).split('/')[1].trim();
			} else if (  card.type === "Spell" || card.type === "Trap" ) { 
				card.subType = ($('.cardtable').find('th a[title="Property"]').eq(0).parents('tr').eq(0).find('td a').eq(0).text());
			}
			card.hqImage = "https://grimgr.am/uf/ygo/pics/"+card.passcode+".jpg";

			response.end(JSON.stringify(card, null, "\t"));
		})
	});
}

YugiohCommand.prototype.execute = function() {
	var that = this.clone();
	var full = that.m_message.content.search(new RegExp("^\.yugioh")) === 0;
	var query = Helper.combine(Helper.split(that.m_arguments, " "), "+");
	if ( query == "pot+of+greed" ) {
		Helper.sendFile(that.m_message.channel, "./data/images/greed.jpg", "greed.jpg", Helper.fromBot(that.m_message)?"":Helper.mentionUser(that.m_message));
		return;
	}
	
	var response = {
		end: function( string ) {
			var card = JSON.parse(string);
			var reply = ""+ card.image + "\n";
			reply += "__**Name:**__ " + card.name + "\n";

			if ( card.type === "Monster" ) {
				reply += "__**Attribute:**__ " + card.attribute + "\n" +
				"__**"+(card.level?"Level":"Rank")+":**__ " + (card.level?card.level:card.rank) + "\n" +
				"__**Type:**__ " + card.subType + "\n" +
				"__**Effect:**__ " + card.effect + "\n" +
				"__**ATK/DEF:**__ " + card.attack + "/" + card.defense + "\n";
			} else if (  card.type === "Spell" || card.type === "Trap" ) { 
				reply += "__**Type:**__ " + card.subType + " " + card.type + "\n" + 
				"__**Effect:**__ " + card.effect + "\n";
			}
			reply += "__**Status:**__ " + card.status + "\n";

			if ( card.status === "error" )  {
				Helper.replyMessage(that.m_message, "Error: " + card.code);
				return;
			}
			Helper.replyMessage(that.m_message, (full)?reply:card.image)
		}
	}
	this.connect(null, response, require("url").parse("/?name="+query, true));
}

YugiohCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new YugiohCommand();