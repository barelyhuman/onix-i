import React from 'react'
import { modsToStyle as spaceryStyles } from 'spacery'
import { modsToStyle as flexeryStyles } from 'flexery'

const Box = ({ as = 'div', style, children, ...props }) => {
  const { style: spaceStyles, sanitizedProps } = spaceryStyles(props, 'px')
  const { style: flexStyles, sanitizedProps: sanitizedFlexProps } =
    flexeryStyles(sanitizedProps, '')

  return React.createElement(
    as,
    {
      style: {
        ...spaceStyles,
        ...flexStyles,
        ...style,
      },
      ...sanitizedFlexProps,
    },
    children
  )
}

export default Box
