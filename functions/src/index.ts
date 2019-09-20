import * as functions from "firebase-functions";
import { App, ExpressReceiver } from "@slack/bolt";

const config = functions.config();

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.signing_secret,
  endpoints: "/events"
});

const app = new App({
  receiver: expressReceiver,
  token: config.slack.bot_token
});

// Global error handler
app.error(console.error);

app.event("app_mention", async ({ event }) => {
  console.log(
    event,
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
  );
});

// Handle `/echo` command invocations
// app.command("/echo-from-firebase", async ({ command, ack, say }) => {
// Acknowledge command request
//   ack();
//   say(`You said "${command.text}"`);
// });

// https://{your domain}.cloudfunctions.net/slack/events
exports.slack = functions.https.onRequest(expressReceiver.app);
