import Box from './Box'

const TitleHeader = ({ ...props }) => <Box as="h2" {...props} />
const TitleDescription = ({ ...props }) => <Box as="p" {...props} />

const PageTitle = ({ title, description }) => {
  return (
    <>
      <div className="page-title">
        <TitleHeader margin-0px padding-0px>
          {title}
        </TitleHeader>
        <TitleDescription margin-0px padding-0px>
          <small>{description}</small>{' '}
        </TitleDescription>
      </div>
    </>
  )
}

export default PageTitle
