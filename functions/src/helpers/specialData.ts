interface SpecialData {
  token: string;
  channel: string;
  user: string;
  text: string;
}
/**
 * I'm serialising some data so that it can be passed via a twitter DM
 *
 * @param data The special data format
 */
export const parseSpecialData = (data: string): SpecialData => {
  const [token, channel, user, text] = data.split("~~");
  return {
    token,
    channel,
    user,
    text
  };
};

export const createSpecialData = ({
  token,
  channel,
  user,
  text
}: SpecialData) => `${token}~~${channel}~~${user}~~${text}`;
