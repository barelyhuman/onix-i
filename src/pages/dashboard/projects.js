import Button from '@/components/Button'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmation'
import Menu from '@/components/Menu'
import PageTitle from '@/components/PageTitle'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import { withLoginRedirect } from '@/lib/middleware/auth'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import { formatDate } from '@/lib/utils/date'

import { FormControl } from '@/components/FormControl'

import { Popover } from '@/components/Popover'
import { styled } from 'goober'
import { getUserDetails } from '@/controllers/user'
import { getUserProjects } from '@/controllers/projects'

const ProjectCardContainer = styled('div')`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ProjectCard = styled('div')`
  display: flex;
  width: calc(100vh / 2);
  max-width: 400px;
  align-items: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  padding: 10px;
  border-radius: 6px;
  border: 2px solid black;
  justify-content: space-between;
`

function Projects({ projects, user }) {
  const [filteredProjects, setFilteredProjects] = useState(projects || [])
  const [deleteProjectInstance, setDeleteProjectInstance] = useState(false)
  const router = useRouter()

  function onChecked(e) {
    const { checked } = e.target
    const filtered = projects.filter(item => {
      if (checked) return item.user_id === user.id

      return item
    })
    setFilteredProjects(filtered)
  }

  function handleLogTimeClick(e, projectInstance) {
    window.localStorage.setItem('project', projectInstance.id)

    return router.push('/dashboard/timer')
  }

  function deleteProject(e) {
    API.deleteProject(deleteProjectInstance.id)
      .then(data => {
        setDeleteProjectInstance(null)
        router.reload()
        toast.success('Project Deleted')
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function exportTimeline(projectInstance) {
    API.exportTimeline(projectInstance.id)
      .then(data => {
        const fileBlob = new Blob([data.data], { type: 'text/csv' })
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.href = URL.createObjectURL(fileBlob)
        a.download = `${projectInstance.name}-${new Date().getTime()}.csv`
        a.click()
        document.body.removeChild(a)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <>
      <PageTitle
        title="Projects"
        description="Categories for your time logs "
      />
      <Spacer y={3}></Spacer>
      <div className="flex">
        <Link href="/dashboard/projects/new">
          <Button>Add Project</Button>
        </Link>
      </div>
      <Spacer y={2} />
      <div>
        <div className="flex">
          <Popover content={'Show only your projects'}>
            <FormControl hideBorder>
              <div className="align-center flex gap-2">
                <input
                  id="filter-projects"
                  type="checkbox"
                  onChange={onChecked}
                />
                <label htmlFor="filter-projects" className="m-null p-null">
                  Personal Projects
                </label>
              </div>
            </FormControl>
          </Popover>
        </div>
      </div>
      <Spacer y={2} />
      <div>
        <ProjectCardContainer>
          {filteredProjects.map(projectInstance => {
            return (
              <React.Fragment key={projectInstance.id}>
                <ProjectCard>
                  <div className="flex flex-1 flex-col">
                    <p>{projectInstance.name}</p>
                    <p>
                      <small>{projectInstance.description}</small>
                    </p>
                    <p>
                      <small>
                        Started: {formatDate(projectInstance.created_at)} |
                        Deadline:{' '}
                        {projectInstance.deadline
                          ? formatDate(projectInstance.deadline)
                          : '-'}
                      </small>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={e => handleLogTimeClick(e, projectInstance)}
                      mini
                      primary
                    >
                      Log Time
                    </Button>
                    <Menu.Container
                      className="app-header--link"
                      triggerElement={
                        <Button
                          mini
                          secondary
                          style={{
                            borderColor: 'rgba(12, 12, 13, 0.1)',
                            fontSize: '16px',
                          }}
                        >
                          ...
                        </Button>
                      }
                    >
                      <Menu.Item>
                        <Link
                          href={`/dashboard/projects/${projectInstance.id}`}
                          className="w-100"
                        >
                          View
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href={`/dashboard/projects/${projectInstance.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          href={`/dashboard/projects/${projectInstance.id}/members`}
                        >
                          Members
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <a
                          className="w-100"
                          onClick={e => {
                            exportTimeline(projectInstance)
                          }}
                        >
                          <Popover
                            content={
                              'Will export only your timeline data unless you own this project.'
                            }
                          >
                            Export to CSV
                          </Popover>
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        {user.id === projectInstance.user_id ? (
                          <a
                            className="text-red"
                            onClick={e =>
                              setDeleteProjectInstance(projectInstance)
                            }
                          >
                            Delete
                          </a>
                        ) : null}
                      </Menu.Item>
                    </Menu.Container>
                  </div>
                </ProjectCard>
              </React.Fragment>
            )
          })}
        </ProjectCardContainer>
        <DeleteConfirmationModal
          open={deleteProjectInstance}
          message="
            This action will delete the project. This will delete all tasks and tracking data linked to this project.
          "
          onOkay={e => deleteProject()}
          onClose={e => setDeleteProjectInstance(null)}
        />
      </div>
      <style jsx>{''}</style>
    </>
  )
}

export default withHeader(Projects)

export const getServerSideProps = withLoginRedirect(
  'dashboard/projects',
  async ({ user }) => {
    const [projects, userDetails] = await Promise.all([
      getUserProjects(user.id),
      getUserDetails(user.id),
    ])

    const props = {
      projects: projects.map(x => ({
        ...x,
        created_at: x.created_at,
        updated_at: x.updated_at,
        deadline: x.deadline || '',
      })),
      user: userDetails,
    }

    return {
      props,
    }
  }
)
