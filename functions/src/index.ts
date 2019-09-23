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

app.event("app_mention", async ({ event, say }) => {
  console.log(
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
  );

  say({
    text: ``,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Thanks for the message <@${event.user}> :wave:\n\nI can't get to the phone right now :)\n\n\n*Shall I forward myself your message as a DM on Twitter?*`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Yes, send as DM"
            },
            style: "primary",
            value: "click_me_123"
          }
        ]
      }
    ]
  });
});

// Handle `/echo` command invocations
// app.command("/echo-from-firebase", async ({ command, ack, say }) => {
// Acknowledge command request
//   ack();
//   say(`You said "${command.text}"`);
// });

// https://{your domain}.cloudfunctions.net/slack/events
exports.slack = functions.https.onRequest(expressReceiver.app);
