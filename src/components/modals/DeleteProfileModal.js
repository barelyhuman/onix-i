import { toast } from '@/components/Toast'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmation'
import API from '@/lib/api/client-sdk'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

const DeleteProfileModal = ({
  showDeleteProjectModal,
  setShowDeleteProjectModal,
}) => {
  const router = useRouter()

  function onDeleteAccount() {
    API.deleteProfile()
      .then(data => {
        toast.success('Profile Deleted')
        router.push('/logout')
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <DeleteConfirmationModal
      onClose={() => {
        setShowDeleteProjectModal(false)
      }}
      message={
        <>
          <h3>Are you sure you wish to delete your profile?</h3>
          <p class="text-error">THIS ACTION IS IRREVERSIBLE</p>
        </>
      }
      onOkay={onDeleteAccount}
      open={showDeleteProjectModal}
    />
  )
}

export function useDeleteProfileModal() {
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false)

  const DeleteProfileModalCallback = useCallback(() => {
    return (
      <DeleteProfileModal
        showDeleteProjectModal={showDeleteProfileModal}
        setShowDeleteProjectModal={setShowDeleteProfileModal}
      />
    )
  }, [showDeleteProfileModal, setShowDeleteProfileModal])

  return useMemo(
    () => ({
      setShowDeleteProjectModal: setShowDeleteProfileModal,
      DeleteProjectModal: DeleteProfileModalCallback,
    }),
    [setShowDeleteProfileModal, DeleteProfileModalCallback]
  )
}
