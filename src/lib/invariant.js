export const invariant = function (
  value,
  message = `Invariant failed ${value}`
) {
  if (!value) {
    throw new Error(message)
  }
}
