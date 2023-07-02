import React, { useCallback, useState } from 'react'

import { styled } from 'goober'
import Box from './Box'

const Container = styled(Box)`
  position: relative;
`

const Nav = styled('nav', React.forwardRef)`
  width: 100%;
  display: flex;
  gap: 10px;
  transition: opacity, clip-path 500ms cubic-bezier(0.91, 0.01, 0, 1.01);
  color: var(--subtle);
  align-items: center;

  & > button {
    padding: 6px;
    min-width: 10ch;
    margin-right: 16px;
    background: transparent;
    border: 0px;
    display: flex;
    color: inherit;
    align-items: center;
    justify-content: center;
  }

  &.overlay {
    display: flex;
    border-bottom: 2px solid black;
    top: 0;
    left: 0;
    position: absolute;
    color: var(--text);
    opacity: 0.5;
  }
`

const SegmentedButton = styled('button', React.forwardRef)`
  &:hover {
    color: var(--text);
    cursor: pointer;
  }
`

function getActiveAreaStyle(containerNode, elementNode) {
  const navRect = containerNode.getBoundingClientRect()
  const buttonRect = elementNode.getBoundingClientRect()
  const right = navRect.right - buttonRect.right
  const left = buttonRect.left - navRect.left
  return {
    opacity: 1,
    clipPath: `inset(0 ${right}px 0 ${left}px)`,
  }
}

const STORAGE = 'segmented'

export default function SegmentedControl({
  containerProps,
  className = '',
  children,
}) {
  const [activeBoundStyle, setActiveBoundsStyle] = useState({})

  const initialActiveBounds = React.useCallback(node => {
    if (node === null) {
      return
    }
    const existingActive = localStorage.getItem(STORAGE)
    if (existingActive) {
      setActiveBoundsStyle(JSON.parse(existingActive))
    } else {
      setActiveBoundsStyle({
        clipPath: 'inset(0 100% 0 0)',
      })
    }
  }, [])

  const makeActive = element => {
    const overlay = document.querySelector('#overlay-nav')
    if (!overlay) return
    const _styl = getActiveAreaStyle(overlay, element)
    localStorage.setItem(STORAGE, JSON.stringify(_styl))
    setTimeout(() => {
      setActiveBoundsStyle(_styl)
    }, 250)
  }

  const modified = React.Children.map(children, child => {
    const modified = React.cloneElement(child, {
      makeActive: makeActive,
    })
    return modified
  })

  return (
    <>
      <Container {...containerProps}>
        <Nav className={`${className}`}>{modified}</Nav>
        <Nav
          id="overlay-nav"
          className={`overlay ${className}`}
          ref={initialActiveBounds}
          style={activeBoundStyle}
        >
          {modified}
        </Nav>
      </Container>
    </>
  )
}

SegmentedControl.Control = ({ makeActive, active, children, onClick }) => {
  const setInitialActive = useCallback(
    node => {
      if (active && node) {
        makeActive(node)
      }
    },
    [active]
  )

  return (
    <SegmentedButton
      ref={setInitialActive}
      onClick={e => {
        makeActive(e.target)
        onClick?.()
      }}
    >
      {children}
    </SegmentedButton>
  )
}
