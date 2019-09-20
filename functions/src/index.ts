import * as functions from "firebase-functions";
const express = require("express");
const cors = require("cors");
const { createEventAdapter } = require("@slack/events-api");

const slackSigningSecret = functions.config().slack.signingsecret;
const slackEvents = createEventAdapter(slackSigningSecret);

interface Event {
  user: string;
  channel: string;
  text: string;
}

slackEvents.on("message", (event: Event) => {
  console.log(
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
  );
});

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to listen for slack messages
app.use("/", slackEvents.requestListener());

// Expose Express API as a single Cloud Function:
exports.slackEvents = functions.https.onRequest(app);
