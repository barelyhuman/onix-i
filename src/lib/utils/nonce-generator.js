import randomToken from '@/lib/utils/random-token'

export default async function nonceGenerator(toAppendData) {
  const max = 25
  const min = 15
  const length = Math.floor(Math.random() * (max - min) + min)
  const nonce = randomToken(length)
  let baseString = `${nonce}`
  if (toAppendData) baseString = `${nonce}:${toAppendData}`

  return Buffer.from(baseString).toString('base64')
}
