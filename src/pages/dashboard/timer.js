import Button from '@/components/Button'
import Datepicker from '@/components/Datepicker'
import IconButton from '@/components/IconButton'
import PageTitle from '@/components/PageTitle'
import Spacer from '@/components/Spacer'

import withHeader from '@/components/withHeader'
import API, { fetcher } from '@/lib/api/client-sdk'

import { toast } from '@/components/Toast'

import format from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import parse from 'date-fns/parse'

import ms from 'ms'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import isWindow from '@/lib/utils/is-window'

import ErrorText from '@/components/ErrorText'
import { Loader } from '@/components/Loader'
import { withLoginRedirect } from '@/lib/middleware/auth'

import * as Popover from '@radix-ui/react-popover'
import { styled } from 'goober'
import { FormControl } from '@/components/FormControl'
import { formatTimeSpent, millisecondsToTimeSpent } from '@/lib/utils/date'
import { getUserProjects } from '@/controllers/projects'
import { formatProjectsToOptions } from '@/lib/client/project'

const TasksList = dynamic(() => import('@/components/TasksList'), {
  ssr: false,
})

const PickerTrigger = styled(Popover.Trigger, React.forwardRef)`
  border: 1px solid var(--muted);
  padding: 10px;
  border-radius: 6px;
  background: transparent;
  &:hover {
    cursor: pointer;
    background: var(--overlay);
  }
`

const PickerContainer = styled(Popover.Content, React.forwardRef)`
  border-radius: 6px;
  background: var(--surface);
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
`

function DatePickerModal({ onValidSelection, onClear }) {
  const [logDate, setLogDate] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState({ title: '', desc: '' })

  useEffect(() => {
    if (logDate && fromTime && toTime)
      onValidSelection && onValidSelection({ logDate, fromTime, toTime })
  }, [logDate, fromTime, toTime])

  const handleDateChange = ({ date }) => {
    setLogDate(date)
  }

  const handleTimeChange = ({ from, to } = {}) => {
    setError({ title: '', desc: '' })

    if (!logDate) {
      return
    }

    let _fromTime
    let _toTime

    if (from) {
      _fromTime = parse(from, 'HH:mm', new Date(logDate))
    }

    if (to) {
      _toTime = parse(to, 'HH:mm', new Date(logDate))

      if (isAfter(_toTime, new Date())) {
        setError({
          title: 'Predicting the future now, are we?',
          desc: "Please select a valid end time that's not in the future",
        })
        return
      }
    }

    if (!(_fromTime && _toTime)) {
      return
    }

    if (isBefore(_toTime, _fromTime)) {
      setError({
        title: "Uh, that doesn't seem right?",
        desc: 'Invalid times, please recheck them before moving forward',
      })
      return
    }

    setFromTime(_fromTime)
    setToTime(_toTime)
  }

  const getTimeRangeText = () => {
    const unselectedText = '+ Log Time Manually'

    if (!logDate) {
      return unselectedText
    }

    if (!(fromTime && toTime)) {
      return format(new Date(logDate), 'dd/MM/yyyy')
    }

    return `${format(new Date(fromTime), 'dd/MM/yyyy hh:mm a')} - ${format(
      new Date(toTime),
      'dd/MM/yyyy hh:mm a'
    )} `
  }

  return (
    <React.Fragment>
      <Popover.Root open={open} onOpenChange={s => setOpen(s)}>
        <PickerTrigger>{getTimeRangeText()}</PickerTrigger>
        <Popover.Anchor />
        <Popover.Portal>
          <PickerContainer>
            <Datepicker
              maxDate={new Date()}
              onChange={handleDateChange}
              value={logDate}
              onClear={() => {
                setLogDate('')
                setFromTime('')
                setToTime('')
                onClear && onClear()
              }}
              onTimeChange={handleTimeChange}
              onClose={() => {
                setOpen(false)
              }}
              onToday={() => {
                setLogDate(new Date())
              }}
            />
            <ErrorText>
              <strong>{error.title}</strong>
              <br />
              {error.desc}
            </ErrorText>
          </PickerContainer>
        </Popover.Portal>
      </Popover.Root>
    </React.Fragment>
  )
}

