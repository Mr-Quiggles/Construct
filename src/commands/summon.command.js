var Command = require("./command.js");
var Helper = require("../helper.js");
var http = require("http");
var cheerio = require("cheerio");

SummonCommand.prototype = new Command();
function SummonCommand() {
	// Static variables
	this.m_properties = { 									// Properties; used for `.help`
		name: "summon", 									// Name of command
		commands: ["^\\.summon$"], 						// Keyword(s) using regex
		usage: ".summon", 							// Example usage
		description: "Places a random card onto the field", 		// Description
		regex: true, 										// Does the command rely on commanding through regex?
		visible: true 										// Visible to `man` and `help`
	}
	this.m_uri = {
		name: "summon",
		path: "summon",
		usage: "/summon(?html)",
		description: "Places a random card onto the field",
		enabled: true,
		visible: true,
		contentType: "text/plain"
	}
}
SummonCommand.prototype.connect = function( request, response, uri ) {
	require("request").get({url: "http://yugioh.wikia.com/wiki/Special:Randomincategory/TCG_cards", encoding: 'binary'}, function (err, r, returned) {
		var html = returned;
		var $ = cheerio.load(html);
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
			card.type = $('.cardtable').find('th a[title="Type"]').eq(0).parents('tr').eq(0).find('td').eq(0).text().trim();
			card.attack = ($('.cardtable').find('th a[title="ATK"]').eq(0).parents('tr').eq(0).find('td').eq(0).text()).split('/')[0].trim();
			card.defense = ($('.cardtable').find('th a[title="ATK"]').eq(0).parents('tr').eq(0).find('td').eq(0).text()).split('/')[1].trim();
		} else if (  card.type === "Spell" || card.type === "Trap" ) { 
			card.type = ($('.cardtable').find('th a[title="Property"]').eq(0).parents('tr').eq(0).find('td a').eq(0).text());
		}
		card.hqImage = "https://grimgr.am/uf/ygo/pics/"+card.passcode+".jpg";
		var string = JSON.stringify(card, null, 2);
		if ( uri.query && uri.query.html != undefined ) {
			string = "<img src="+card.hqImage+" align='left' width=585vh heigh=585vh><pre>"+string+"</pre>";
		}

		response.end(string);
	});
}

SummonCommand.prototype.execute = function() {
	var that = this.clone();
	var full = false;

	var response = {
		end: function( string ) {
			var card = JSON.parse(string);
			Helper.replyMessage(that.m_message, card.image)
		}
	}
	this.connect(null, response, require("url").parse("/", true));
}

SummonCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new SummonCommand();