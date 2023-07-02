export const Response = (code, payload, res) => {
  if (!code || isNaN(code))
    throw new Error('Code is required and should be a number')

  if (!payload) {
    payload = {
      data: null,
    }
  }

  if (!res) throw new Error('Response object is needed for this to work')

  return res.status(code || 200).send(payload)
}

export const UnhandledErrorResponse = res => {
  return Response(
    500,
    {
      error: 'Oops! Something went wrong...',
    },
    res
  )
}

export default { UnhandledErrorResponse, Response }
