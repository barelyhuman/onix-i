import ProductHuntFeatured from '@/components/ProductHuntFeatured'
import PublicHeader from '@/components/layout/PublicHeader'
import Spacer from '@/components/Spacer'
import Footer from '@/components/layout/Footer'

function Home() {
  return (
    <>
      <PublicHeader />
      <div className="growth-container center">
        <Spacer y={4} />
        <section className="hero-container container">
          <div className="hero-left-section">
            <h2 className="font-fancy">Just a Time Tracker</h2>
            <p className="font-fancy text-subtle">and nothing more.</p>
            <Spacer y={8} />
            <div className="flex flex-col">
              <a
                className="hero-button"
                href="/login
              "
              >
                Get Started &rsaquo;
              </a>
              <Spacer y={1} />
              <p className="m-null text-center">
                <small className="text-subtle">It's free</small>
              </p>
            </div>
          </div>
          <div className="hero-right-section">
            <div className="hero-time-card">
              <div className="hero-time-body">
                <div className="hero-icon">
                  <i className="gg-play-button"></i>
                </div>
                <Spacer y={1} />
                <div className="hero-time-text">00.00.00</div>
              </div>
            </div>
            <Spacer y={4} />
            <ProductHuntFeatured />
          </div>
        </section>
      </div>
      <Footer />
      <style jsx>
        {`
          .hero-button {
            padding: 12px 24px;
            border-radius: 6px;
            background: var(--accent);
            color: var(--on-accent);
            font-size: 24px;
            line-height: 52px;
            text-align: center;
          }

          .hero-container {
            display: flex;
            width: 100%;
            align-items: flex-start;
            justify-content: space-between;
          }

          .hero-time-card {
            position: relative;
            display: flex;
            width: 450px;
            height: 200px;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 24px;
            background: var(--overlay);
            box-shadow: 0 4px 8px rgb(0 0 0 / 12%);
            color: var(--text);
            gap: 8px;
          }

          .hero-time-body {
            z-index: 1;
          }

          .hero-time-card::after {
            position: absolute;
            z-index: 0;
            top: 0;
            left: 0;
            width: 450px;
            height: 200px;
            border-radius: 24px;
            background: var(--base);
            box-shadow: 0 4px 8px rgb(0 0 0 / 12%);
            color: var(--text);
            content: '';
            transform: rotate(10deg);
          }

          .hero-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            border-radius: 50%;
            background: var(--accent);
            color: var(--on-accent);
          }

          .hero-icon > i {
            --ggs: 2;

            font-size: 64px;
          }

          .hero-time-text {
            font-size: 18px;
            font-weight: bold;
          }

          @media screen and (max-width: 768px) {
            .hero-right-section {
              display: none;
            }

            .hero-left-section {
              align-items: center important!;
            }
          }
        `}
      </style>
    </>
  )
}

export default Home
