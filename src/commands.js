// Requires
var fs = require("fs");

var Commands = new Array(); 												// List of commands
var commandDirectory = "./commands/"; 							// Directory to load commands from
var toLoad = fs.readdirSync("./src/"+commandDirectory); 		// List of Javascript commands files (fs uses directory from where the script was called, require uses the directory this script is in as root)
for ( var i = 0; i < toLoad.length; ++i ) { 	 				// Load them into `Commands`
	var t = toLoad[i];
	if ( t.indexOf(".command.js") >= 0 ) {
		var file = commandDirectory + toLoad[i];
		delete require.cache[require.resolve(file)];
		Commands.push(require(file));
	}
}

// Export
module.exports = Commands;