import { findInOptions } from '@/lib/constants'
import { Response } from '@/lib/utils/response.js'

const controller = {
  name: 'TodosController',
}

controller.fetchTodos = async (req, res) => {
  try {
    const { currentUser } = req

    const todos = await req
      .db('todos')
      .where({ user_id: currentUser.id })
      .select('*')
      .orderBy('todos.created_at', 'desc')

    const data = todos.map(x => {
      x.statusLabel = findInOptions('TODO_STATUS', x.status)
      return x
    })

    return Response(
      200,
      {
        data,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return Response(err.code, err.message, res)
  }
}

controller.addTodo = async (req, res) => {
  let trx
  try {
    const payload = req.body

    const { currentUser } = req

    if (!payload.content)
      return Response(400, { error: 'Cannot create an empty todo' }, res)

    const _payload = {
      content: payload.content,
      project_id: payload.project_id,
      user_id: currentUser.id,
    }

    trx = await req.db.transaction()

    const todo = await trx('todos').insert(_payload).returning(['id'])

    await trx.commit()

    return Response(
      200,
      {
        data: todo[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return Response(err.code, err.message, res)
  }
}

controller.deleteTodo = async (req, res) => {
  let trx
  try {
    const payload = req.query

    const { currentUser } = req

    if (!payload.todoId)
      return Response(400, { error: 'Need an id to delete the task' }, res)

    trx = await req.db.transaction()

    await trx('todos')
      .where({
        id: payload.todoId,
        user_id: currentUser.id,
      })
      .del()

    await trx.commit()

    return Response(
      200,
      {
        message: 'Deleted',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return Response(err.code, err.message, res)
  }
}

controller.updateProjectAssignment = async (req, res) => {
  let trx
  try {
    const { projectId, id } = req.query
    const payload = req.body
    const { currentUser } = req

    trx = await req.db.transaction()

    const isProjectIdValid = !!parseInt(projectId, 10)
    let _projectId = projectId
    if (!isProjectIdValid) _projectId = null

    const updated = await trx('todos')
      .where({
        id,
        user_id: currentUser.id,
      })
      .update({ project_id: _projectId || null })
      .returning(['id'])

    await trx.commit()

    return Response(
      200,
      {
        message: 'Updated',
        data: updated[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return Response(err.code, err.message, res)
  }
}

controller.updateTaskStatus = async (req, res) => {
  let trx
  try {
    const { status, id } = req.query
    const payload = req.body
    const { currentUser } = req

    trx = await req.db.transaction()

    const updated = await trx('todos')
      .where({
        user_id: currentUser.id,
        id,
      })
      .update({
        status,
      })
      .returning(['id'])

    await trx.commit()

    return Response(
      200,
      {
        message: 'Updated',
        data: updated[0],
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    console.error(err)
    return Response(err.code, err.message, res)
  }
}

module.exports = controller
