// Require the necessary discord.js classes
const { Client, Intents, MessageAttachment } = require("discord.js");

require("dotenv").config();

// Create a new client instance
const discord_bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

let channel;

// When the client is ready, run this code (only once)
discord_bot.once("ready", async () => {
  channel = await discord_bot.channels
    .fetch(process.env.DISCORD_TARGET_CHANNEL_ID)
    .then((res) => res)
    .catch(console.error);
});

// Login to Discord with your client's token
discord_bot.login(process.env.DISCORD_BOT_TOKEN);

function handleImage(message, userProfile,imageStream) {
const file = new MessageAttachment(imageStream, 'img.jpeg');
  const output_message = {
	title: 'Line Message',
    author: {
      name: userProfile.displayName,
      icon_url: userProfile.pictureUrl,
    },
	description: message.text,
	image: {
		url: "attachment://img.jpeg",
	},
	timestamp: new Date(),
  };

  //channel.send(output_message)
  channel.send({ embeds: [output_message] , files: [file]});
}


function handleMessage(message, userProfile) {
	const output_message = {
	  title: 'Line Message',
	  author: {
		name: userProfile.displayName,
		icon_url: userProfile.pictureUrl,
	  },
	  description: message.text,
	  timestamp: new Date(),
	};
	channel.send({ embeds: [output_message] });
  }
module.exports = { handleMessage,handleImage };
