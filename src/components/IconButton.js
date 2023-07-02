import { styled } from 'goober'
import cx from 'classnames'
import Box from './Box'

const IconWrapper = styled(Box)`
  margin: 0px;
  --ggs: 1;
  --fg: #000;
  --bg: #fff;
  height: 42px;
  box-sizing: border-box;
  width: 42px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0px 2px 8px rgba(12, 12, 13, 0.1);
  background: var(--bg);
  color: var(--fg);
  transition: all 250ms ease;

  &.large {
    --ggs: 1.5;
    height: 56px;
    width: 56px;
    padding: 8px;
  }

  &.transparent {
    background: transparent;
  }

  &.primary {
    --fg: #fff;
    --bg: #000;
  }

  &:hover {
    --fg: var(--bg);
    --bg: var(--fg);
    cursor: pointer;
    box-shadow: inset 0px 0px 4px rgba(12, 12, 13, 0.1);
  }
`

const IconButton = ({ large, icon, transparent, primary, ...props }) => {
  const styleClasses = cx('icon-container', { large, transparent, primary })
  return (
    <>
      <IconWrapper className={styleClasses} {...props}>
        <i className={icon}></i>
      </IconWrapper>
    </>
  )
}

export default IconButton
