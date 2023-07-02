import withAuth from '@/components/withAuth'
import withHeader from '@/components/withHeader'
import axios from 'axios'
import useQuery from '@/lib/hooks/use-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

function SlackOAuth(props) {
  const [success, setSuccess] = useState()
  const [error, setError] = useState()
  const router = useQuery()

  useEffect(() => {
    if (router) {
      const { code, state, error } = router.query
      if (error) {
        router.push('/dashboard/integrations')
        return
      }

      initiateOauthIntegration(code, state)
    }
  }, [router])

  async function initiateOauthIntegration(code, state) {
    setError()
    setSuccess()
    try {
      const response = await axios.post('/api/v1/integrations/oauth/slack', {
        code,
        state,
      })
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.ok
      )
        router.push('/dashboard/integrations')
    } catch (err) {
      console.error(err)
      if (err && err.response && err.response.data) {
        toast.error(err.response.data.error)
        setError(err.response.data.error)
      }
    }
  }

  if (error) return <>{error}</>

  return (
    <>
      <div className="container">
        {!success ? <>Loading...</> : <>Successful</>}
      </div>
    </>
  )
}

//FIXME: remove withAuth
export default withAuth(withHeader(SlackOAuth))
