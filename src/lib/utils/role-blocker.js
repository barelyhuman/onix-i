const { Response } = require('@/lib/utils/response')

const UnauthorizedRequest = res => {
  return Response(
    401,
    {
      error: "You don't have enough permissions to access this resource",
    },
    res
  )
}

export default forRoles => async (req, res, next) => {
  try {
    const { currentUser } = req

    if (!currentUser || !currentUser.id || !currentUser.role)
      return UnauthorizedRequest(res)

    const [rolesPromiseResult, roleMapping] = await Promise.all([
      req.db('roles').where(),
      req.db('role_mapping').where({
        user_id: 1,
        role: currentUser.role,
      }),
    ])

    const roles = rolesPromiseResult.map(item => item.name)

    if (!roles.includes(currentUser.role)) return UnauthorizedRequest(res)

    if (!roleMapping.length) return UnauthorizedRequest(res)

    const matchingRole = roleMapping.find(roles => {
      return forRoles.includes(roles.role)
    })

    if (!matchingRole) return UnauthorizedRequest(res)

    next()
  } catch (err) {
    return UnauthorizedRequest(res)
  }
}
