import Twit from "twit";
import * as functions from "firebase-functions";

let client: Twit | null = null;

const createTwitterClient = (config: functions.config.Config): Twit => {
  if (client === null) {
    client = new Twit({
      consumer_key: "...",
      consumer_secret: "...",
      access_token: "...",
      access_token_secret: "...",
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      strictSSL: true // optional - requires SSL certificates to be valid.
    });
  }

  return client;
};

export default createTwitterClient;
