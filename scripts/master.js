var bots = {};
var config = JSON.parse(require("fs").readFileSync("./data/bots.json"));
var fork = require('child_process').fork;

var close = function() {
	for ( var i in bots ) {
		var bot = bots[i];
		bot.process.kill();
	}
	process.exit();
}
var restart = function(worker){
	if ( true ) close();
	worker.process.kill();
	worker.process = fork('./scripts/construct.js', [id]);
	bots[id] = worker;

	child.on('close', function (code) {restart(worker);});
	child.on('error', function (code) {restart(worker);});
}

for ( var id in config ) {	
	if ( config[id].enabled == false ) continue;
	var child = fork('./scripts/construct.js', [id]);
	bots[id] = {process: child, id: id};
	child.on('close', function (code) {restart(bots[id]);});
	child.on('error', function (code) {restart(bots[id]);});
}
