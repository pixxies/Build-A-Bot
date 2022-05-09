// Import the packages we need
const dotenv = require('dotenv');
dotenv.config();
const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Require the necessary discord.js classes and variables
const { Client, Intents, Collection } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const config = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Load our commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
const commands = client.commands.map(({ execute, ...data }) => data);

// Register slash commands
const rest = new REST({ version: '9' }).setToken(token);
console.log('Started refreshing slash commands...');
// rest.put(
//     Routes.applicationCommands(config.clientId), { body: commands },
// );
rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands },
);
console.log(`Successfully reloaded ${commands.length} slash commands!`);

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

// Our slash command handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login to Discord with your client's token
client.login(token);