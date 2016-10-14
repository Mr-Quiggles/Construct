var Command = require("./command.js");
var Helper = require("../helper.js");

HelpCommand.prototype = new Command();
function HelpCommand() {
	// Static variables
	this.m_properties = { 							// Properties; used for `.help`
		name: "help", 								// Name of command
		usage: ".help", 							// Example usage
		commands:  ["^\\.help$"], 					// Keyword(s) using regex
		description: "Returns a list of commands", 	// Description
		regex: true, 								// Does the command rely on commanding through regex?
		visible: true, 								// Visible to `man` and `help`
	};
	this.m_uri = {
		name: "help",
		path: "help",
		usage: "/help[?discord]",
		description: "Landing page for the bot; Append ?discord to show discord-related information.",
		enabled: true,
		visible: true,
		contentType: "text/html"
	}
	this.m_persistence = {
		k: "placeholder"
	}
}
HelpCommand.prototype.execute = function() {
	var that = this.clone();
	var response = "You can view documentation at https://"+Helper.construct.containers.bots.data[Helper.construct.id].server.hostname+"/?discord\n";
	var commands = Helper.construct.containers.commands;
	for ( var i = 0; i < commands.length; ++i ) {
		var command = commands[i];
		if ( !command || !command.m_properties.visible ) continue;
		response += "`"+command.m_properties.name+"`";
		if ( i + 1 < commands.length ) response += ", ";
	}
	Helper.replyMessage(that.m_message, response);
}

HelpCommand.prototype.connect = function( request, response, uri ) {
	var that = this.clone();

	var admin = uri.query.k === that.m_persistence.k;
	var discord = uri.query.discord != undefined;

	var content = "";
	function print( msg, code ) {
		if ( code == null ) code = true;
		content += "<section>"+(code?"<pre><code class='prettyprint'>":"")+"[" + Helper.construct.name + "] ["+ new Date().toISOString() +"] " + msg + (code?"</code></pre>":"")+"</section>";	
	}
	/* Create console */ {
		content += "<section><pre><code class='prettyprint' id='console-output'>[" + Helper.construct.name + "] ["+ new Date().toISOString() +"] Hello!\n<br></code></pre></section>";
		content += "<input type='text' id='console-input'>";
	}
	if ( discord ) {
		/* Help */ {
			var commands = Helper.construct.containers.commands;
			var info = "\n";
			for ( var i = 0; i < commands.length; ++i ) {
				var command = commands[i];
				if ( !command || !command.m_properties.visible ) continue;
				info += "<em><code><mark>"+command.m_properties.usage+"</mark></code></em>:<br/><code class=prettyprint>"+command.m_properties.description+"</code><br/><br/>";
			}
			print("[Discord Commands] </code></pre>" + info + "<pre><code>", true, false);
		};
		/* Permissions */ {
			print("[Discord Permissions] " + JSON.stringify(Helper.construct.containers.permissions,null,2));	
		};
		/* Current log output */ if ( admin ) {
			var time = new Date(Date.now());
			var yyyymmdd = "" + time.getUTCFullYear() + time.getUTCMonth() + time.getUTCDate();
			var filename = "./data/logs/["+Helper.construct.id+"] "+yyyymmdd+".log";
			var log = require("fs").readFileSync(filename); {
				function escapeHtml(string) {
					var entityMap = {
						"&": "&amp;",
						"<": "&lt;",
						">": "&gt;",
						'"': '&quot;',
						"'": '&#39;',
						"/": '&#x2F;'
					};
					return String(string).replace(/[&<>"'\/]/g, function (s) {
						return entityMap[s];
					});
				}
				log = escapeHtml(log);
			}
			print("[Log]<br/>" + log);
		}
	} else {
		/* Help */ {
			var commands = Helper.construct.containers.commands;
			var info = "\n";
			for ( var i = 0; i < commands.length; ++i ) {
				var command = commands[i];
				if ( !command || !command.m_uri.visible || !command.m_uri || command.m_uri.path === "" ) continue;
				info += "<em><code><mark>"+command.m_uri.usage+"</mark></code></em>:<br/><code class=prettyprint>"+command.m_uri.description+"</code><br/><br/>";
			}
			print("[Server Commands] </code></pre>" + info + "<pre><code>", true, false);
		};
	}

	var html = "";
	html += "<head>" + "\n";
	html += "<meta charset=\"UTF-8\">" + "\n";
	html += "<meta name=\"description\" content=\"Bambi's cat\">" + "\n";
	html += "<meta name=\"keywords\" content=\"bambi,cat,bambi's cat, bambi scat\">" + "\n";
	html += "<meta name=\"author\" content=\"Bambi's Cat\">" + "\n";
	html += "<title>Bambi's cat</title>" + "\n";
	html += "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://grimgr.am/css/node.css\">" + "\n";
	html += "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.rawgit.com/google/code-prettify/master/styles/sunburst.css\">" + "\n";
	html += "<script src=\"https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js\"></script>" + "\n";
	html += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js\" type=\"text/javascript\"></script>" + "\n";
	html += "<script src=\"https://grimgr.am/js/node.js\"></script>" + "\n";
	html += "</head>" + "\n";
	html += "<html>" + "\n";
	html += "<body>"+content+"</body>" + "\n";
	html += "</html>";

	response.end(html);
}

// Export
module.exports = new HelpCommand();