import Button from '@/components/Button'
import { FormControl } from '@/components/FormControl'
import PublicHeader from '@/components/layout/PublicHeader'
import Spacer from '@/components/Spacer'
import { withAutoLogin } from '@/lib/middleware/auth'
import { toast } from '@/components/Toast'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import API from '@/lib/api/client-sdk'

const Login = props => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const [mailToken, setMailToken] = useState(null)
  const intervalHandler = useRef(null)

  useEffect(() => {
    return () => {
      stopVerificationLoop()
    }
  }, [])

  useEffect(() => {
    if (mailToken) startVerificationLoop()
  }, [mailToken])

  const stopVerificationLoop = () => {
    if (intervalHandler.current) clearInterval(intervalHandler.current)
  }

  const startVerificationLoop = () => {
    intervalHandler.current = setInterval(() => {
      API.verifyRegistration(email, mailToken)
        .then(data => {
          if (data.data.data.verified) {
            if (data.data.data.auth?.secondary) {
              router.push(`/totp/verify?token=${data.data.data.token}`)
            } else if (router.query && router.query.redirect)
              router.push(router.query.redirect)
            else router.push('/dashboard')

            stopVerificationLoop()
          }
        })
        .catch(err => {
          if (err && err.response && err.response.data)
            toast.error(err.response.data.error)
        })
    }, 2500)
  }

  const onSumbit = e => {
    e.preventDefault()
    setLoading(true)
    API.register(email)
      .then(data => {
        setLoading(false)
        toast.success(`Login Email sent to ${email}`)
        setMailToken(data.data.data.token)
      })
      .catch(err => {
        setLoading(false)
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <PublicHeader />
      <div className="container">
        <section className="growth-container login-container">
          <h1>Login</h1>
          <p className="max-tagline-width">Let's Start</p>
          <div className="login-wrapper">
            {!mailToken ? (
              <div>
                <form onSubmit={onSumbit}>
                  <div>
                    <div className="w-250-px flex justify-center">
                      <FormControl className="flex-1">
                        <label>Email</label>
                        <input
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <Spacer y={3} />
                  <div>
                    <div className="">
                      <Button primary onClick={onSumbit}>
                        Login
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="font-size-16">
                  <div>
                    <p>
                      We sent an email to <strong>{email}.</strong>
                    </p>
                  </div>
                </div>
                <div className="font-size-16">
                  <div>
                    <p>
                      Please log in to your email and verify the login request
                      <br />
                      <small className="text-subtle">
                        (Kindly also check your <strong>SPAM</strong> folder)
                      </small>
                    </p>
                    <p>Waiting for confirmation</p>
                    <div className="">
                      <i className="gg-spinner-alt"></i>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default Login

export const getServerSideProps = withAutoLogin
