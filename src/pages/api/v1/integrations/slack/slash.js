import slackCommands from '@/lib/commands/slack-commands'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async (req, res) => {
  if (req.method.toLowerCase() !== 'post') return res.status(404).send()

  return await slackCommands({ req, res })
}
