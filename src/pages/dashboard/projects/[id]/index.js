import Button from '@/components/Button'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import { withLoginRedirect } from '@/lib/middleware/auth'
import { fetchProjectById } from '@/controllers/projects'
import { formatDate } from '@/lib/utils/date'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default withHeader(({ projectData }) => {
  const router = useRouter()

  return (
    <>
      <div>
        <div className="float-right">
          <Link href={`/dashboard/projects/${router.query.id}/edit`}>
            <Button secondary>Edit</Button>
          </Link>
        </div>
        <Spacer y={2} />
        <h2>{projectData.name}</h2>
        <div>
          <p>
            <strong>Deadline</strong>
          </p>
          <p>{projectData.deadline ? formatDate(projectData.deadline) : '-'}</p>
        </div>
        <Spacer y={2} />
        <div>
          <p>
            <strong>About</strong>
          </p>
          <p>{projectData.description}</p>
        </div>
      </div>
      <Spacer y={2} />
      <hr />
      <div>
        <p>
          <strong>Actions</strong>
        </p>
        <nav className="menu-wrapper">
          <Link href={'/dashboard/timer'}>
            <Button>Log Time</Button>
          </Link>
          <Spacer x={1} inline />
          <Link href={`/dashboard/projects/${router.query.id}/members`}>
            <Button secondary>View Users</Button>
          </Link>
        </nav>
      </div>
      <style jsx>
        {`
          .menu-wrapper {
            display: flex;
            align-items: center;
          }

          .menu-wrapper a {
            color: gray;
          }

          .menu-wrapper a:hover {
            color: black;
          }

          .menu-wrapper a.active {
            color: black;
          }

          .menu-wrapper a.active:before {
            content: '';
            display: block;
            position: relative;
            top: 26px;
            border-bottom: 2px solid black;
          }
        `}
      </style>
    </>
  )
})

export const getServerSideProps = async ctx =>
  withLoginRedirect(
    `dashboard/projects/${ctx.params.id}`,
    async ({ params, user }) => {
      const projectDetails = await fetchProjectById(user.id, params.id)
      return {
        props: {
          projectData: projectDetails,
        },
      }
    }
  )(ctx)
