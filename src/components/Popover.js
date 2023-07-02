import { usePopover } from '@/lib/hooks/use-popover'
import React, { useRef } from 'react'
import { Popover as RTPopover } from 'react-tiny-popover'
import { styled } from 'goober'
import InfoIcon from '@/components/icons/info'

export const SafePopover = props => {
  if (typeof window === 'undefined') return props.children
  return <RTPopover {...props} />
}

export const Popover = ({ content, children }) => {
  const trigger = useRef()
  const { isOpen } = usePopover(trigger)

  return (
    <SafePopover
      isOpen={isOpen}
      content={
        <PopoverNote>
          <div className="align-center flex gap-2">
            <InfoIcon />
            <p className="m-null">{content}</p>
          </div>
        </PopoverNote>
      }
    >
      <HiddenTrigger
        onRender={node => {
          trigger.current = node
        }}
      >
        {children}
      </HiddenTrigger>
    </SafePopover>
  )
}

export const PopoverNote = styled('div')`
  border: 2px solid var(--overlay);
  background: var(--surface);
  width: auto;
  min-width: 150px;
  padding: 1em;
  border-radius: 6px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.12);
`

const HiddenTriggerContainer = styled('div')`
  position: relative;
`

const HiddenTriggerElm = styled('div')`
  opacity: 0;
  position: absolute;
  height: 100%;
  width: 100%;
`

export const HiddenTrigger = React.forwardRef(({ children, onRender }, ref) => {
  return (
    <HiddenTriggerContainer ref={ref}>
      <HiddenTriggerElm
        ref={node => {
          if (node) onRender(node)
        }}
      />
      {children}
    </HiddenTriggerContainer>
  )
})
