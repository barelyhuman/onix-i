import Router from 'next/router'
import NProgressLib from 'nprogress'

let timeout

export const start = () => {
  timeout = setTimeout(NProgressLib.start, 100)
}

export const done = () => {
  clearTimeout(timeout)
  NProgressLib.done()
}

Router.events.on('routeChangeStart', start)
Router.events.on('routeChangeComplete', done)
Router.events.on('routeChangeError', done)

const NProgess = () => <></>

export default NProgess
