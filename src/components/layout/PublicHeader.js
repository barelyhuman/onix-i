import Link from 'next/link'
import React from 'react'
import { styled } from 'goober'

const Row = styled('div')`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`

const Navigation = styled('nav')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  max-width: 85ch;
  min-width: 35ch;
  min-height: 100px;
`

const NavigationLink = styled('a', React.forwardRef)`
  font-size: 14px;
  color: var(--subtle);
  text-decoration: none;
  padding: 4px 18px;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;

  &:hover {
    color: var(--text);
    background: var(--surface);
  }

  &.accented {
    color: #fff;
    background: #000;
  }

  &.accented:hover {
    color: #fff;
    background: var(--text);
  }
`

const Header = styled('header')`
  flex-wrap: wrap;
  height: auto;
`

export default function PublicHeader() {
  return (
    <>
      <Header className="container">
        <Row>
          <h1 className="font-fancy">
            <Link href="/" className="black cursor-pointer">
              TillWhen
            </Link>
          </h1>
          <Navigation>
            <Link href="/">
              <NavigationLink>Home</NavigationLink>
            </Link>
            <Link href="/about">
              <NavigationLink>About</NavigationLink>
            </Link>
            <Link href="/get-in-touch">
              <NavigationLink>Get In Touch</NavigationLink>
            </Link>
            <Link href="/open">
              <NavigationLink>Open</NavigationLink>
            </Link>
            <Link href="/updates">
              <NavigationLink>Updates</NavigationLink>
            </Link>
            <Link href="/legal/privacy-policy">
              <NavigationLink>Privacy</NavigationLink>
            </Link>
            <Link href="/login">
              <NavigationLink className="accented">App &rsaquo;</NavigationLink>
            </Link>
          </Navigation>
        </Row>
      </Header>
    </>
  )
}
