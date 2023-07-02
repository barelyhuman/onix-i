import Button from '@/components/Button'
import Input from '@/components/Input'
import Spacer from '@/components/Spacer'
import PublicHeader from '@/components/layout/PublicHeader'
import useQuery from '@/lib/hooks/use-query'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import { useState } from 'react'

export default function Page() {
  const [otp, setOTP] = useState('')
  const router = useQuery()
  const onValidate = async () => {
    try {
      const token = router.query.token
      await API.validateOTP(otp, token)
      toast.success('Validated, redirecting')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Oop! Something went wrong.')
    }
  }
  return (
    <>
      <PublicHeader />
      <div className="page-width">
        <div className="flex flex-col gap-2">
          <h1>Validate 2FA Challenge </h1>
          <Input
            label="TOTP"
            value={otp}
            onChange={e => setOTP(e.target.value)}
          />
          <Spacer y={2} />
          <div className="ml-auto">
            <Button disabled={otp.length <= 0} onClick={onValidate}>
              Validate
            </Button>
          </div>
          <Spacer y={2} />
          <section>
            <p className="m-null p-null">
              Note: Lost Authenticator? You can also use a recovery code.
            </p>
            <p className="m-null p-null">
              <small>
                <strong>
                  Know that using a recovery code will disable TOTP for your
                  account
                </strong>
              </small>
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
