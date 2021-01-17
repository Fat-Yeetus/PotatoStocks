const util = require("util"),
	fs = require("fs"),
	readdir = fs.readdirSync,
	{ Intents } = require("discord.js");

const PotatoStocks = require("./base/PotatoStocks"),
	client = new PotatoStocks({
		disableMentions: "everyone",
		restRequestTimeout: 30000,
		messageCacheLifetime: 3600,
		messageSweepInterval: 300,
		ws: {
			intents: new Intents(Intents.NON_PRIVILEGED)
				.remove("GUILD_MESSAGE_TYPING")
				.remove("DIRECT_MESSAGE_TYPING")
		}
	});

let directories = readdir("./commands/");
directories.forEach(dir => {
	let commands = readdir(`./commands/${dir}/`);
	commands
		.filter(cmd => cmd.split(".").pop() === "js")
		.forEach(cmd => {
			const response = client.loadCommand(`./commands/${dir}`, cmd);
			if (response) client.logger.log(response, "error");
		});
});

// Load events
const evtFiles = readdir("./events/");
evtFiles.forEach(file => {
	const eventName = file.split(".")[0];
	const event = new (require(`./events/${file}`))(client);
	client.on(eventName, (...args) => event.run(...args));
	delete require.cache[require.resolve(`./events/${file}`)];
});

client.login(client.config.token);

process.on("unhandledRejection", err => client.logger.log(err.stack, "error"));