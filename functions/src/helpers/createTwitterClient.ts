import Twit from "twit";
import * as functions from "firebase-functions";

const createTwitterClient = (config: functions.config.Config): Twit =>
  new Twit({
    consumer_key: config.twitter.consumer_api_key,
    consumer_secret: config.twitter.consumer_api_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
  });

export default createTwitterClient;
