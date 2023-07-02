import Button from '@/components/Button'
import DateHeader from '@/components/DateHeader'
import { FormControl } from '@/components/FormControl'
import { Popover } from '@/components/Popover'
import Spacer from '@/components/Spacer'
import StatusIcon from '@/components/StatusIcon'
import API, { fetcher } from '@/lib/api/client-sdk'
import { formatProjectsToOptions } from '@/lib/client/project'
import { formatTimeSpent } from '@/lib/utils/date'
import React, { useRef, useState } from 'react'
import useSWR from 'swr'
import { toast } from './Toast'

export default function TasksList({ showActions, refresh, data = [] }) {
  const [enableEdit, setEdit] = useState(0)
  const [name, setName] = useState('')
  const { data: projects } = useSWR('/projects', fetcher().get)
  const statusPopoverTrigger = useRef()

  function onEditClick(item) {
    setEdit(item.id)
    setName(item.name)
  }

  function onNameChange(e) {
    e.preventDefault()
    setName(e.target.value)
  }

  function onCancel() {
    setName('')
    setEdit(0)
  }

  function onDelete(item) {
    API.deleteTask(item.id)
      .then(data => {
        refresh()
        setName('')
        setEdit(0)
        toast.success(data.data.message)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function getProjectOptions() {
    if (!projects) return []

    return formatProjectsToOptions(projects.data.data)
  }

  function onSave(item) {
    API.editTask(item.id, name)
      .then(data => {
        refresh()
        setName('')
        setEdit(0)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function removeTaskFromProject(taskId) {
    API.removeTaskFromProject(taskId)
      .then(data => {
        refresh()
        setName('')
        toast.success('Updated Project')
        setEdit(0)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function onProjectSelection(e, taskId) {
    if (!e.target.value) removeTaskFromProject(taskId)
    else addTaskToProject(taskId, e.target.value)
  }

  function addTaskToProject(taskId, projectId) {
    API.addTaskToProject(taskId, projectId)
      .then(data => {
        toast.success('Updated Project')
        refresh()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function getProjectName(taskItem) {
    if (!projects) return '-'

    if (!taskItem.is_active) return taskItem.project_name || '-'

    const match = projects.data.data.find(
      item => item.id === taskItem.project_id
    )
    return match.name
  }

  const getDateString = date => new Date(date).toISOString().split('T')[0]

  const dataByDate = data.reduce((acc, item) => {
    const dateKey = getDateString(item.start_time || item.created_at)
    ;(acc[dateKey] || (acc[dateKey] = [])).push(item)
    return acc
  }, {})

  const sortByDate = keys =>
    keys.sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

  function getTotalTimeOnDate(records = []) {
    const sum = records.reduce((acc, item) => {
      return acc + parseInt(item.time_spent, 10)
    }, 0)
    return formatTimeSpent(sum * 1000)
  }

  return (
    <div>
      <div>
        {!data || !data.length ? (
          <div className="card">
            <div className="align-center flex justify-center">
              Nothing to show...
            </div>
          </div>
        ) : null}
        {sortByDate(Object.keys(dataByDate))
          .reverse()
          .map(date => (
            <React.Fragment key={`${date}-tasklist-key`}>
              <DateHeader date={date} />
              <p className="text-grey">
                <span>
                  <small>Total: </small>
                </span>
                {getTotalTimeOnDate(dataByDate[date])}
              </p>
              {dataByDate[date].map(item => (
                <React.Fragment key={item.id}>
                  <div className="bottom-separator">
                    <div className="align-center flex flex-wrap gap-2">
                      {!item.is_active ? (
                        <>
                          <div>
                            <Popover
                              content={
                                <>
                                  This Task has been archived.
                                  <br /> The User cannot edit or delete these
                                  tasks.
                                </>
                              }
                            >
                              <StatusIcon error />
                            </Popover>
                          </div>
                        </>
                      ) : null}
                      <div className="w-auto">
                        <p className="timer-font m-null">
                          {formatTimeSpent(item.time_spent * 1000)}
                        </p>
                      </div>
                      <div className="w-33">
                        {enableEdit === item.id ? (
                          <FormControl>
                            <label>Task Name</label>
                            <input value={name} onChange={onNameChange} />
                          </FormControl>
                        ) : (
                          item.name
                        )}
                      </div>
                      <div className="w-33">
                        {showActions && item.is_active ? (
                          <FormControl>
                            <label htmlFor={`select-project-${item.id}`}>
                              Project
                            </label>
                            <select
                              id={`select-project-${item.id}`}
                              placeholder="No Project"
                              value={item.project_id || ''}
                              onChange={e => onProjectSelection(e, item.id)}
                            >
                              <option value="">No Project</option>
                              {getProjectOptions().map(item => {
                                return (
                                  <option value={item.value} key={item.key}>
                                    {item.text}
                                  </option>
                                )
                              })}
                            </select>
                          </FormControl>
                        ) : (
                          <SafePopover
                            title="Note"
                            content="You don't have permissions to edit this"
                            trigger="hover"
                          >
                            <label>{getProjectName(item)}</label>
                          </SafePopover>
                        )}
                      </div>
                      <div className="ml-auto flex w-auto flex-col gap-1">
                        {showActions && item.is_active ? (
                          enableEdit === item.id ? (
                            <>
                              <Button onClick={e => onSave(item)}>Save</Button>
                              <Spacer x={1} inline />
                              <Button secondary onClick={onCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={e => onEditClick(item)}>
                                Edit
                              </Button>
                              <Spacer x={1} inline />
                              <Button secondary onClick={e => onDelete(item)}>
                                Delete
                              </Button>
                            </>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
      </div>
      <style jsx>{`
        .card {
          border-radius: 4px;
          padding: 16px;
          border: 1px solid rgba(12, 12, 13, 0.1);
          box-shadow: 0px 1px 4px rgba(12, 12, 13, 0.1);
          min-width: 132px;
          display: inline-block;
          width: 100%;
        }

        .timer-font {
          font-size: 16px;
          font-weight: bold;
        }
        .w-33 {
          width: 33%;
        }

        .f-normal {
          font-size: 16px;
        }

        .flex-wrap {
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}
