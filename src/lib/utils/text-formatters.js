export function toTitleCase(toConv) {
  let convertedString = ''

  convertedString = toConv.replace(/[-_]/, ' ')

  const splitsBySpace = convertedString.split(' ')

  convertedString = splitsBySpace.map(item => {
    return item[0].toUpperCase() + item.slice(1, item.length)
  })

  return convertedString.join(' ')
}
