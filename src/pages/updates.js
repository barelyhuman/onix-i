import Footer from '@/components/layout/Footer'
import PublicHeader from '@/components/layout/PublicHeader'
import fs from 'fs'
import { styled } from 'goober'
import glob from 'tiny-glob'
import { formatDate, parseDateString } from '@/lib/utils/date'
import { markdownToHTML, parseFrontmatter } from '@/lib/utils/markdown'

const Post = styled('main')`
  line-height: 1.85;

  & > p {
    margin-bottom: 2em;
  }
`

export default function Changelogs({ changelogs }) {
  return (
    <>
      <PublicHeader />

      <div className="growth-container">
        <div className="w-100 container">
          <h2>Updates</h2>
          {changelogs.map(changeLogPost => {
            return (
              <>
                <p>
                  <small>{formatDate(changeLogPost.date)}</small>
                </p>
                <Post
                  dangerouslySetInnerHTML={{
                    __html: markdownToHTML(changeLogPost.content),
                  }}
                />
              </>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}

export async function getStaticProps(ctx) {
  let changeLogPaths = await glob('src/changelogs/*.md')

  const changelogs = changeLogPaths.map(filePath => {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, content } = parseFrontmatter(fileContent)
    return {
      date: parseDateString(frontmatter.date).toISOString(),
      content: content,
    }
  })

  return {
    props: {
      changelogs: changelogs,
    },
  }
}
