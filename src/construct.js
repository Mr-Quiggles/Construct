var Discord = require("discord.js");
var fs = require("fs");
var http = require("http");
var https = require("https");
var Helper = require("./helper.js");

var Construct = { 										// Construct
	client: null, 										// Discord.js
	containers: { 										// Data structures used
		bots: {
			file: "./data/bots.json",
			data: {}
		},
		permissions: {
			users: {},
			servers: {}
		},
		commands: require("./commands.js") 				// List of commands
	},
	id: null,
	name: null,
	server: null
};

// Initialize Construct
Construct.start = function(id) {
	Helper.client = Construct.client;
	Helper.construct = Construct;

	if (id == null) id = "210171646831493120"; // Default construct id
	Construct.id = id;
	Construct.name = id;
	/* Load bot parameters */ {
		Helper.println("Parsing `" + Construct.containers.bots.file + "`...");
		Construct.containers.bots.data = JSON.parse(fs.readFileSync(Construct.containers.bots.file));
		if (Construct.containers.bots.data[id].name) Construct.name = Construct.containers.bots.data[id].name;
		Helper.println("Parsed bots!");
		Helper.println("Using ID "+id);

		if ( !Construct.containers.bots.data[id].playing ) Construct.containers.bots.data[id].playing = "";
	}
	if ( Construct.enabled ) {
		// Create the client
		Construct.client = new Discord.Client({autoReconnect : true});
		// Hooks
		Construct.client.on("message", function(message) {
			Construct.onMessage(message);
		});
		Construct.client.on("ready", function () {
			Construct.onReady();
		});
		/* Login */ {
			var data = Construct.containers.bots.data[id];
			Construct.containers.permissions = data.permissions;
			(data.token) ? Construct.client.login(data.token) : Construct.client.login(data.email, data.password);
		}
	}
	/* Server */ if ( Construct.containers.bots.data[id].server && Construct.containers.bots.data[id].server.enabled ) {
		var port = Construct.containers.bots.data[id].server.port;
		var hostname = Construct.containers.bots.data[id].server.hostname;
		if ( hostname === "" ) hostname = "localhost";
		Construct.server = http.createServer(Construct.onHttpRequest);
		Construct.server.listen(port, function(){
			Helper.println("Server listening on: https://"+hostname+":"+port);
		});
	}
}

// Prints initialization messages, and parses quotes
Construct.onReady = function() {
	/* Update game title */ {
		var playing = Construct.containers.bots.data[Construct.id].playing;
		Construct.client.user.setStatus("online",playing);
	}
	Helper.println("Ready to begin!");
}

// Commands based on messages
Construct.broadcastMessage = function( message ) {
	var privileged = Helper.privileged(message);
	for ( var i = 0; i < Construct.containers.commands.length; ++i ) {
		var command = Construct.containers.commands[i];
		if ( !command ) continue;
		if ( command.m_properties.enabled == false ) continue;
		if ( !command.m_properties.override && !privileged ) continue;
		if ( command.m_properties.deltaTime == null ) command.m_properties.deltaTime = 0;
		if ( command.m_properties.prevTime == null ) command.m_properties.prevTime = 0;
		if ( command.m_properties.prevTime + command.m_properties.deltaTime > new Date().getTime() ) continue;
		command.parse(message);
		if ( command.should() ) {
			var ret = command.execute();
			command.clean();
			command.m_properties.prevTime = new Date().getTime();
			if ( ret == true ) break;
		}
	}
}
Construct.onMessage = function( message ) {
	Construct.broadcastMessage( message );
}

//
Construct.broadcastHttpRequest = function ( request, response ) {
	var apiVersion = "1";
	var uri = require("url").parse(request.url, true);
	if ( uri.pathname === "/" ) {
		var url = "/help" + request.url;
		uri = require("url").parse(url, true);
	}
	for ( var i = 0; i < Construct.containers.commands.length; ++i ) {
		var command = Construct.containers.commands[i];
		if ( !command ) continue;
		if ( command.m_properties.enabled == false ) continue;
		if ( command.m_uri.enabled == false ) continue;
		if ( command.m_uri.path === "" ) continue;

		if ( !command.m_uri.contentType ) command.m_uri.contentType = "text/plain";

		if ( uri.pathname === "/" + command.m_uri.path || uri.pathname === "/" + command.m_uri.path + "/" || uri.pathname === "/api/"+apiVersion+"/" + command.m_uri.path || uri.pathname === "/api/"+apiVersion+"/" + command.m_uri.path + "/" ) {
			response.writeHead(200, {"Content-Type": (uri.query && uri.query.html!=undefined)?"text/html":command.m_uri.contentType + "; charset=utf-8"});
			var ret = command.connect( request, response, uri );
			if ( ret == true ) break;
		}
	}
}
Construct.onHttpRequest = function( request, response ) {
	try {
		if ( request.headers['user-agent'] === "Mozilla/5.0 (compatible; Discordbot/1.0; +https://discordapp.com)"
		|| request.headers['user-agent'] === "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0" ) {
			response.writeHead(302, {'Location': '//bambis.cat/meme/construct.png'});
			response.end();
			return;
		}
		if ( request.url === "/favicon.ico" ) {
			response.writeHead(302, {'Location': '//bambis.cat/favicon.ico'});
			response.end();
			return;
		}
		Construct.broadcastHttpRequest(request, response);
	} catch ( e ) {
		Helper.handleError(e);
		response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
		response.end(JSON.stringify({status: "error", code: e.toString()}, null, 2))
	}
}


// Export
module.exports = Construct;