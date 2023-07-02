import cx from 'classnames'
import { styled } from 'goober'
import Box from '@/components/Box'

const ButtonBox = ({ ...props }) => <Box as="button" {...props} />

const BaseButton = styled(ButtonBox)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: auto;
  min-width: 132px;
  height: 32px;
  padding-right: 8px;
  padding-left: 8px;
  border: 1px solid black;
  background: black;
  color: white;
  font-size: 13px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  transition: 250ms background, border-color ease;

  &:hover {
    border-color: #3f3f46;
    background: #3f3f46;
  }

  &.secondary {
    background: transparent;
    color: #333;
    border-color: #333;
  }

  &.secondary:hover {
    background: transparent;
    color: black;
    border-color: black;
  }

  &.mini {
    width: auto !important;
    min-width: 2px;
    height: 24px;
    font-size: 11px;
    line-height: 24px;
    border-radius: 3px;
  }

  &.negative {
    background: inherit;
    color: #000;
  }

  &.negative:hover {
    box-shadow: 0px 2px 8px rgba(245, 245, 244, 0.5) !important;
  }

  &.large {
    width: auto;
    height: 48px;
    padding-right: 16px;
    padding-left: 16px;
    font-size: 15px;
    line-height: 48px;
  }

  &.danger {
    border: 1px solid #e00;
    background: inherit;
    color: #e00;
  }

  &.danger:hover {
    background: #e00;
    color: #fff;
  }

  &.link {
    border: 0px;
    background: transparent;
    color: #000;
    font-weight: 400;
  }

  &:disabled,
  &.disabled {
    pointer-events: none;
    border-color: var(--muted);
    background: var(--muted);
  }

  &.link.linkActive {
    font-weight: 700;
  }
`

export default function Button({
  secondary,
  danger,
  large,
  mini,
  primary,
  link,
  disabled,
  linkActive,
  negative,
  ...props
}) {
  const classNames = cx(props.className, {
    negative,
    primary,
    secondary,
    mini,
    link,
    linkActive,
    danger,
    disabled,
    large,
  })

  return (
    <BaseButton
      className={classNames}
      onClick={props.onClick}
      type={props.type}
      disabled={props.loading}
      {...props}
    >
      {props.children}
    </BaseButton>
  )
}
