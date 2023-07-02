import PublicHeader from '@/components/layout/PublicHeader'
import { Loader } from '@/components/Loader'
import { toast } from '@/components/Toast'
import API from '@/lib/api/client-sdk'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Confirm = props => {
  const router = useRouter()
  const [verified, setVerfied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (router.query.email && router.query.token) {
      API.acceptRegistration(router.query.email, router.query.token)
        .then(data => {
          if (data.data.data.verified) {
            setVerfied(true)
            toast.success('Verification Successful')
          }
        })
        .catch(err => {
          setVerfied(false)
          setError(err.response.data.error)

          if (err && err.response && err.response.data) {
            setError(err.response.data.error)
            toast.error(err.response.data.error)
          }
        })
    }
  }, [router.query])

  return (
    <>
      <PublicHeader />
      <div className="container">
        {!verified ? (
          <>
            {error ? (
              <h1 className="text-error">Failed</h1>
            ) : (
              <h1>Verifying</h1>
            )}
            {!error ? <Loader /> : null}
            <span>{error}</span>
          </>
        ) : (
          <>
            <h1>Verified!</h1>
            <p className="cap">You can now close this window</p>
          </>
        )}
      </div>
    </>
  )
}

export default Confirm
