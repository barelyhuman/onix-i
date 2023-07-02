import { serialize } from 'cookie'
import isDev from '@/lib/utils/is-dev'

export default function Logout() {
  return <>Logging you out...</>
}

export async function getServerSideProps({ res }) {
  res.setHeader(
    'Set-Cookie',
    serialize('auth', '', {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      secure: !isDev(),
      path: '/',
      sameSite: 'lax',
    })
  )

  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
    props: {},
  }
}
