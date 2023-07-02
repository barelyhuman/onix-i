import { styled } from 'goober'
import SettingsSidebar from '@/components/SettingsSiderbar'
import Box from './Box'

const Container = styled('div')`
  flex: 1 0 75%;
  flex-wrap: wrap;
  word-wrap: break-word;
  word-break: break-word;
`

export default function withSettingsSidebar(ChildComponent) {
  return function ({ ...props }) {
    return (
      <Box flex className="gap-1">
        <SettingsSidebar />
        <Container>
          <ChildComponent {...props} />
        </Container>
      </Box>
    )
  }
}
