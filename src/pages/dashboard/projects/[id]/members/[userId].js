import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import { toast } from '@/components/Toast'
import withHeader from '@/components/withHeader'
import API, { APIFetcher } from '@/lib/api/client-sdk'
import { formatTimeSpent } from '@/lib/utils/date'
import { parse } from 'cookie'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

const TasksList = dynamic(() => import('@/components/TasksList'), {
  ssr: false,
})

export default withHeader(({ userData, ...props }) => {
  const [tasks, setTasks] = useState(props.tasks)

  const router = useRouter()

  function getUserTasks(projectId, userId) {
    API.fetchUserTasksByProject(projectId, userId)
      .then(data => {
        setTasks(data.data.data)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function getTotalTimeSpent() {
    const sum = tasks.reduce((acc, item) => {
      return acc + parseInt(item.time_spent, 10)
    }, 0)

    if (sum) return formatTimeSpent(sum * 1000)

    return '-'
  }

  return (
    <>
      <Button secondary onClick={e => router.back()}>
        Back
      </Button>
      <Spacer y={2} />
      <div>
        <h2>{userData.profile_name}</h2>
      </div>
      <Spacer y={2} />
      <div>
        <p className="space-0">
          <span>
            <small className="grey">Total Time Spent</small>
          </span>
        </p>
        <h1 className="space-0">{getTotalTimeSpent()}</h1>
      </div>
      <Spacer y={2} />
      <div>
        <h3>Tasks</h3>
        <TasksList data={tasks} showActions={false} refresh={getUserTasks} />
      </div>
      <style jsx>
        {`
          .grey {
            color: grey;
          }

          .space-0 {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </>
  )
})

export async function getServerSideProps({ params, req, res }) {
  const cookies = parse(req.headers.cookie)
  const config = {
    auth: {
      token: cookies.auth,
    },
  }
  const props = {
    userData: {},
    tasks: [],
  }

  const userDetails = await APIFetcher(config, res).get(
    `/projects/${params.id}/users/${params.userId}`
  )
  const tasksResponse = await APIFetcher(config, res).get(
    `/projects/${params.id}/users/${params.userId}/tasks`
  )

  if (userDetails.data) props.userData = userDetails.data.data || []

  if (tasksResponse.data) props.tasks = tasksResponse.data.data || []

  return {
    props,
  }
}
