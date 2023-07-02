import { endOf, startOf } from '@/lib/utils/date'
import { Response } from '@/lib/utils/response.js'

const controller = {
  name: 'WorkLogsController',
}

controller.getTaskLogsForDate = async (req, res) => {
  try {
    const payload = req.query
    const { currentUser } = req

    if (!payload.date) return Response(400, { error: 'Date is required' }, res)

    const baseDate = Number(payload.date)

    const startDate = startOf(new Date(baseDate))
    const endDate = endOf(new Date(baseDate))

    const tasksBetweenRange = await req
      .db('tasks')
      .where({ user_id: currentUser.id })
      .where('tasks.start_time', '>=', startDate)
      .where('tasks.start_time', '<', endDate)

    const data = tasksBetweenRange

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

module.exports = controller
