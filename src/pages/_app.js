import CookiePopup from '@/components/CookiePopup'
import NProgress from '@/components/nprogress'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/global.css'
import Head from '@/components/Head'
import React, { useEffect } from 'react'

import { setup } from 'goober'

setup(React.createElement)

function App({ Component, pageProps }) {
  return (
    <>
      <NProgress></NProgress>
      <CookiePopup />
      <Head />
      <Component {...pageProps} />
      <ToastContainer></ToastContainer>
    </>
  )
}

export default App
