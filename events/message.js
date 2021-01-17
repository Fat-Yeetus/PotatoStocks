const Discord = require("discord.js"),
	fs = require("fs");
cmdCooldown = {};

module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run(msg) {
		const data = {};

		let client = this.client;
		data.config = client.config;

		if (msg.author.id !== client.user.id) data.userData = await client.findOrCreateUser(msg.author.id);

		// If the message author is a bot
		if (msg.author.bot) return;

		// If the member on a guild is invisible or not cached, fetch them.
		if (msg.guild && !msg.member) await msg.guild.members.fetch(msg.author.id);

		// Gets the prefix
		let prefix = client.functions.getPrefix(message, data);
		if (!prefix) return;

		let args = message.content
			.slice(typeof prefix === "string" ? prefix.length : 0)
			.trim()
			.split(/ +/g);
		let command = args.shift().toLowerCase();
		let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

		if (cmd && cmd.conf.guildOnly && !message.guild) {
			return msg.channel.send("This command can only be used in a server");
		}

		if (message.guild) {
			let neededPermission = [];
			if (cmd) {
				for (const perm of cmd.conf.botPermissions) {
					if (!msg.channel.permissionsFor(msg.guild.me).has(perm)) neededPermission.push(perm);
				}
			}
			if (neededPermission.length > 0) {
				return msg.channel.send(
					`Bot is missing required permissions: ${neededPermission.map(p => `\`${p}\``).join(", ")}`
				);
			}
			neededPermission = [];
			if (cmd) {
				for (const perm of cmd.conf.memberPermissions) {
					if (!msg.channel.permissionsFor(msg.member).has(perm)) neededPermission.push(perm);
				}
			}
			if (neededPermission.length > 0) {
				return msg.channel.send(
					`Missing required permissions: ${neededPermission.map(p => `\`${p}\``).join(", ")}`
				);
			}
			if (cmd && !message.channel.nsfw && cmd.conf.nsfw) {
				return message.channel.send("Cannot use NSFW commands in non-NSFW channels");
			}
		}

		if (cmd && cmd.conf.ownerOnly && message.author.id !== client.config.owner.id) return;

		let uCooldown = cmdCooldown[message.author.id];
		if (!uCooldown) {
			cmdCooldown[message.author.id] = {};
			uCooldown = cmdCooldown[message.author.id];
		}
		let time;
		if (cmd) time = uCooldown[cmd.help.name] || 0;
		if (time && time > Date.now()) {
			return message.channel.send(
				`Must wait **${Math.ceil((time - Date.now()) / 1000)}** seconds to use this command again`
			);
		}
		if (cmd) cmdCooldown[message.author.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;

		try {
			if (cmd) await cmd.run(message, args, data);
		} catch (e) {
			console.error(e);
			return message.channel
				.send("An unexpected error has occured");
		}
	}
};
