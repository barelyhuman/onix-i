import withAuth from '@/components/withAuth'
import withHeader from '@/components/withHeader'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const fetcher = url => axios.get(url)

const Container = props => {
  return (
    <>
      <div className="container">
        {props.children}
        <style jsx>
          {`
            .container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              min-height: 60vh;
              font-size: 20px;
            }

            .font-50 {
              font-size: 50px;
            }
          `}
        </style>
      </div>
    </>
  )
}

function IntegrationAcceptScreen(props) {
  const router = useRouter()
  const [data, setData] = useState()
  const [error, setError] = useState()
  const { nonce } = router.query

  useEffect(() => {
    if (router && router.query && router.query.nonce) acceptIntegration()
  }, [router])

  async function acceptIntegration() {
    try {
      const data = await fetcher(`/api/v1/integrations/accept?nonce=${nonce}`)
      setData(data)
    } catch (err) {
      setError(err)
      console.error(err)
    }
  }

  if (error) {
    return (
      <>
        <Container>
          <h1 className="text-error">Failed.</h1>
          <p>Try generating a new connect link</p>
        </Container>
      </>
    )
  }
  if (!data) {
    return (
      <>
        <Container>
          <h1>Connecting....</h1>
        </Container>
      </>
    )
  }
  return (
    <>
      <Container>
        <h1>Connected!</h1>
        <p className="cap">You can now close this window</p>
      </Container>
    </>
  )
}

//FIXME: remove withAuth
export default withAuth(withHeader(IntegrationAcceptScreen))
