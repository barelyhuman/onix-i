import Button from '@/components/Button'
import { FormControl } from '@/components/FormControl'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import { useRouter } from 'next/router'
import { useState } from 'react'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'

export default withHeader(() => {
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  function onCreate(e) {
    API.createProject(name, description, 0, deadline)
      .then(data => {
        router.push('/dashboard/projects')
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <h2>New Project</h2>
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
        <Button onClick={onCreate}>Create Project</Button>
      </div>
    </>
  )
})
