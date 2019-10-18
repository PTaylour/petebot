import Twit from "twit";
import * as functions from "firebase-functions";
import { App, ExpressReceiver, ButtonAction, BlockAction } from "@slack/bolt";
import express from "express";
import createTwitterClient from "./helpers/createTwitterClient";
import { createSpecialData, parseSpecialData } from "./helpers/specialData";

const config = functions.config();

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.signing_secret,
  endpoints: "/events"
});

const slackApp = new App({
  receiver: expressReceiver,
  token: config.slack.bot_token
});

const POST_TO_CHANNEL_FORM_URL =
  "https://us-central1-petebot3000.cloudfunctions.net/postToChannel/";

const twitter = createTwitterClient(config);

// Global error handler
slackApp.error(console.error);

slackApp.event("app_mention", async ({ event, say }) => {
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
            action_id: "forward_message_as_dm",
            value: createSpecialData({
              token: config.web.token,
              channel: event.channel,
              user: event.user,
              text: event.text
            })
          }
        ]
      }
    ]
  });
});

slackApp.action<BlockAction<ButtonAction>>(
  "forward_message_as_dm",
  async ({ action, ack, say }) => {
    ack();
    say("on it :+1:");

    const { channel, user, text } = parseSpecialData(action.value);

    // trick ts here as Twit defs are not up to date
    const params = <Twit.Params>{
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: "522410691" // me!
          },
          message_data: {
            text: `Message from ${user} on channel ${channel}:

${text}

${POST_TO_CHANNEL_FORM_URL}${encodeURIComponent(action.value)}`
          }
        }
      }
    };

    try {
      await twitter.post("direct_messages/events/new", params);
      say("done :ok_hand:");
    } catch (err) {
      console.error(err, err.twitterReply.errors, params);
      say("aahh bummer. I tried but I couldn't get through. Try texting him?");
    }
  }
);

const postToChannelApp = express();

postToChannelApp.get("/:data", (req, res) => {
  const { token, channel, user, text } = parseSpecialData(
    decodeURIComponent(req.params.data)
  );
  if (config.web.token === token) {
    res.send(`
<html>
  <form onsubmit="submitForm(event, this)">
    From: ${user} on channel: ${channel}<br />
    Message: ${text}<br />
    Reply: <br />
    <textarea rows="5" cols="75" name="reply">
&lt@${user}&gt
    </textarea>
    <br />
    <input type="submit" value="Submit">
  </form>
  <script>
    function submitForm(e, form){
        e.preventDefault();
        fetch("${POST_TO_CHANNEL_FORM_URL}${req.params.data}", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reply: form.querySelector("[name=reply]").value })
        }).then(function(res) {
          alert('form submitted')
        }).catch(function(err) {
          console.error(err)
          alert('Error')
        });
    }
  </script>
</html>
`);
  } else {
    res.status(403).send();
  }
});

postToChannelApp.post("/:data", (req, res) => {
  console.log("new post from the form", req.body);
  const { token, channel } = parseSpecialData(
    decodeURIComponent(req.params.data)
  );
  const { reply } = req.body;
  console.log("new post:", channel, reply);
  if (config.web.token === token) {
    if (reply) {
      console.log("will post:", reply);
      // send the reply to the channel the DM came from
      slackApp.client.chat
        .postMessage({
          token: config.slack.bot_token,
          channel: channel,
          text: `_from me_: ${reply}`
        })
        .then(() => {
          console.log("posted message to channel", channel);
          res.send("done");
        })
        .catch(err => {
          console.error(err);
          res.status(500).send();
        });
    } else {
      res.status(400).send();
    }
  } else {
    res.status(403).send();
  }
});

// https://us-central1-petebot3000.cloudfunctions.net/postToChannel/
exports.slack = functions.https.onRequest(expressReceiver.app);
// https://us-central1-petebot3000.cloudfunctions.net/postToChannel/
exports.postToChannel = functions.https.onRequest(postToChannelApp);
