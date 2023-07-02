import axios from 'axios'

const SlackBot = {
  async sendMessage(userId, message) {
    try {
      const IMMessageURL = 'https://slack.com/api/chat.postMessage'

      await axios.post(
        IMMessageURL,
        {
          text: `Hey <@${userId}> \n ${message}`,
          channel: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.BOT_TOKEN}`,
          },
        }
      )
    } catch (err) {
      console.error(err)
    }
  },
}

export default SlackBot
