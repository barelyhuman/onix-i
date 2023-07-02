import Button from '@/components/Button'
import PageTitle from '@/components/PageTitle'
import Spacer from '@/components/Spacer'
import StatusIcon from '@/components/StatusIcon'
import withAuth from '@/components/withAuth'
import withHeader from '@/components/withHeader'
import { toast } from '@/components/Toast'
import axios from 'axios'
import useSWR from 'swr'
import { toTitleCase } from '@/lib/utils/text-formatters'
import withSettingsSidebar from '../../../components/withSettingsSidebar'
import { PROVIDERS } from '@/lib/constants'
import { withLoginRedirect } from '@/lib/middleware/auth'

const fetcher = url => axios.get(url)

function IntegrationsScreen(props) {
  const { data, error, mutate } = useSWR('/api/v1/integrations', fetcher)

  if (error && error.response && error.response.data)
    toast.error(error.response.data.error)

  if (!data) {
    return (
      <>
        <Spacer y={2} />
        <div className="container">
          <div className="flex justify-center">
            <i className="gg-spinner-alt"></i>
          </div>
        </div>
      </>
    )
  }

  const onRevoke = async provider => {
    try {
      const response = await axios.delete(
        `/api/v1/integrations/revoke?provider=${provider}`
      )

      if (response.data.data.count > 1) {
        toast.success('Revoked')
        mutate()
      }
    } catch (err) {
      console.error(err)
      if (err && err.response && err.response.data)
        toast.error(err.response.data.error)
    }
  }

  const base = process.env.ORIGIN_URL || window.location.origin

  let url =
    'https://slack.com/oauth/v2/authorize?scope=commands,chat:write&client_id=144766262469.1501915786035'
  url += `redirect_uri=${base}'/dashboard/integrations/oauth/slack`

  return (
    <>
      <PageTitle
        title="Integrations"
        description="Available and Active Integrations"
      />
      <Spacer y={3}></Spacer>
      {Object.values(PROVIDERS).map(item => {
        const active = data.data.data[item]
        return (
          <>
            {active ? (
              <div className="card align-start flex-col justify-start">
                <div className="w-100 align-center flex justify-between">
                  <div className="align-center flex">
                    <StatusIcon success={active} />
                    <Spacer x={1} inline />
                    {toTitleCase(item)}
                  </div>
                  <div>
                    {active ? (
                      <Button mini onClick={e => onRevoke(item)}>
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                </div>
                <Spacer y={1} />
                <p>
                  <small>Multi Workspace Support - Coming Soon</small>
                </p>
              </div>
            ) : (
              <a href={url}>
                <img
                  alt="Add to Slack"
                  height="40"
                  width="139"
                  src="https://platform.slack-edge.com/img/add_to_slack.png"
                  srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
              </a>
            )}
          </>
        )
      })}
      <style jsx>
        {`
          .card {
            border-radius: 4px;
            padding: 16px;
            border: 1px solid #000;
            box-shadow: 0px 2px 8px rgba(12, 12, 13, 0.1);
            min-width: 150px;
            width: auto;
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            max-width: 100%;
            flex-wrap: wrap;
          }
        `}
      </style>
    </>
  )
}

//FIXME: remove withAuth
export default withAuth(withHeader(withSettingsSidebar(IntegrationsScreen)))

export const getServerSideProps = withLoginRedirect(
  'settings/integration/',
  async ({}) => {
    const props = {}
    return {
      props,
    }
  }
)
