import Link from 'next/link'
import { useRouter } from 'next/router'
import { styled } from 'goober'

const SidebarContainer = styled('aside')`
  min-height: 100vh;
  flex: 1 0 25%;
  border-right: 1px solid var(--overlay);
  margin-right: 24px;
`

const SidebarList = styled('ul')`
  display: flex;
  margin: 0px;
  margin-top: 60px;
  padding: 6px;
  flex-direction: column;
  align-items: flex-start;
`

const SidebarListItem = styled('li')`
  list-style-type: none;
  padding: 0;
  padding-top: 12px;
  padding-bottom: 12px;

  & > a {
    color: var(--subtle);
  }

  & > a:hover,
  & > a.active {
    color: var(--text);
    font-weight: 600;
  }
`

export default function SettingsSidebar() {
  const router = useRouter()

  const isRouteActive = pathName => router.pathname === pathName

  const isProfileActive = isRouteActive('/settings/account')
  const isIntegrationsActive = isRouteActive('/settings/integrations')

  const isSecurityActive = isRouteActive('/settings/security')

  return (
    <>
      <SidebarContainer>
        <SidebarList>
          <SidebarListItem>
            <Link
              href="/settings/account"
              className={`${isProfileActive ? 'active' : ''}`}
            >
              Profile
            </Link>
          </SidebarListItem>
          <SidebarListItem>
            <Link
              href="/settings/integrations"
              className={`${isIntegrationsActive ? 'active' : ''}`}
            >
              Integration
            </Link>
          </SidebarListItem>
          <SidebarListItem>
            <Link
              href="/settings/security"
              className={`${isSecurityActive ? 'active' : ''}`}
            >
              Security
            </Link>
          </SidebarListItem>
        </SidebarList>
      </SidebarContainer>
    </>
  )
}
