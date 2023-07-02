import cx from 'classnames'
import { FormControl } from '@/components/FormControl'
import { nanoid } from 'nanoid'

const Input = ({ id = nanoid(), label, textCenter, ...props }) => {
  const classNames = cx('tinput-wrapper', {
    textCenter,
  })
  return (
    <>
      <FormControl>
        <label htmlFor={id}>{label}</label>
        <input id={id} {...props} />
      </FormControl>

      <style jsx>{`
        .tinput-wrapper {
          position: relative;
          width: 100%;
        }

        .tinput-wrapper > input {
          border: 0px;
          background: inherit;
          outline: none;
          padding: 10px;
          width: 100%;
          color: #000;
          border-radius: 0px;
          font-family: 'Quicksand', sans-serif;
          border-bottom: 1px solid #eaeaea;
          position: relative;
        }

        .tinput-wrapper.textCenter > input {
          text-align: center;
        }

        .tinput-wrapper .tinput-line {
          content: '';
          height: 2px;
          width: 100%;
          position: absolute;
          background: #000;
          bottom: 0;
          left: 0;
          transform: scaleX(0);
          transition: transform 250ms ease;
        }

        .tinput-wrapper input:focus + .tinput-line {
          transform: scaleX(1);
        }
      `}</style>
    </>
  )
}

export default Input
