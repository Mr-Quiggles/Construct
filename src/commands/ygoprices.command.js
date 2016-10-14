var Command = require("./command.js");
var Helper = require("../helper.js");
var http = require("http");

YgoPrices.prototype = new Command();
function YgoPrices() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "ygoprices", 							// Name of command
		commands:  ["^\\.ygoprices .*$"], 			// Keyword(s) using regex
		usage: ".ygoprices [card]", 				// Example usage
		description: "Searches yugiohprices", 		// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true 								// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "yugiohprices",
		path: "ygoprices",
		usage: "/ygoprices?name={Card}",
		description: "Returns the (hopefully correct) card price data for a card using yugiohprices.com",
		enabled: true,
		visible: true
	}
}
YgoPrices.prototype.connect = function( request, response, uri ) {
	var that = this.clone();	

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
		var card_name = Helper.combine(Helper.split(pathUrl, "_")," ");
		that.m_arguments = card_name;	
		var options = {
			host: 'yugiohprices.com',
			method: 'GET',
			path: "/api/get_card_prices/" + encodeURIComponent(card_name.toLowerCase()),
		};
		http.get(options, function(res) {
			var returned = '';
			
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				returned += chunk;
			});
			res.on('end', function() {
				if (returned.length == 0) {
					response.end( JSON.stringify( { status: "error", code: "no matches" } ) );
					return;
				}
				var parsed = JSON.parse(returned);
				parsed.query = card_name;
				try {
					if ( parsed.status !== "success" ) throw returned;
				} catch(e) {
					response.end( JSON.stringify( { status: "error", code: ""+e } ) );
					return;
				}
				var json = {};
				for ( var i = 0; i < parsed.data.length; ++i ) {
					var data = parsed.data[i];
					var card = {
						name: that.m_arguments,
						set: data.print_tag,
						rarity: data.rarity.replace(" Rare",""),
						prices: {}
					};
					var pricedata = data.price_data;
					card.prices = {
						min: 0,
						max: 0,
						average: 0,
					}
					if (pricedata.status === "success") {
						var price = pricedata.data.prices;
						card.prices = {
							min: price.low.toFixed(2),	
							max: price.high.toFixed(2),	
							average: price.average.toFixed(2)
						};
					}
					json[card.set] = card;
				}
				response.end(JSON.stringify(json, null, "\t"));
			});
		});
	});
}

YgoPrices.prototype.execute = function() {
	var that = this.clone();
	var query = that.m_arguments;
	var response = {
		end: function( string ) {
			var parsed = JSON.parse(string);
			var reply = "";
			for ( var k in parsed ) {
				var card = parsed[k];
				if ( reply === "" ) reply = "Prices for `"+card.name+"`\n"
				reply += "`["+card.set+"]` `Min: $" + card.prices.min + "` `Max: $" + card.prices.max + "` `Avg: $" + card.prices.average + "` for `"+card.rarity+"`\n";
			}
			Helper.replyMessage(that.m_message, reply);
		}
	}
	this.connect(null, response, require("url").parse("/?name="+query, true));
}

YgoPrices.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.combine(Helper.split(message.content, " ", 1), " ");
}


// Export
module.exports = new YgoPrices();