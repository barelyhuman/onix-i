import useQuery from '@/lib/hooks/use-query'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { parse } from 'cookie'

export default function withAuth(WrappedComponent) {
  return props => {
    const router = useQuery()
    const navRouter = useRouter()

    useEffect(() => {
      if (!router) return
      const movingFrom = router.asPath
      const token = parse(document.cookie).auth
      if (!token) navRouter.push(`/login?redirect=${movingFrom}`)
    }, [])

    return <WrappedComponent {...props} />
  }
}
