export default function If({ condition = false, children, ...props }) {
  return condition ? children : null
}
