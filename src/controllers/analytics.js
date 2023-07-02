import ms from 'ms'
import { endOf, startOf, toHours, toMinutes } from '@/lib/utils/date'
import { Response, UnhandledErrorResponse } from '@/lib/utils/response'

const controller = {
  name: 'AnalyticsController',
}

controller.fetchProjectTimeEstimates = async (req, res) => {
  try {
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.averageWorkTime = async (req, res) => {
  try {
    const { currentUser } = req
    const payload = req.query

    const { duration } = payload

    const start = startOf(new Date(Date.now() - ms(duration)))
    const end = endOf(new Date())

    const tasksInPeriod = await req
      .db('tasks')
      .where({
        user_id: currentUser.id,
      })
      .andWhere('start_time', '>=', start)
      .andWhere('end_time', '<=', end)

    const summation = tasksInPeriod.reduce((acc, item) => {
      return acc + parseInt(item.time_spent, 10)
    }, 0)

    const meanDivider = parseInt(ms(ms(duration)).replace('d', ''), 10)

    const averageTime = Math.floor((summation * 1000) / meanDivider)

    return res.status(200).send({
      data: {
        averageTime,
      },
    })
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchProjectBasedTotalTimeSpent = async (req, res) => {
  try {
    const { currentUser } = req
    const projects = await req
      .db('projects')
      .where({
        'projects.user_id': currentUser.id,
      })
      .leftJoin('tasks', 'tasks.project_id', 'projects.id')
      .select('projects.*', 'tasks.time_spent as task_time_spent')

    const grouping = projects.reduce((acc, item) => {
      ;(
        acc[item.id] || (acc[item.id] = { name: item.name, totalTime: 0 })
      ).totalTime += parseInt(item.task_time_spent, 10)

      return acc
    }, {})

    return Response(
      200,
      {
        data: grouping,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.totalTimeSpentByDuration = async (req, res) => {
  try {
    const { currentUser } = req
    const payload = req.query

    const { duration } = payload

    const start = startOf(new Date(Date.now() - ms(duration)))
    const end = endOf(new Date())

    const tasksInPeriod = await req
      .db('tasks')
      .where({
        user_id: currentUser.id,
      })
      .andWhere('start_time', '>=', start)
      .andWhere('end_time', '<=', end)

    const summation = tasksInPeriod.reduce((acc, item) => {
      return acc + parseInt(item.time_spent, 10)
    }, 0)

    return res.status(200).send({
      data: {
        totalDuration: summation * 1000,
      },
    })
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.exportProjectTimeline = async (req, res) => {
  try {
    const payload = req.query

    const { currentUser } = req

    const hasAccessToProject = await req
      .db('project_user_mapping')
      .where({ project_id: payload.projectId, user_id: currentUser.id })

    if (!hasAccessToProject || !hasAccessToProject.length) {
      return Response(
        400,
        { error: "You don't have access to this project." },
        res
      )
    }

    const project = await req
      .db('projects')
      .where({ id: payload.projectId })
      .select('projects.user_id')

    const tasks = await req.db('tasks').where({ project_id: payload.projectId })

    const isOwner = currentUser.id === project[0].user_id

    let _tasks = tasks.slice()

    if (!isOwner)
      _tasks = _tasks.filter(item => item.user_id === currentUser.id)

    let csvString = ''
    let totalTimeSpent = 0

    // Headers
    csvString += 'Task Name,'
    csvString += 'Time Spent (in seconds),'
    csvString += 'Time Spent (in minutes),'
    csvString += 'Time Spent (in hours),'
    csvString += 'Date\n'

    // Body
    _tasks.forEach((taskItem, taskIndex) => {
      totalTimeSpent += parseInt(taskItem.time_spent, 10)
      csvString += `\"${taskItem.name}\",`
      csvString += `${taskItem.time_spent},`
      csvString += `${toMinutes(taskItem.time_spent)},`
      csvString += `${toHours(taskItem.time_spent)},`
      csvString += `${taskItem.created_at}\n`
    })

    csvString += '\n'
    csvString += '\n'

    csvString += `Total Time Spent,${ms(totalTimeSpent * 1000)}`

    csvString += '\n'

    res.setHeader('Content-disposition', 'attachment; filename=testing.csv')
    res.setHeader('Content-Type', 'text/csv')
    res.status(200)
    return res.send(csvString)
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.getClosestProjectDeadline = async (req, res) => {
  try {
    const { currentUser } = req

    const dateOnlyAsMills = date =>
      new Date(new Date(date).setHours(0, 0, 0, 0)).getTime()

    const allProjects = await req
      .db('project_user_mapping')
      .leftJoin('projects', 'projects.id', 'project_user_mapping.project_id')
      .where({ 'project_user_mapping.user_id': currentUser.id })
      .select(
        'projects.id as id',
        'projects.deadline as deadline',
        'projects.name as name'
      )

    let closestProject = null
    allProjects.forEach(item => {
      if (!item.deadline) {
        return
      }

      if (closestProject) {
        closestProject =
          dateOnlyAsMills(item.deadline) <
            dateOnlyAsMills(closestProject.deadline) &&
          dateOnlyAsMills(item.deadline) >= dateOnlyAsMills(new Date())
            ? item
            : closestProject
      } else {
        if (dateOnlyAsMills(item.deadline) >= dateOnlyAsMills(new Date()))
          closestProject = item
      }
    })

    if (!closestProject) {
      return Response(
        200,
        {
          data: null,
        },
        res
      )
    }

    const now = new Date().getTime()
    const deadline = new Date(closestProject.deadline).getTime()
    const minDiff = ms('7d')

    if (deadline - now > minDiff) {
      return Response(
        200,
        {
          data: null,
        },
        res
      )
    }

    return Response(
      200,
      {
        data: closestProject,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

module.exports = controller
