import Button from '@/components/Button'
import { FormControl } from '@/components/FormControl'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import { withLoginRedirect } from '@/lib/middleware/auth'
import { fetchProjectById } from '@/controllers/projects'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { formatDate } from '@/lib/utils/date'

export default withHeader(props => {
  const [name, setName] = useState(props.project.name)
  const [deadline, setDeadline] = useState(
    props.project.deadline ? formatDate(props.project.deadline) : ''
  )
  const [description, setDescription] = useState(props.project.description)
  const router = useRouter()

  function onSave(e) {
    API.editProject(
      router.query.id,
      name,
      description,
      Number(props.project.time_spent),
      deadline
    )
      .then(data => {
        toast.success('Updated')
        router.push('/dashboard/projects')
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <h2>Edit Project</h2>
      <div>
        <div className="flex gap-1">
          <FormControl className="flex-1">
            <label>Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </FormControl>
          <FormControl className="flex-1">
            <label>Project Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </FormControl>
        </div>
        <Spacer y={1} />
        <FormControl>
          <label>Description</label>
          <textarea
            rows="10"
            cols="10"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </FormControl>
      </div>
      <Spacer y={1} />
      <div>
        <Button onClick={onSave}>Save Changes</Button>
      </div>
    </>
  )
})

export const getServerSideProps = async ctx =>
  withLoginRedirect(
    `dashboard/projects/${ctx.params.id}`,
    async ({ params, user }) => {
      const projectDetails = await fetchProjectById(user.id, params.id)
      return {
        props: {
          project: projectDetails,
        },
      }
    }
  )(ctx)
