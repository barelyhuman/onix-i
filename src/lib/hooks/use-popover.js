import { useEffect, useState } from 'react'

export function usePopover(triggerRef) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!(triggerRef && triggerRef.current)) return

    let handler

    const onMouseEnter = e => {
      handler = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
    }

    const onMouseLeave = e => {
      if (handler) clearTimeout(handler)
      setIsOpen(false)
    }

    triggerRef?.current.addEventListener('mouseenter', onMouseEnter)
    triggerRef?.current.addEventListener('mouseleave', onMouseLeave)

    return () => {
      triggerRef?.current?.removeEventListener('mouseenter', onMouseEnter)
      triggerRef?.current?.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [triggerRef, triggerRef.current])

  return { isOpen }
}
