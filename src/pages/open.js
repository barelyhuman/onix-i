import Footer from '@/components/layout/Footer'
import PublicHeader from '@/components/layout/PublicHeader'
import Spacer from '@/components/Spacer'
import { styled } from 'goober'
import { deps } from '@/lib/deps'
import { getActiveUserCount } from '@/controllers/user'

const ProgressCard = styled('div')`
  border-radius: 4px;
  border: 1px solid #000;
  box-shadow: 0px 2px 8px rgba(12, 12, 13, 0.1);
  width: 100%;
  height: 30px;
  display: inline-block;
  position: relative;
  overflow: hidden;

  &:before {
    content: '${props => props.count}';
    top: 50%;
    position: absolute;
    color: black;
    left: ${props => (props.count / props.maxCount) * 100 + 1.1}%;
    transform: translateY(-50%);
  }

  &:after {
    content: '';
    height: 30px;
    left: 0;
    top: 0;
    position: absolute;
    background: black;
    width: ${props => (props.count / props.maxCount) * 100}%;
  }
`

export default function OpenStats({ userCount, packages }) {
  const maxUserCount = Math.round(userCount * 2.5)
  return (
    <>
      <PublicHeader />
      <div className="growth-container">
        <div className="w-100 container">
          <section>
            <h2>Open Stats</h2>
            <p>
              Due to the nature of the product and it's developer's laziness
              there isn't much in terms of metrics that the site has, but
              whatever it is kept open for you to see.
            </p>
          </section>
          <section>
            <Spacer y={4} />
            Total Users
            <ProgressCard count={userCount} maxCount={maxUserCount} />
            <div className="w-100 flex justify-between">
              <div>0</div>
              <div>{maxUserCount}</div>
            </div>
          </section>
          <section className="font-fancy">
            <h2 id="thanks-to">Thanks to</h2>
            <p>
              A huge thanks to all these amazing open source libraries for
              making it possible to build this .
            </p>
            <ul>
              {packages.map(x => (
                <li>
                  <a className="link" href={x[1] || ''}>
                    {x[0]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}

export async function getServerSideProps(ctx) {
  const userCount = await getActiveUserCount()

  return {
    props: {
      userCount: userCount,
      packages: Object.entries(deps),
    },
  }
}
