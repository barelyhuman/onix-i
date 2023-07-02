import PublicHeader from '@/components/layout/PublicHeader'
import GetInTouchContent from '@/content/getting-in-touch.mdx'

function Home() {
  return (
    <>
      <PublicHeader />
      <div className="container">
        <section className="growth-container markdown">
          <GetInTouchContent />
        </section>
      </div>
    </>
  )
}

export default Home
