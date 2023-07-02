import Button from '@/components/Button'
import { FormControl } from '@/components/FormControl'
import Separator from '@/components/Separator'
import Spacer from '@/components/Spacer'
import { toast } from '@/components/Toast'
import { useDeleteProfileModal } from '@/components/modals/DeleteProfileModal'
import withAuth from '@/components/withAuth'
import withHeader from '@/components/withHeader'
import withSettingsSidebar from '@/components/withSettingsSidebar'
import { getUserDetails } from '@/controllers/user'
import API from '@/lib/api/client-sdk'
import { withLoginRedirect } from '@/lib/middleware/auth'
import { useRouter } from 'next/router'
import { useState } from 'react'

function Page(props) {
  const [name, setName] = useState(props?.user?.profiles?.name || '')
  const [email, setEmail] = useState(props?.user?.email || '')
  const { setShowDeleteProjectModal, DeleteProjectModal } =
    useDeleteProfileModal()
  const router = useRouter()

  function onDelete() {
    return setShowDeleteProjectModal(true)
  }

  function onSaveProfile() {
    API.updateProfile({
      name,
      email,
    })
      .then(data => {
        toast.success('Profile Updated')
        router.push('/dashboard')
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <h1>Profile</h1>
      <DeleteProjectModal />
      <div>
        <FormControl>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </FormControl>
      </div>
      <Spacer y={1} />
      <FormControl>
        <label>Email</label>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </FormControl>
      <Spacer y={2} />
      <Button onClick={e => onSaveProfile()}>Save</Button>
      <Spacer y={2} />
      <Separator />
      <h2>Housekeeping</h2>
      <div>
        <p>
          All your data will be permanently deleted and nothing is archived /
          backed up withing TillWhen.{' '}
          <strong>
            If you wish to continue, know that there is no turning back
          </strong>
        </p>
        <Button danger onClick={e => onDelete()}>
          Delete Account
        </Button>
      </div>
    </>
  )
}

export const getServerSideProps = withLoginRedirect(
  'settings/account',
  async ({ user }) => {
    const data = await getUserDetails(user.id)

    return {
      props: {
        user: data,
      },
    }
  }
)

//FIXME: remove withAuth
export default withAuth(withHeader(withSettingsSidebar(Page)))
