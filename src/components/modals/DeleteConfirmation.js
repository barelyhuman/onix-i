import dynamic from 'next/dynamic'

import { styled } from 'goober'
import Button from '@/components/Button'
import CheckIcon from '@/components/icons/check'
import RemoveIcon from '@/components/icons/remove'

const TinyModal = dynamic(
  () =>
    import('react-tiny-modal').then(mod => {
      return mod.Modal
    }),
  { ssr: false }
)

const Modal = styled(TinyModal)`
  background: var(--surface) !important;
  color: var(--text);
`

const DeleteConfirmationModal = props => (
  <Modal isOpen={props.open} onClose={props.onClose}>
    <h1>Are you sure you want to?</h1>
    <div>
      <p className="f-16 border-left-red">
        {props.message || 'This Action is irreversible'}
      </p>
    </div>
    <div className="flex gap-2">
      <Button onClick={props.onClose} danger>
        <span className="align-center flex gap-1">
          <span className="flex-inline">
            <RemoveIcon height="16" width="16" />
          </span>{' '}
          No
        </span>
      </Button>
      <Button onClick={props.onOkay}>
        <span className="align-center flex gap-1">
          <span className="flex-inline">
            <CheckIcon height="16" width="16" />
          </span>{' '}
          Yes
        </span>
      </Button>
    </div>
    <style jsx global>
      {`
        .f-16 {
          font-size: 16px;
        }

        .border-left-red {
          border-left: 5px solid red;
          padding-left: 10px;
        }
      `}
    </style>
  </Modal>
)

export default DeleteConfirmationModal
