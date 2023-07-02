import Button from '@/components/Button'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmation'
import PageTitle from '@/components/PageTitle'
import { Popover } from '@/components/Popover'
import Spacer from '@/components/Spacer'
import StatusIcon from '@/components/StatusIcon'
import withHeader from '@/components/withHeader'
import API, { APIFetcher } from '@/lib/api/client-sdk'
import { formatTimeSpent } from '@/lib/utils/date'
import { toast } from '@/components/Toast'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { parse } from 'cookie'

export default withHeader(({ projectData, projectUsers, userDetails }) => {
  const router = useRouter()
  const [toRemove, setToRemove] = useState(null)

  function handleOnDelete(e, user) {
    e.preventDefault()
    setToRemove(user)
  }

  function removeUserFromProject() {
    API.removeUserFromProject(router.query.id, toRemove.id)
      .then(data => {
        window.location.reload()
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <Button secondary onClick={e => router.back()}>
        Back
      </Button>
      <Spacer y={2} />
      <div>
        <h2>{projectData.name}</h2>
      </div>
      <Spacer y={2} />
      <div>
        <PageTitle
          title="Members"
          description="Members that are in this project"
        />
        {userDetails.id === projectData.user_id ? (
          <div className="flex justify-end">
            <Link href={`/dashboard/projects/${projectData.id}/members/add`}>
              <Button>Add Members</Button>
            </Link>
          </div>
        ) : null}
        <div>
          {projectUsers.map(item => {
            return (
              <div key={item.id}>
                <Spacer y={1} />
                <Link
                  href={`/dashboard/projects/${projectData.id}/members/${item.id}`}
                >
                  <div className="card">
                    <div className="align-center flex">
                      {!item.is_project_user_active ? (
                        <div>
                          <Popover
                            content={'This user was removed from the project'}
                          >
                            <StatusIcon error />
                          </Popover>
                        </div>
                      ) : null}
                      <Spacer x={2} inline />
                      <div className="w-100-px">
                        <label>
                          <span>{item.is_owner ? 'Owner' : 'User'}</span>
                        </label>
                      </div>
                      <Spacer x={2} inline />
                      <div className="w-100-px">
                        <div>{item.profile_name}</div>
                      </div>
                      <Spacer x={1} inline />
                      <div className="w-33">
                        <span>{item.email}</span>
                      </div>
                      <div className="w-33">
                        <span>
                          <small className="grey">Time Spent</small>
                          <br />
                          {formatTimeSpent(item.total_time_spent * 1000)}
                        </span>
                      </div>
                      <Spacer x={3} inline />
                      <div>
                        {userDetails.id === projectData.user_id &&
                        item.id !== userDetails.id &&
                        item.is_project_user_active ? (
                          <Button
                            mini
                            secondary
                            onClick={e => handleOnDelete(e, item)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
        <DeleteConfirmationModal
          open={toRemove}
          message="
            This action will remove the selected user from this project. This will remove all tasks created by that user for the project, The tasks and tracked time will remain but the user will not be able to add any more tasks to this project.
          "
          onOkay={e => removeUserFromProject()}
          onClose={e => setToRemove(null)}
        />
      </div>
      <style jsx>
        {`
          .card {
            border-radius: 4px;
            padding: 16px;
            border: 1px solid rgba(12, 12, 13, 0.1);
            box-shadow: 0px 1px 4px rgba(12, 12, 13, 0.1);
            min-width: 132px;
            display: inline-block;
            width: 100%;
          }

          .card:hover {
            cursor: pointer;
          }

          .w-33 {
            width: 33%;
          }

          .w-100-px {
            width: 100px;
          }

          .ml-auto {
            margin-left: auto;
          }

          .grey {
            color: grey;
          }
        `}
      </style>
    </>
  )
})

export async function getServerSideProps({ params, req, res }) {
  try {
    const cookies = parse(req.headers.cookie)
    const config = {
      auth: {
        token: cookies.auth,
      },
    }

    const props = {
      userDetails: {},
      projectUsers: [],
      projectData: {},
    }

    const userDetailsResponse = await APIFetcher(config, res).get('/user')
    const projectDataResponse = await APIFetcher(config, res).get(
      `/projects/${params.id}`
    )
    const projectUsersResponse = await APIFetcher(config).get(
      `/projects/${params.id}/users`
    )

    if (userDetailsResponse.data)
      props.userDetails = userDetailsResponse.data || {}

    if (projectDataResponse.data)
      props.projectData = projectDataResponse.data.data || {}

    if (projectUsersResponse.data)
      props.projectUsers = projectUsersResponse.data.data || {}

    return {
      props,
    }
  } catch (err) {
    if (err.response.status === 403) {
      res.writeHead(302, {
        Location: '/dashboard/projects',
      })
      res.end()
    }
  }
}
