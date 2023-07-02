export default function Separator(props) {
  const style = {
    height: 1,
    background: '#efefef',
    width: '100%',
  }

  return <div style={style}>{props.children}</div>
}
