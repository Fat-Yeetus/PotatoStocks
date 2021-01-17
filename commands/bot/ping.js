const Command = require("../../base/Command");

class Ping extends Command {
	constructor(client) {
		super(client, {
			name: "ping",
			description: "view PotatoStock's current network connection speed and processing latency",
			usage: "{prefix}ping",
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			global: false,
			aliases: ["pong", "latency"],
			memberPermissions: [],
			botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"],
			nsfw: false,
			ownerOnly: false,
			cooldown: 3000
		});
	}

	async run(msg) {
		const m = await msg.channel.send(`**Pinging. . .**`);
		let i = 0,
			s = Date.now();
		while (Date.now() - s <= 1) i++;
		let embed = {
			color: parseInt("8800ff", 16),
			description: "**PONG!**",
			fields: [
				{
					name: "Response ​ ​ ​ ​ ​ ​ ​ ​ ​",
					value: `\`\`\`ini\n[ ${m.createdTimestamp - msg.createdTimestamp}ms ]\`\`\``,
					inline: true
				},
				{
					name: "Websocket ​ ​ ​ ​ ​ ​ ​ ​",
					value: `\`\`\`ini\n [ ${Math.floor(msg.client.ws.ping)}ms ]\`\`\``,
					inline: true
				},
				{
					name: "Server TPS",
					value: `${i.toLocaleString()},000`
				}
			]
		};
		m.edit("", { embed });
	}
}

module.exports = Ping;
