import Box from '@/components/Box'
import SegmentedControl from '@/components/SegmentedControl'
import Spacer from '@/components/Spacer'
import { toast } from '@/components/Toast'
import LogoutIcon from '@/components/icons/logout'
import API from '@/lib/api/client-sdk'
import { styled } from 'goober'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const LogoutLink = styled('a')`
  color: var(--error);

  &:hover {
    color: red;
  }
`

const Container = styled('div')`
  padding: 16px;
`

const PageContainer = styled('div')`
  max-width: 900px;
  margin: 0 auto;
  min-height: 100vh;
`

const NavWrapper = styled(Box)`
  position: relative;
`

export default function withHeader(WrappedComponent) {
  return props => {
    const router = useRouter()
    const [userData, setUserData] = useState({})
    const [active, setActive] = useState('')
    let mounted = false

    useEffect(() => {
      mounted = true
      fetchUser()
      return () => {
        mounted = false
      }
    }, [])

    useEffect(() => {
      let currentRoute
      currentRoute =
        router.pathname === '/dashboard' ? 'dashboard' : currentRoute
      currentRoute =
        router.pathname === '/dashboard/projects' ? 'projects' : currentRoute
      currentRoute =
        router.pathname === '/dashboard/timer' ? 'timer' : currentRoute
      currentRoute = router.pathname === '/account' ? 'account' : currentRoute

      currentRoute =
        router.pathname === '/dashboard/worklogs' ? 'worklogs' : currentRoute

      currentRoute = router.pathname === '/todo' ? 'todo' : currentRoute

      currentRoute = router.pathname.startsWith('/settings')
        ? 'settings'
        : currentRoute

      setActive(currentRoute)
    }, [router.pathname])

    function fetchUser() {
      API.fetchUser()
        .then(data => {
          if (mounted) setUserData(data.data)
        })
        .catch(err => {
          if (err && err.response && err.response.data)
            toast.error(err.response.data.error)
        })
    }

    const getActiveRoute = forRoute => {
      if (active === forRoute) return true

      return false
    }

    return (
      <Container>
        <Spacer y={6} />
        <div>
          <NavWrapper>
            <div>
              <Link href="/dashboard" className="black cursor-pointer">
                <h1 className="font-fancy page-width">TillWhen</h1>
              </Link>
            </div>
            <Spacer y={3} />
            <SegmentedControl
              containerProps={{
                style: {
                  margin: '0 auto',
                  maxWidth: '900px',
                },
              }}
            >
              <SegmentedControl.Control
                active={getActiveRoute('dashboard') ? 'active' : ''}
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </SegmentedControl.Control>
              <SegmentedControl.Control
                active={getActiveRoute('timer') ? 'active' : ''}
                onClick={() => router.push('/dashboard/timer')}
              >
                Timer
              </SegmentedControl.Control>
              <SegmentedControl.Control
                active={getActiveRoute('projects') ? 'active' : ''}
                onClick={() => router.push('/dashboard/projects')}
              >
                Projects
              </SegmentedControl.Control>
              <SegmentedControl.Control
                active={getActiveRoute('todo') ? 'active' : ''}
                onClick={() => router.push('/todo')}
              >
                Task List
              </SegmentedControl.Control>
              <SegmentedControl.Control
                active={getActiveRoute('worklogs') ? 'active' : ''}
                onClick={() => router.push('/dashboard/worklogs')}
              >
                Worklogs
              </SegmentedControl.Control>
              <SegmentedControl.Control
                active={getActiveRoute('settings') ? 'active' : ''}
                onClick={() => router.push('/settings/account')}
              >
                Account
              </SegmentedControl.Control>
              <Box flex marginL-auto className="gap-2">
                <LogoutLink href="/logout">
                  <LogoutIcon />
                </LogoutLink>
              </Box>
            </SegmentedControl>
          </NavWrapper>
        </div>
        <Spacer y={2} />
        <PageContainer>
          <WrappedComponent {...props} />
        </PageContainer>
      </Container>
    )
  }
}
