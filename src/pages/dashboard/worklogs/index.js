import Card from '@/components/Card'
import Datepicker from '@/components/Datepicker'
import If from '@/components/If'
import PageTitle from '@/components/PageTitle'
import Spacer from '@/components/Spacer'
import TasksList from '@/components/TasksList'
import withHeader from '@/components/withHeader'
import { useState } from 'react'
import { fetcher } from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import useSWR from 'swr'
import { withLoginRedirect } from '@/lib/middleware/auth'

const fetchWithUrl = url => {
  return fetcher().get(url)
}

const WorkLogs = props => {
  const [forDate, setForDate] = useState('')

  const {
    data: tasks,
    error,
    mutate: tasksMutate,
  } = useSWR(
    !forDate ? null : `/worklogs?date=${forDate.getTime()}`,
    fetchWithUrl
  )

  if (error) {
    const errorMsg = error.response.data.message || error.response.data.error
    toast.error(errorMsg)
    return <></>
  }

  function handleDateChange({ date }) {
    setForDate(new Date(date))
  }

  function handleDateClear() {
    setForDate('')
  }

  return (
    <>
      <div className="app">
        <PageTitle
          title="Work Logs"
          description="All your time logs in one place"
        />
        <Spacer y={3}></Spacer>
        <div className="align-center flex flex-col justify-center">
          <Card>
            <p>Choose a Date to start</p>
            <Datepicker
              onToday={() => setForDate(new Date())}
              value={forDate}
              showTime={false}
              onChange={handleDateChange}
              onClear={handleDateClear}
            />
          </Card>
        </div>

        <If condition={tasks}>
          <Spacer y={2}></Spacer>
          <TasksList
            showActions
            refresh={tasksMutate}
            data={tasks?.data?.data}
          />
        </If>
      </div>
    </>
  )
}

export default withHeader(WorkLogs)

export const getServerSideProps = withLoginRedirect(
  'dashboard/worklogs',
  async ({}) => {
    const props = {}
    return {
      props,
    }
  }
)
