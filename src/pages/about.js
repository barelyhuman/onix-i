import PublicHeader from '@/components/layout/PublicHeader'
import AboutContent from '@/content/about.mdx'

function Home() {
  return (
    <>
      <PublicHeader />
      <div className="container">
        <section className="growth-container markdown">
          <AboutContent />
        </section>
      </div>
    </>
  )
}

export default Home
