import { marked } from 'marked'

export const markdownToHTML = markdown => {
  return marked(markdown)
}

export const parseFrontmatter = text => {
  const parts = text.split('---').filter(x => x)
  let frontmatter = parts[0]
  const content = parts.slice(1).join('---')

  const items = frontmatter.split('\n')
  const frontmatterObj = {}
  items.forEach(item => {
    const yamlSplits = item.split(':')
    if (yamlSplits[0]) {
      frontmatterObj[yamlSplits[0]] = yamlSplits[1].trim()
    }
  })

  return {
    frontmatter: frontmatterObj,
    content,
  }
}
