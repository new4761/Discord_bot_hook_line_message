const line = require("@line/bot-sdk");
const { handleMessage, handleImage } = require("./discordbot");
const express = require("express");
const axios = require("axios");

require("dotenv").config();

const baseUrl_profile = "https://api.line.me/v2/bot/";

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// event handler
async function handleEvent(event) {
  let userProfile = await findUserProfile(event.source);
  if (event.type == "message") {
    console.log(event.message);
    switch (event.message.type) {
      case "text":
        handleMessage(event.message, userProfile);
        break;
      case "image":
        let imageBase64 = await findMessageContent(event.message.id);
        let imageStream  = new Buffer.from(imageBase64, "base64");
        console.log(imageStream)
        handleImage(event.message,userProfile,imageStream);
        break;
      default:
        return Promise.resolve(null);
    }
  }
}

const findUserProfile = (source) => {
  let groupUri = "group/" + source.groupId;
  let userUri = "/member/" + source.userId;
  return axios
    .get(baseUrl_profile + groupUri + userUri, {
      headers: {
        Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
      },
    })
    .then((result) => result.data);
};

const findMessageContent = (message_id) => {
  return axios
    .get("https://api-data.line.me/v2/bot/message/" + message_id + "/content", {
      headers: {
        Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
      },
      responseType: "arraybuffer",
    })
    .then((response) =>
      Buffer.from(response.data, "binary").toString("base64")
    );
};

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
