const Discord = require("discord.js");

class PotatoStocks extends Discord.Client {
	constructor(options) {
		super(options);
		this.config = require("../config"); // Load the config file
		this.commands = new Collection(); // Creates new commands collection
		this.aliases = new Collection(); // Creates new command aliases collection
		this.wait = util.promisify(setTimeout); // client.wait(1000) - Wait 1 second
		this.functions = require("../helpers/functions"); // Load the functions file
	}

	loadCommand(commandPath, commandName) {
		try {
			const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
			props.conf.location = commandPath;
			if (props.init) props.init(this);
			this.commands.set(props.help.name, props);
			props.conf.aliases.forEach(alias => this.aliases.set(alias, props.help.name));
			return false;
		} catch (e) {
			return `Unable to load command ${commandName}: ${e.stack}`;
		}
	}

	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) command = this.commands.get(commandName);
		else if (this.aliases.has(commandName)) command = this.commands.get(this.aliases.get(commandName));
		if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		if (command.shutdown) await command.shutdown(this);
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		this.commands.delete(commandName);
		return false;
	}

	async findOrCreateUser(user) {
		try {
			let path = `./users/${user}.json`;
			if (!fs.existsSync(path)) path = "./base/User.json";
			let data = JSON.parse(await fs.promises.readFile(path, "utf8"));
			if (!data.id) data.id = user;
			data.save = async function () {
				await fs.promises.writeFile(`./users/${this.id}.json`, JSON.stringify(this, null, "\t"), "utf8");
			};
			if (path === "./base/User.json") await data.save();
			return data;
		} catch (e) {
			e.message += ` in ./users/${user}.json`;
			this.logger.error(e);
		}
	}

}