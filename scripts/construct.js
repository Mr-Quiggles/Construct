var construct = require("../src/construct.js");

construct.start(process.argv[2]);

process.on('uncaughtException', function(err) {
// Handle ECONNRESETs caused by `next` or `destroy`
if (err.code == 'ECONNRESET') {
// Yes, I'm aware this is really bad node code. However, the uncaught exception
// that causes this error is buried deep inside either discord.js, ytdl or node
// itself and after countless hours of trying to debug this issue I have simply
// given up. The fact that this error only happens *sometimes* while attempting
// to skip to the next video (at other times, I used to get an EPIPE, which was
// clearly an error in discord.js and was now fixed) tells me that this problem
// can actually be safely prevented using uncaughtException. Should this bother
// you, you can always try to debug the error yourself and make a PR.
console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
console.log(err.stack);
} else {
// Normal error handling
console.log(err);
console.log(err.stack);
process.exit(0);
}
});