const Discord = require("discord.js"),
	fs = require("fs");

module.exports = {
	getPrefix(msg, data) {
		const prefixes = [
			`<@${msg.client.user.id}>`,
			`<@!${msg.client.user.id}>`,
			msg.client.user.username,
			data.guild ? data.guild.prefix : "$-"
		];
		let prefix = null;
		prefixes.forEach(p => {
			if (msg.content.startsWith(p)) prefix = p;
		});
		return prefix;
	}
};
