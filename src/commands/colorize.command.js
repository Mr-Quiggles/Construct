var Command = require("./command.js");
var Helper = require("../helper.js");

ColorizeCommand.prototype = new Command();
function ColorizeCommand() {
	// Static variables
	this.m_properties = { 														// Properties; used for `.help`
		name: "colorize", 														// Name of command
		commands:  ["^\\.colorize .*$"], 										// Keyword(s) using regex
		usage: ".colorize (#RGBHEX) [Color name]", 								// Example usage
		description: "Assigns you to role [Color Name], and sets the role's color to [#RGBHEX].", 											// Description
		regex: true, 															// Does the command rely on commanding through regex?
		visible: true 															// Visible to `man` and `help`
	}
}

ColorizeCommand.prototype.execute = function() {
	var that = this.clone();
	var guild = that.m_message.guild;
	var user = guild.member(that.m_message.author);

	var value = that.m_arguments[0];
	var name = "";
	if ( value.indexOf("#") != 0 ) {
		value = "";
		name = Helper.combine(that.m_arguments, " "); // using existing role
	} else {
		name = Helper.combine(that.m_arguments, " ", 1);
		if ( name === "" ) name = "Unnamed Color";
	}
	if ( name === "Owner" || name === "Bot" ) {
		Helper.replyMessage(that.m_message, "I can't do that.");
		return;
	}

	var role = null; {
		var ar = guild.roles.array();
		for ( var i in ar ) {
			var r = ar[i];
			if ( r.name === name ) {
				role = r;
				break;
			}
		}
	}

	var doThing = function( role ) {
		if ( value !== "" ) role.setColor(value).then().catch(Helper.handleError);
		user.setRoles([role]).then(function(){
			Helper.replyMessage(that.m_message, "added to role `" + name + "`" );
		}).catch(Helper.handleError);
	}
	if ( role == null ) {
		guild.createRole().then(r => {
			if ( r.name === "new role" ) {
				r.edit({name: name, color: value}).catch(Helper.handleError);
			}

			user.setRoles([r]).then(function(){
				Helper.replyMessage(that.m_message, "added to role `" + name + "`" );
			}).catch(Helper.handleError);
		}).catch(Helper.handleError);
		return;
	}
	doThing( role );
/*
	var value = that.m_arguments[0];
	var name = Helper.combine(that.m_arguments, " ", 1);
	if ( name === "" ) name = "Unnamed Color";
	if ( value.indexOf("0x") != 0 ) value = "0x" + value;
	value = parseInt(value);
	var role = null;
	for ( var i = 0; i < that.m_message.guild.roles.length; ++i ) {
		if ( that.m_message.guild.roles[i].name === name ) {
			role = that.m_message.guild.roles[i];
			break;
		}
	}
	if ( role != null ) {
		if ( !Helper.construct.client.memberHasRole(that.m_message.sender, role) ) {
			Helper.construct.client.addMemberToRole(that.m_message.sender, role).then(function () {
				Helper.replyMessage(message, "added you to role `" + name + "`");
			});
		}
		Helper.construct.client.updateRole(role, {
			color: value
		}).then(function () {
			Helper.replyMessage(message, "updated role color for `" + name + "`");
		}).catch(function (e) {
			Helper.replyMessage(message, "an error occurred. Was that a valid hex/dec color?");
		});
	} else {
		guild.createRole({
			name: name,
			color: value
		}).then(function (permission) {
			Helper.construct.client.addMemberToRole(that.m_message.sender, permission).then(function () {
				Helper.replyMessage(message, "added you to role `" + name + "`");
			});
		}).catch(function (e) {
			Helper.replyMessage(message, "an error occurred. Was that a valid hex/dec color?");
		});
	};
*/
}

ColorizeCommand.prototype.parse = function( message ) {
	this.m_message = message;
	this.m_arguments = Helper.split(message.content, " ", 1);
}

// Export
module.exports = new ColorizeCommand();