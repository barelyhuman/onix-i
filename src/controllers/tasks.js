import { Response, UnhandledErrorResponse } from '@/lib/utils/response'

const controller = {
  name: 'TasksController',
}

controller.fetchTasks = async (req, res) => {
  try {
    const { currentUser } = req

    const tasks = await req
      .db('tasks')
      .leftJoin('projects', 'projects.id', 'tasks.project_id')
      .where({
        'tasks.user_id': currentUser.id,
      })
      .select(
        'tasks.*',
        'projects.name as project_name',
        'projects.id as project_id'
      )
      .orderBy('created_at', 'desc')
      .limit(25)

    return Response(
      200,
      {
        data: tasks,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.createTask = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const payload = req.body

    if (payload.projectId) {
      const projectAccess = await trx('project_user_mapping').where({
        user_id: currentUser.id,
        project_id: payload.projectId,
      })

      if (!projectAccess.length) {
        await trx.rollback()
        return Response(
          403,
          {
            error:
              'You do not have enough permissions to access this project, ask the owner to give you permission',
          },
          res
        )
      }
    }

    const recordPayload = {
      name: payload.name,
      time_spent: Math.abs(payload.timeSpent),
      user_id: currentUser.id,
    }

    if (
      new Date(payload.startTime).getTime() >
      new Date(payload.endTime).getTime()
    ) {
      recordPayload.start_time = payload.endTime
      recordPayload.end_time = payload.startTime
    } else {
      recordPayload.start_time = payload.startTime
      recordPayload.end_time = payload.endTime
    }

    if (payload.projectId) recordPayload.project_id = payload.projectId

    const taskDetails = await trx('tasks').insert(recordPayload).returning('*')

    await trx.commit()
    return Response(
      200,
      {
        message: 'Added Task',
        data: taskDetails[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchTaskById = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const payload = req.body

    await trx.commit()
    return Response(
      200,
      {
        data: [],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.editTask = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id } = req.query
    const payload = req.body

    const ownTask = await trx('tasks').where({
      id,
      user_id: currentUser.id,
      is_active: true,
    })

    if (!ownTask.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this task',
        },
        res
      )
    }

    const recordPayload = {}

    if (payload.name) recordPayload.name = payload.name

    if (payload.timeSpent) recordPayload.time_spent = payload.timeSpent

    if (payload.projectId) recordPayload.project_id = payload.projectId

    if (currentUser.id) recordPayload.user_id = currentUser.id

    const taskDetails = await trx('tasks').update(recordPayload).where({
      id,
      user_id: currentUser.id,
    })

    if (taskDetails < 1) {
      return Response(
        500,
        {
          error: 'Updation Error',
        },
        res
      )
    }

    await trx.commit()
    return Response(
      200,
      {
        message: 'Updated Task',
        data: taskDetails[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.addTaskToProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const payload = req.body
    const { id, projectId } = req.query

    const [ownTask, projectAccess] = await Promise.all([
      trx('tasks').where({
        id,
        user_id: currentUser.id,
        is_active: true,
      }),
      trx('project_user_mapping').where({
        user_id: currentUser.id,
        project_id: projectId,
      }),
    ])

    if (!ownTask.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this task',
        },
        res
      )
    }

    if (!projectAccess.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to access this project, ask the owner to give you permission',
        },
        res
      )
    }

    const updations = await trx('tasks')
      .where({
        id,
        user_id: currentUser.id,
      })
      .update({
        project_id: projectId,
      })
      .returning('*')

    await trx.commit()
    return Response(
      200,
      {
        data: updations[0],
        message: 'Added Task to Project',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.deleteTask = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { id } = req.query
    const { currentUser } = req

    const ownTask = await trx('tasks').where({
      id,
      user_id: currentUser.id,
    })

    if (!ownTask.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this task',
        },
        res
      )
    }

    const taskDetails = await trx('tasks')
      .where({
        id,
        user_id: currentUser.id,
      })
      .del()

    await trx.commit()

    return Response(
      200,
      {
        message: 'Task Deleted!',
        data: taskDetails[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.removeProjectFromTask = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id } = req.query

    const [ownTask] = await Promise.all([
      trx('tasks').where({
        id,
        user_id: currentUser.id,
        is_active: true,
      }),
    ])

    if (!ownTask.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this task',
        },
        res
      )
    }
    const updations = await trx('tasks')
      .where({
        id,
        user_id: currentUser.id,
      })
      .update({
        project_id: null,
      })
      .returning('id')

    await trx.commit()

    return Response(
      200,
      {
        data: updations[0],
        message: 'Removed Task',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

export default controller;
