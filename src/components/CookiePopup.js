import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import { styled } from 'goober'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const PopupWrapper = styled('div')`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  overflow-y: auto;
  z-index: 1;
`

const FloatingCard = styled('div')`
  border-radius: 4px;
  padding: 16px;
  color: #000;
  background: var(--base);
  border: 1px solid #000;
  box-shadow: 0px 4px 16px rgba(12, 12, 13, 0.1);
  width: auto;
  display: inline-block;
`

export default function CookiePopup() {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const accepted = window.localStorage.getItem('accepted-cookies')
    if (parseInt(accepted, 10) !== 1) setShowPopup(true)
  }, [])

  const handleOk = e => {
    window.localStorage.setItem('accepted-cookies', '1')
    setShowPopup(false)
  }

  if (!showPopup) return <></>

  return (
    <>
      <PopupWrapper>
        <FloatingCard>
          This site uses cookies to provide you with a great experience. By
          using TillWhen, you accept our use of cookies.
          <Spacer y={1}></Spacer>
          <div className="align-center flex">
            <Button onClick={handleOk}>Accept</Button>
            <Spacer x={2} inline />
            <Link href="/legal/privacy-policy">More Information</Link>
          </div>
        </FloatingCard>
      </PopupWrapper>
    </>
  )
}
