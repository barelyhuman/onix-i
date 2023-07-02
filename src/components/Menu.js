import cn from 'classnames'
import { useRef, useState } from 'react'
import useOnClickOutside from '@/lib/hooks/use-click-outside'

import { styled } from 'goober'

const Item = styled('div')`
  display: block;
  color: var(--text);
  max-width: 200px;
  text-align: left;

  & > a {
    padding: 8px 24px;
    width: 100%;
    display: block;
  }

  &:hover {
    background: var(--overlay);
    color: var(--text);
  }
`

const Container = ({
  className,
  triggerElement,
  triggerLabel,
  children,
  triggerStyle,
}) => {
  const containerRef = useRef()
  const cx = cn('menu-container', className)

  useOnClickOutside(containerRef, () => {
    setShow(false)
  })

  const [show, setShow] = useState(false)

  return (
    <>
      <div className={cx} ref={containerRef}>
        <div
          className="menu-trigger"
          onClick={e => {
            setShow(!show)
          }}
          style={triggerStyle}
        >
          {triggerLabel || triggerElement}
        </div>
        {show && (
          <div className="menu-wrapper">
            <div className="menu">{children}</div>
          </div>
        )}
      </div>
      <style jsx>
        {`
          .menu-container {
            display: block;
            position: relative;
            flex-direction: column;
          }

          .menu-container .menu-trigger {
            color: inherit;
          }

          .menu-container:hover .menu-trigger {
            color: #000;
          }

          .menu-trigger {
            color: #inherit;
          }

          .menu {
            min-width: 150px;
            max-width: 100vw;
          }

          .menu-container .menu-wrapper {
            display: inline-block;
            background: var(--surface);
            padding: 8px 0px;
            margin: 0;
            padding: 0px;
            border: 1px solid rgba(12, 12, 13, 0.1);
            box-shadow: 0 1px 4px rgba(12, 12, 13, 0.1);
            border-radius: 4px;
            position: absolute;
            width: 150px;
            min-width: auto;
            max-width: 100vw;
            top: 25px;
            left: 0;
          }
        `}
      </style>
    </>
  )
}

export default { Container, Item }
