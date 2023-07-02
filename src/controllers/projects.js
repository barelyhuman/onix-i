import { Response, UnhandledErrorResponse } from '@/lib/utils/response'
import { db } from '@/lib/db'
import { invariant } from '@/lib/invariant'

const controller = {
  name: 'ProjectsController',
}

export default controller

controller.fetchProjects = async (req, res) => {
  try {
    const { currentUser } = req

    const accessToProjects = await req
      .db('project_user_mapping')
      .where({
        'project_user_mapping.user_id': currentUser.id,
        'project_user_mapping.is_active': true,
      })
      .leftJoin('projects', 'project_user_mapping.project_id', 'projects.id')
      .select('projects.*', 'projects.user_id as project_owner_id')

    const hash = []
    const uniqueProjects = accessToProjects.reduce((acc, item) => {
      if (!hash.includes(item.id)) {
        acc.push(item)
        hash.push(item.id)
      }
      return acc
    }, [])

    return Response(
      200,
      {
        data: uniqueProjects,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.editProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id } = req.query
    const payload = req.body

    const projectOwner = await trx('projects').where({
      id,
      user_id: currentUser.id,
    })

    if (!projectOwner.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this project',
        },
        res
      )
    }

    const projectRecordPayload = {
      name: payload.name,
      description: payload.description,
      deadline: payload.deadline || null,
    }

    const details = await trx('projects')
      .where({
        id,
        user_id: currentUser.id,
      })
      .update(projectRecordPayload)
      .returning('*')

    await trx.commit()

    return Response(
      200,
      {
        data: details[0],
        message: 'Updated Project',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.createProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const payload = req.body

    if (!payload.name) {
      await trx.rollback()
      return Response(
        400,
        {
          error: 'Project Name cannot be blank',
        },
        res
      )
    }

    const projectRecordPayload = {
      name: payload.name,
      description: payload.description,
      time_spent: payload.timeSpent,
      user_id: currentUser.id,
      deadline: payload.deadline || null,
    }

    const projectAccessRecordPayload = projectId => ({
      project_id: projectId,
      user_id: currentUser.id,
    })

    const details = await trx('projects')
      .insert(projectRecordPayload)
      .returning('*')

    const projectAccess = await trx('project_user_mapping')
      .insert(projectAccessRecordPayload(details[0].id))
      .returning('*')

    await trx.commit()

    return Response(
      200,
      {
        data: details[0],
        message: 'Added Project',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.addUsersToProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id } = req.query
    const payload = req.body

    const [isProjectOwner, alreadyAdded] = await Promise.all([
      trx('projects').where({
        user_id: currentUser.id,
        id,
      }),
      trx('project_user_mapping').where({
        user_id: payload.userId,
        project_id: id,
      }),
    ])

    if (alreadyAdded.length && alreadyAdded[0] && alreadyAdded[0].is_active) {
      await trx.rollback()
      return Response(
        400,
        {
          error: 'The user is already a part of the project',
        },
        res
      )
    }

    if (!isProjectOwner.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to make changes to this project',
        },
        res
      )
    }

    if (alreadyAdded[0] && alreadyAdded[0].is_active === false) {
      await trx('project_user_mapping')
        .where({
          user_id: payload.userId,
          project_id: id,
        })
        .update({
          is_active: true,
        })

      await trx('tasks')
        .where({
          user_id: payload.userId,
          project_id: id,
        })
        .update({
          is_active: true,
        })
    } else {
      await trx('project_user_mapping').insert({
        user_id: payload.userId,
        project_id: id,
      })
    }

    await trx.commit()
    return Response(
      200,
      {
        message: 'Added User',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchProjectUsers = async (req, res) => {
  try {
    const { currentUser } = req
    const { id } = req.query

    const usersOfProject = await req
      .db('project_user_mapping')
      .where({
        'project_user_mapping.project_id': id,
      })
      .leftJoin('projects', 'project_user_mapping.project_id', 'projects.id')
      .leftJoin('users', 'project_user_mapping.user_id', 'users.id')
      .leftJoin('profiles', 'profiles.user_id', 'users.id')
      .leftJoin('tasks', function () {
        this.on('tasks.project_id', 'projects.id').on(
          'tasks.user_id',
          'users.id'
        )
      })
      .select(
        'users.*',
        'project_user_mapping.is_active as is_project_user_active',
        'projects.user_id as project_owner_id',
        'profiles.name as profile_name',
        'tasks.id as task_id',
        'tasks.time_spent as task_time_spent'
      )

    const withIsOwnerFlag = usersOfProject.map(userRecord => {
      if (userRecord.id === userRecord.project_owner_id)
        userRecord.is_owner = true

      return userRecord
    })

    const groupByUserId = withIsOwnerFlag.reduce((acc, item) => {
      ;(acc[item.id] || (acc[item.id] = [])).push(item)
      return acc
    }, {})

    const aggregation = []

    Object.keys(groupByUserId).forEach(key => {
      const itemClone = JSON.parse(JSON.stringify(groupByUserId[key][0]))
      itemClone.total_time_spent = groupByUserId[key].reduce(
        (acc, item) => acc + parseInt(item.task_time_spent, 10),
        0
      )
      delete itemClone.task_time_spent
      delete itemClone.task_id
      aggregation.push(itemClone)
    })

    return Response(
      200,
      {
        data: aggregation,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchTasksByProject = async (req, res) => {
  try {
    const { currentUser } = req
    const { id } = req.query

    const projectAccess = await req.db('project_user_mapping').where({
      user_id: currentUser.id,
      project_id: id,
    })

    if (!projectAccess.length) {
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to access this project, ask the owner to give you permission',
        },
        res
      )
    }

    const tasksLists = req.db('tasks').where({
      project_id: id,
    })

    return Response(
      200,
      {
        data: tasksLists,
        message: 'Fetched',
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchProjectById = async (req, res) => {
  try {
    const { currentUser } = req
    const { id } = req.query

    const projectAccess = await req.db('project_user_mapping').where({
      user_id: currentUser.id,
      project_id: id,
    })

    if (!projectAccess.length) {
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to access this project, ask the owner to give you permission',
        },
        res
      )
    }

    const projectDetails = await req.db('projects').where({
      id,
    })

    return Response(
      200,
      {
        data: projectDetails[0],
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.fetchUserTasksByProject = async (req, res) => {
  try {
    const { currentUser } = req
    const { id, userId } = req.query

    const projectAccess = await req.db('project_user_mapping').where({
      user_id: currentUser.id,
      project_id: id,
    })

    if (!projectAccess.length) {
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to access this project, ask the owner to give you permission',
        },
        res
      )
    }

    const tasks = await req
      .db('tasks')
      .where({
        'tasks.user_id': userId,
        'tasks.project_id': id,
      })
      .leftJoin('projects', 'projects.id', 'tasks.project_id')
      .select(
        'tasks.*',
        'projects.name as project_name',
        'projects.id as project_id'
      )

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

controller.fetchProjectUserById = async (req, res) => {
  try {
    const { currentUser } = req
    const { id, userId } = req.query
    const projectAccess = await req.db('project_user_mapping').where({
      user_id: currentUser.id,
      project_id: id,
    })

    if (!projectAccess.length) {
      return Response(
        403,
        {
          error:
            'You do not have enough permissions to access this project, ask the owner to give you permission',
        },
        res
      )
    }

    const userDetails = await req
      .db('users')
      .where({
        'users.id': userId,
      })
      .leftJoin('profiles', 'profiles.user_id', 'users.id')
      .select('users.*', 'profiles.name as profile_name')

    return Response(
      200,
      {
        data: userDetails[0],
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.removeUserFromProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id, userId } = req.query

    const projectAccess = await trx('project_user_mapping')
      .where({
        'project_user_mapping.user_id': currentUser.id,
        'project_user_mapping.project_id': id,
      })
      .leftJoin('projects', 'projects.id', 'project_user_mapping.project_id')
      .select('projects.*')

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

    if (projectAccess[0].user_id === parseInt(userId, 10)) {
      await trx.rollback()
      return Response(
        400,
        {
          error: 'Cannot Remove the owner of the project.',
        },
        res
      )
    }

    await trx('project_user_mapping')
      .where({
        user_id: userId,
        project_id: id,
      })
      .update({
        is_active: false,
      })

    await trx('tasks')
      .where({
        user_id: userId,
        project_id: id,
      })
      .update({
        is_active: false,
      })

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

controller.deleteProject = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const { id } = req.query

    const projectOwner = await trx('projects').where({
      user_id: currentUser.id,
      id,
    })

    if (!projectOwner.length) {
      await trx.rollback()
      return Response(
        403,
        {
          error: 'Only the owner of the project can delete it.',
        },
        res
      )
    }

    // Delete Tasks
    await trx('tasks')
      .where({
        project_id: id,
      })
      .del()

    // Delete Member Mapping Permissions

    await trx('project_user_mapping')
      .where({
        project_id: id,
      })
      .del()

    // Delete Project

    await trx('projects')
      .where({
        id,
        user_id: currentUser.id,
      })
      .del()

    await trx.commit()

    return Response(
      200,
      {
        message: 'Deleted Project',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

const errors = {
  accessDenied:
    'You do not have enough permissions to access this project, ask the owner to give you permission',
}

export const getUserProjects = async function (id) {
  invariant(id, '`id` is required')
  const projects = await db('projects')
    .where({
      user_id: id,
    })
    .select([
      'id',
      'name',
      'description',
      'is_active',
      'user_id',
      'created_at',
      'updated_at',
      'deadline',
    ])
  return projects
}

export const fetchProjectById = async function (userId, id) {
  const projectAccess = await db('project_user_mapping')
    .where({
      user_id: userId,
      project_id: id,
    })
    .first()
  if (!projectAccess) {
    throw new Error(errors.accessDenied)
  }
  return await db('projects').where({ id }).first()
}