const Timer = props => {
  const timeFormat = 'yyyy-MM-dd hh:mm:ss a'
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [taskName, setTaskName] = useState('')
  // const [tasks, setTasks] = useState(props.tasks);
  const [selectedProject, setSelectedProject] = useState()
  const [loading, setLoading] = useState(false)
  const [showSaveButton, setShowSaveButton] = useState(false)
  const [logStartTime, setStartTime] = useState(new Date())
  const [logEndTime, setEndTime] = useState(null)

  const { data: tasks, mutate: tasksMutate } = useSWR('/tasks', fetcher().get)

  const logKeyMap = {
    start: 'logStart',
    stop: 'logStop',
    seconds: 'loggedSeconds',
    paused: 'logPaused',
    taskName: 'taskName',
    project: 'project',
  }

  useEffect(() => {
    const taskName = getLog('taskName')
    const project = parseInt(getLog('project'), 10)

    const isProjectValid = props.projects.find(x => x.item.id === project)

    if (isProjectValid) {
      setSelectedProject(project)
    }

    if (taskName) setTaskName(taskName)
  }, [props.projects])

  useEffect(() => {
    if (!isWindow()) return

    const pausedStatus = getLog('paused', false)
    const secondsExpended = getLog('seconds', 0)

    if (pausedStatus && pausedStatus === '1') {
      setSeconds(secondsExpended)
      setStartTime(new Date())
      setEndTime(new Date(Date.now() + secondsExpended * 1000))
      setLog('start', String(Date.now()))
    }

    continueTimer()
  }, [])

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setEndTime(new Date())
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!logStartTime || !logEndTime) {
      setSeconds(0)
      setShowSaveButton(false)
      return
    }
    setLog('seconds', getLogDiff())
    setSeconds(getLogDiff())
  }, [logStartTime, logEndTime])

  function onProjectSelection(value) {
    setLog('project', value || '')
    setSelectedProject(value)
  }

  function continueTimer() {
    if (!isWindow()) return

    const pausedStatus = getLog('paused')

    if (parseInt(pausedStatus, 10) === 1) return

    const existingDate = parseInt(getLog('start'), 10)
    if (existingDate) {
      setStartTime(new Date(existingDate))
      setSeconds(getLogDiff())
      setIsActive(true)
    }
  }

  function getLogDiff() {
    if (!isWindow()) return

    if (!logEndTime) return 0

    return Math.floor((logEndTime - logStartTime) / 1000)
  }

  function startTimer() {
    if (!isWindow()) return

    const pausedStatus = getLog('paused')
    const secondsExpended = getLog('seconds', 0)
    if (parseInt(pausedStatus, 10) === 1) {
      const nextStartTime = new Date(Date.now() - secondsExpended * 1000)
      setLog('paused', '0')
      setLog('start', String(nextStartTime.getTime()))
      setStartTime(nextStartTime)
      setSeconds(secondsExpended)
      setEndTime(new Date())
      setIsActive(true)
      return
    }

    setStartTime(new Date())
    setLog('start', String(Date.now()))
    setIsActive(!isActive)
  }

  function pauseTimer() {
    setLog('paused', '1')
    setIsActive(!isActive)
  }

  function stopTimer() {
    if (!isWindow()) return

    setIsActive(false)
    setLog('paused', '0')
    setEndTime(new Date())
    createTask()
  }

  function createTask() {
    const diff = getLogDiff()
    API.createTask(
      taskName || 'Untitled',
      diff,
      selectedProject,
      new Date(logStartTime),
      new Date(logEndTime)
    )
      .then(data => {
        reset()
        setTaskName('')
        tasksMutate()
      })
      .catch(err => {
        setIsActive(true)
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function saveLog() {
    if (!isWindow()) return

    setIsActive(false)
    createTask()
  }

  function reset() {
    setSeconds(0)
    setLog('paused', '0')
    setIsActive(false)
    setShowSaveButton(false)
    setStartTime(new Date())
    setEndTime(null)
    if (isWindow()) {
      Object.keys(logKeyMap).forEach(key => {
        window.localStorage.removeItem(logKeyMap[key])
      })
    }
  }

  function calculateAggregatedSeconds(exisitingVal, additionVal, timeFactor) {
    const currentValue = millisecondsToTimeSpent(exisitingVal * 1000)[
      timeFactor
    ]
    const valueInMills = ms(`${currentValue}${timeFactor}`)
    const additionValInMills = ms(`${additionVal}${timeFactor}`)
    return (exisitingVal * 1000 - valueInMills + additionValInMills) / 1000
  }

  function setLog(startStop, logTime) {
    window.localStorage.setItem(logKeyMap[startStop], logTime)
  }

  function getLog(key, defaultVal) {
    const val = window.localStorage.getItem(logKeyMap[key])
    if (val) return val
    else if (typeof defaultVal !== 'undefined') return defaultVal
  }

  function handleTaskNameChange(e) {
    setLog('taskName', e.target.value)
    setTaskName(e.target.value)
  }

  function onClear() {
    setShowSaveButton(false)
    setStartTime('')
    setEndTime('')
  }

  function onValidSelection(data) {
    setShowSaveButton(true)
    setStartTime(data.fromTime)
    setEndTime(data.toTime)
  }

  return (
    <div className="app">
      <PageTitle title="Timer" description="Time Log your tasks" />
      <Spacer y={3}></Spacer>
      {loading && <Loader />}
      <div className="">
        <div className="">
          <div>
            <div className="flex gap-1">
              <FormControl className="flex-1">
                <label htmlFor="task-name">Task</label>
                <input
                  id="task-name"
                  autoFocus
                  value={taskName}
                  onChange={handleTaskNameChange}
                  placeholder="Enter a Task"
                />
              </FormControl>
              <FormControl>
                <label htmlFor="project"> Project</label>
                <select
                  id="project"
                  value={selectedProject}
                  defaultValue={selectedProject}
                  onChange={e => onProjectSelection(e.target.value)}
                >
                  <option value="">Select Project</option>
                  {props.projects.map(item => {
                    return (
                      <option value={item.value} key={item.key}>
                        {item.text}
                      </option>
                    )
                  })}
                </select>
              </FormControl>
            </div>
          </div>
          <Spacer y={1}></Spacer>
          <div className="align-center w-100 flex justify-center">
            <div className="w-100 flex flex-wrap justify-between gap-2">
              <DatePickerModal
                onValidSelection={onValidSelection}
                onClear={onClear}
              />
              <div className="align-center flex flex-1 justify-center">
                <p className="text-xl">
                  <strong>{formatTimeSpent(seconds * 1000)}</strong>
                </p>
              </div>
              <div className="align-center flex  flex-col justify-center">
                {!showSaveButton ? (
                  <div>
                    {isActive ? (
                      <>
                        <div className="align-center flex">
                          <IconButton
                            onClick={stopTimer}
                            large
                            primary
                            icon="gg-play-stop"
                          />
                          <Spacer x={1} inline />
                          <IconButton
                            onClick={pauseTimer}
                            icon="gg-play-pause"
                          />
                        </div>
                      </>
                    ) : (
                      <IconButton
                        onClick={startTimer}
                        large
                        primary
                        icon="gg-play-button"
                      />
                    )}
                  </div>
                ) : null}
                <Spacer y={1}></Spacer>
                <div>
                  {showSaveButton ? (
                    <Button primary onClick={saveLog}>
                      Save
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Spacer y={2}></Spacer>
      </div>
      <Spacer y={6} />
      {tasks ? (
        <TasksList showActions refresh={tasksMutate} data={tasks.data.data} />
      ) : null}
    </div>
  )
}

export default withHeader(Timer)

export const getServerSideProps = withLoginRedirect(
  'dashboard/timer',
  async ({ user }) => {
    const props = {}

    props.projects = formatProjectsToOptions(await getUserProjects(user.id))

    return {
      props,
    }
  }
)
