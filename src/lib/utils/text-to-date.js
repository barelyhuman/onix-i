import * as chrono from 'chrono-node'

export function parseOnlyDate(dateString) {
  const parsed = chrono.parse(dateString)

  if (!parsed || !parsed.length) return false

  const date = parsed[0].date()

  return date
}

export function parseDate(inputString) {
  const parsed = chrono.parse(inputString)

  if (!parsed || (parsed && !parsed.length)) return false

  const result = {
    from: 0,
    to: 0,
    text: '',
  }
  let text = inputString
  if (parsed.length === 2) {
    text = text.replace(parsed[0].text, '')
    text = text.replace(parsed[1].text, '')
    result.from = parsed[0].date()
    result.to = parsed[1].date()
    result.text = text
  }
  if (parsed.length === 1 && parsed[0].start && parsed[0].end) {
    text = text.replace(parsed[0].text, '')
    result.from = parsed[0].start.date()
    result.to = parsed[0].end.date()
    result.text = text
  }

  result.text = result.text
    .split(' ')
    .filter(item => item !== '')
    .join(' ')
    .trim()

  return result
}
