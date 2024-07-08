import cn from 'classnames'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageTitle from '@/components/PageTitle'
import Separator from '@/components/Separator'
import Spacer from '@/components/Spacer'

import withHeader from '@/components/withHeader'
import useUser from '@/lib/hooks/use-user'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import { withLoginRedirect } from '@/lib/middleware/auth'
import { formatTimeSpent, formatDate } from '@/lib/utils/date'

const Dashboard = () => {
  const user = useUser()

  const [averageTimeDuration, setAverageTimeDuration] = useState('7d')
  const [averageTime, setAverageTime] = useState(0)
  const [totalTimeByDuration, setTotalTimeByDuration] = useState(0)
  const [totalTimeSpent, setTotalTimeSpent] = useState([])
  const [closinInProjectDeadline, setClosinInProjectDeadline] = useState(null)

  const router = useRouter()

  useEffect(() => {
    if (user.id && !user.profileName) {
      toast.error('Please update your profile details')
      router.push('/settings/account')
    }
  }, [user])

  useEffect(() => {
    fetchTotalTimeSpent()
    fetchAverageDuration()
    fetchTotalTimeByDuration()
    fetchClosingInProjectDeadline()
  }, [averageTimeDuration])

  function isActiveDuration(str) {
    return str === averageTimeDuration
  }

  function fetchClosingInProjectDeadline() {
    API.fetchClosingInProjectDeadline()
      .then(data => {
        const deadlineProject = data.data.data
        setClosinInProjectDeadline(deadlineProject)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function fetchTotalTimeSpent() {
    API.fetchTotalTimeSpent()
      .then(response => {
        const projectWise = Object.values(response.data.data) || []
        setTotalTimeSpent(projectWise)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function fetchTotalTimeByDuration() {
    API.fetchTotalWorkTimeByDuration(averageTimeDuration)
      .then(data => {
        setTotalTimeByDuration(data.data.data.totalDuration)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function fetchAverageDuration() {
    API.fetchAverageWorkTimeByDuration(averageTimeDuration)
      .then(data => {
        setAverageTime(data.data.data.averageTime)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  const closingInCardClasses = cn({
    danger: !!closinInProjectDeadline,
  })

  return (
    <div>
      <PageTitle
        title="Dashboard"
        description="Gist of your projects and time logs"
      />
      <Spacer y={3}></Spacer>
      <h3 className="text-center">Deadline Closing In</h3>
      <p className="grey text-center">
        <small>Project with a deadline within 7 days will be shown here </small>
      </p>
      <div className="flex justify-center">
        <Card className={closingInCardClasses}>
          <div className="flex justify-between">
            {!closinInProjectDeadline ? (
              <>
                <p className="w-100 text-center">
                  <small className="grey">
                    {'no project closing in'.toUpperCase()}
                  </small>
                </p>
              </>
            ) : (
              <>
                <div>
                  <strong>{closinInProjectDeadline.name}</strong>
                </div>
                <Spacer y={1} x={1} inline />
                <div className="font-20 text-center">
                  {formatDate(closinInProjectDeadline.deadline)}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <Spacer y={3}></Spacer>
      <h3 className="text-center">Average Work Time</h3>
      <div className="flex justify-center">
        <Card>
          <div>
            <div className="flex justify-center">
              <h2>
                {`${formatTimeSpent(averageTime)} `} <br />
              </h2>
            </div>
          </div>
          <Spacer y={2} />
          <Separator />
          <Spacer y={1} />
          <div className="flex justify-center">
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('7d')}
              linkActive={isActiveDuration('7d')}
            >
              7d
            </Button>
            <Spacer x={1} inline />
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('30d')}
              linkActive={isActiveDuration('30d')}
            >
              30d
            </Button>
            <Spacer x={1} inline />
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('1y')}
              linkActive={isActiveDuration('1y')}
            >
              1y
            </Button>
          </div>
        </Card>
      </div>
      <Spacer y={3}></Spacer>
      <h3 className="text-center">Total Work Time</h3>
      <div className="flex justify-center">
        <Card>
          <div>
            <div className="flex justify-center">
              <h2>
                {`${formatTimeSpent(totalTimeByDuration)} `} <br />
              </h2>
            </div>
          </div>
          <Spacer y={2} />
          <Separator />
          <Spacer y={1} />
          <div className="flex justify-center">
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('7d')}
              linkActive={isActiveDuration('7d')}
            >
              7d
            </Button>
            <Spacer x={1} inline />
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('30d')}
              linkActive={isActiveDuration('30d')}
            >
              30d
            </Button>
            <Spacer x={1} inline />
            <Button
              mini
              link
              onClick={e => setAverageTimeDuration('1y')}
              linkActive={isActiveDuration('1y')}
            >
              1y
            </Button>
          </div>
        </Card>
      </div>
      <Spacer y={3}></Spacer>
      <h3 className="text-center">Total Time (Project Wise)</h3>
      <Spacer y={1}></Spacer>
      {!totalTimeSpent.length ? (
        <div className="flex justify-center">
          <div className="card">
            <div className="flex justify-between">
              <div>
                <strong>No Projects...</strong>
              </div>
              <Spacer y={1} x={1} inline />
              <div className="font-20 text-center">
                <Link href="/dashboard/projects/new">
                  <Button>Add Project</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Spacer y={1} />
      {totalTimeSpent.map((item, index) => {
        return (
          <React.Fragment key={`${item.name}-${index}`}>
            <div className="flex justify-center">
              <Card>
                <div className="flex justify-between">
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <Spacer y={1} x={1} inline />
                  <div className="font-20 text-center">
                    {`${formatTimeSpent(item.totalTime * 1000)} `} <br />
                    <span className="grey">
                      <small>Total Time Spent</small>
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            <Spacer y={2} />
          </React.Fragment>
        )
      })}
      <style jsx>{`
        .font-20 {
          font-size: 20px;
        }

        .font-20 small {
          font-size: 14px;
        }

        .text-center {
          text-align: center;
        }

        .grey {
          color: grey;
        }
      `}</style>
    </div>
  )
}

export default withHeader(Dashboard)

export const getServerSideProps = withLoginRedirect('dashboard', async ({}) => {
  const props = {}

  return {
    props,
  }
})
