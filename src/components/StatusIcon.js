import cx from 'classnames'
import { styled } from 'goober'

const Wrapper = styled('span')`
  --bg: #eaeaea;
  display: inline-block;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: var(--bg);

  &.success {
    --bg: #50e3c2;
  }

  &.error {
    --bg: #e00;
  }

  &.warning {
    --bg: #f5a623;
  }
`

export default ({ success, warning, error, ...props }) => {
  const classNames = cx('status-icon-container', { success, warning, error })

  return (
    <>
      <Wrapper {...props} className={classNames}></Wrapper>
    </>
  )
}
