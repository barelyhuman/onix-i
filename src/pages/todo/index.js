import Button from '@/components/Button'
import Input from '@/components/Input'
import PageTitle from '@/components/PageTitle'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import { useEffect, useState } from 'react'
import { FormControl } from '@/components/FormControl'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import { withLoginRedirect } from '@/lib/middleware/auth'
import { options } from '@/lib/constants'

export default withHeader(_ => {
  const [task, setTask] = useState('')
  const [taskList, setTaskList] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [projectList, setProjectList] = useState([])
  const [filter, setFilter] = useState({
    status: '',
    project: '',
  })

  useEffect(() => {
    fetchProjects()
    fetchTodos()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [filter])

  useEffect(() => {
    filterTasks()
  }, [allTasks])

  function handleKeyup(e) {
    if (e.keyCode === 13) {
      const newTask = {
        content: e.target.value,
        projectName: 'Hello',
      }
      setTask('')
      resetFilters()
      saveTodo(newTask)
    }
  }

  function fetchProjects() {
    API.fetchProjects()
      .then(data => {
        setProjectList(data.data.data)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function saveTodo(todo) {
    API.createTodo(todo)
      .then(_ => {
        toast.success('Added')
        fetchTodos()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function fetchTodos() {
    API.fetchTodos()
      .then(data => {
        setTaskList(data.data.data)
        setAllTasks(data.data.data)
        return true
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function deleteTodo(todoId) {
    API.deleteTodo(todoId)
      .then(_ => {
        toast.success('Deleted')
        return fetchTodos()
      })
      .then(filterTasks)
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function assignToProject(todoId, projectId) {
    API.assignProjectToTodo(todoId, projectId)
      .then(_ => {
        toast.success('Updated')
        fetchTodos()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function removeTodoFromProject(todoId) {
    API.assignProjectToTodo(todoId, null)
      .then(_ => {
        toast.success('Updated')
        fetchTodos()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  // function getProjectName(projectId) {
  //   let name = '-'
  //   const match = projectList.find(item => item.id === projectId)
  //   if (match)
  //     name = match.name

  //   return name
  // }

  function onProjectSelection(e, taskId) {
    if (!e.target.value) removeTodoFromProject(taskId)
    else assignToProject(taskId, e.target.value)
  }

  function onStatusChange(e, taskId) {
    API.updateTodoStatus(taskId, e.target.value)
      .then(_ => {
        toast.success('Updated')
        fetchTodos()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function updateFilter(key, value) {
    setFilter({ ...filter, [key]: value })
  }

  function resetFilters() {
    setFilter({
      status: '',
      project: '',
    })
  }

  function filterTasks() {
    let newTaskListSet = allTasks.slice()
    newTaskListSet = newTaskListSet.filter(item => {
      let projectFilter = true
      let statusFilter = true

      if (filter.project)
        projectFilter = parseInt(item.project_id) === parseInt(filter.project)

      if (filter.status) {
        statusFilter = parseInt(item.status) === parseInt(filter.status)
      }

      return projectFilter && statusFilter
    })

    setTaskList(newTaskListSet)
  }

  return (
    <>
      <PageTitle title="Task List" description="" />
      <Spacer y={3}></Spacer>

      <Input
        label="Task Name"
        id={'task-name'}
        placeholder="New Task? Press Enter to Save "
        value={task}
        autoFocus
        onKeyUp={handleKeyup}
        onChange={e => setTask(e.target.value)}
      />

      <Spacer y={2} />
      <h3>Filters</h3>
      <Spacer y={1} />

      <div className="align-center flex">
        <div className="w-100">
          <FormControl>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              placeholder="No Status"
              value={filter.status}
              onChange={e => updateFilter('status', e.target.value)}
            >
              <option value="">None</option>
              {Object.values(options.TODO_STATUS).map((item, index) => {
                return (
                  <option value={item.value} key={`status-${index}`}>
                    {item.label}
                  </option>
                )
              })}
            </select>
          </FormControl>
        </div>
        <Spacer x={2} inline />
        <div className="w-100">
          <FormControl>
            <label htmlFor="project">Project</label>
            <select
              id="project"
              placeholder="No Project"
              value={filter.project || ''}
              onChange={e => updateFilter('project', e.target.value)}
            >
              <option value="">None</option>
              {projectList.map(item => {
                return (
                  <option value={item.id} key={`status-${item.id}`}>
                    {item.name}
                  </option>
                )
              })}
            </select>
          </FormControl>
        </div>
      </div>
      <Spacer y={1} />
      <div className="flex justify-end">
        <Button mini secondary onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      <Spacer y={3} />

      <div className="card">
        <ul className="task-list">
          {taskList.length ? (
            taskList.map(item => (
              <li key={`todo-${item.id}`}>
                <div className="align-start flex gap-2">
                  <div className="flex-1">
                    <h3 className="m-null p-null">{item.content}</h3>
                  </div>
                  <div className="align-center flex">
                    <div>
                      <FormControl>
                        <label>Todo Status</label>
                        <select
                          placeholder="No Project"
                          value={item.status}
                          onChange={e => onStatusChange(e, item.id)}
                        >
                          {Object.values(options.TODO_STATUS).map(
                            (item, index) => {
                              return (
                                <option
                                  value={item.value}
                                  key={`status-${index}`}
                                >
                                  {item.label}
                                </option>
                              )
                            }
                          )}
                        </select>
                      </FormControl>
                    </div>
                  </div>

                  <div className="align-center flex">
                    <div>
                      <FormControl>
                        <label>Project</label>
                        <select
                          placeholder="No Project"
                          value={item.project_id || ''}
                          onChange={e => onProjectSelection(e, item.id)}
                        >
                          <option value="">No Project</option>
                          {projectList.map(item => {
                            return (
                              <option value={item.id} key={`status-${item.id}`}>
                                {item.name}
                              </option>
                            )
                          })}
                        </select>
                      </FormControl>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Button danger onClick={e => deleteTodo(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="empty-task-list">
              Guess what? You'll have to add a few before we can list them here
            </li>
          )}
        </ul>
      </div>

      <style jsx>
        {`
          .card {
            border-radius: 4px;
            padding: 16px;
            border: 1px solid rgba(12, 12, 13, 0.1);
            box-shadow: 0px 1px 4px rgba(12, 12, 13, 0.1);
            min-width: 132px;
            display: inline-block;
            width: 100%;
          }

          .task-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
          }

          .task-list > li {
            padding: 16px;
          }

          .task-list > li:not(:last-child) {
            border-bottom: 1px solid #efefef;
          }

          .empty-task-list {
            text-align: center;
          }

          .text-secondary {
            color: #666;
          }

          .flat-border {
            border-radius: 4px;
            border: 1px solid #efefef;
            padding: 16px;
          }
        `}
      </style>
    </>
  )
})

export const getServerSideProps = withLoginRedirect('todo', async ({}) => {
  const props = {}
  return {
    props,
  }
})
