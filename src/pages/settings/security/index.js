import withAuth from '@/components/withAuth'
import withHeader from '@/components/withHeader'
import withSettingsSidebar from '@/components/withSettingsSidebar'
import API from '@/lib/api/client-sdk'
import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from '@/components/Toast'
import If from '@/components/If'
import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'
import { AuthController } from '@/controllers'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Spacer from '@/components/Spacer'
import Card from '@/components/Card'
import { withLoginRedirect } from '@/lib/middleware/auth'

function Page({ totpEnabled: _totpEnabled }) {
  const [showQR, setShowQR] = useState(false)
  const [otp, setOTP] = useState('')
  const [totpEnabled, setTOTPEnabled] = useState(_totpEnabled)
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const QRCodeURL = useRef()

  const toggleEnable = async () => {
    if (!showQR) {
      const response = await API.fetchTOTPSecret()
      QRCodeURL.current = response.data
    }
    setShowQR(!showQR)
  }

  const onDisable = async () => {
    try {
      await API.disableTOTPforUser(otp)
      setOTP('')
      toast.success('TOTP Disabled for your account')
      await fetchTOTPStatus()
    } catch (err) {
      toast.error('Oops! Something went wrong')
    }
  }

  const onValidate = async () => {
    try {
      const response = await API.enableTOTPforUser(
        QRCodeURL.current.secret,
        otp
      )
      setOTP('')
      setRecoveryCodes(response.data.recoveryCodes)
      toast.success('TOTP Enabled for your account')
      await fetchTOTPStatus()
    } catch (err) {
      toast.error('Oops! Something went wrong')
    }
  }

  const fetchTOTPStatus = async () => {
    return setTOTPEnabled((await API.fetchTOTPStatus()).data.enabled)
  }

  return (
    <>
      <h1>Security</h1>
      <h3>TOTP (Alpha)</h3>
      <If condition={!totpEnabled}>
        <section className="flex flex-col">
          <div>
            <p>
              <strong> Instructions</strong>
            </p>
            <ol>
              <li>
                Click on <strong>Enable</strong> below to generate a new QR Code
                for your 2FA
              </li>
              <li>
                Scan the QRCode with any authenticator app (Google
                Aunthenticator, Twilio Authy, etc)
              </li>
              <li>
                Enter the generated TOTP from the Authenticator app in the TOTP
                input below and click on Validate to enable 2FA for your account
              </li>
            </ol>
            <If condition={!showQR}>
              <Button onClick={toggleEnable}>Enable</Button>
            </If>
          </div>
          {showQR ? (
            <>
              <Spacer y={2} />
              <div className="flex flex-col gap-2">
                <QRCodeSVG
                  bgColor={`var(--base)`}
                  fgColor={`var(--text)`}
                  value={QRCodeURL.current.url}
                />
                <a className="link" href={QRCodeURL.current.url}>
                  {QRCodeURL.current.url}
                </a>
              </div>
              <Spacer y={2} />
              <div className="flex flex-col gap-2">
                <Input
                  label="TOTP"
                  value={otp}
                  onChange={e => setOTP(e.target.value)}
                />
                <div className="ml-auto flex gap-1">
                  <Button disabled={otp.length <= 0} onClick={onValidate}>
                    Validate
                  </Button>
                  <Button secondary onClick={toggleEnable}>
                    Cancel
                  </Button>
                </div>
              </div>
              <Spacer y={2} />
            </>
          ) : null}
        </section>
      </If>
      <If condition={totpEnabled}>
        <If condition={recoveryCodes.length}>
          <Card className="info">
            <h3 className="m-null p-null">Recovery Codes</h3>
            <p>
              <strong>
                These will not be shown again, please make note of them
                somewhere secure.
              </strong>
            </p>
            <p>
              You can make use of recovery codes to log into the account, in
              case you ever lose your authenticator app.
            </p>
            <section>
              <ul>
                {recoveryCodes.map((code, i) => {
                  return <li key={i}>{code}</li>
                })}
              </ul>
            </section>
          </Card>
        </If>
        <section className="flex flex-col gap-2">
          <div>
            <p>
              <strong> Instructions</strong>
            </p>
            <p>
              Enter the current TOTP from your auntenticator to disable TOTP
            </p>
            <Input
              value={otp}
              label="TOTP"
              onChange={e => setOTP(e.target.value)}
            />
          </div>
          <div>
            <Button onClick={onDisable}>Disable</Button>
          </div>
        </section>
      </If>
    </>
  )
}

//FIXME: remove withAuth
export default withAuth(withHeader(withSettingsSidebar(Page)))

export const getServerSideProps = withLoginRedirect(
  'dashboard',
  async ({ user, req, res }) => {
    await initialRequestHandler({ req, res, auth: true })
    return {
      props: {
        totpEnabled: await AuthController.isTOTPEnabledFunc(req.db, user.id),
      },
    }
  }
)
