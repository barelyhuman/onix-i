import Button from '@/components/Button'
import { FormControl } from '@/components/FormControl'
import Spacer from '@/components/Spacer'
import withHeader from '@/components/withHeader'
import API from '@/lib/api/client-sdk'
import { toast } from '@/components/Toast'
import useDebounce from '@/lib/hooks/use-debounce'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { styled } from 'goober'
import If from '@/components/If'

const UserList = styled('ul')`
  margin: 0px;
  padding: 0px;
  border: 2px solid var(--overlay);
  border-radius: 6px;
`
const UserListItem = styled('li')`
  list-style-type: none;
  padding: 8px;
`

function Page(props) {
  const router = useRouter()
  const [userOptions, setUserOptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 250)

  useEffect(() => {
    searchUsers(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  function searchUsers(searchTerm) {
    if (searchTerm.length < 3) return

    API.searchUsers(searchTerm)
      .then(data => {
        const formatted = data.data.data.map(item => ({
          title: item.profile_name,
          key: item.id,
          description: item.email,
        }))
        setUserOptions(formatted)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  function addUser(userId) {
    API.addUsersToProject(router.query.id, userId)
      .then(data => {
        toast.success(data.data.message)
        router.push(`/dashboard/projects/${router.query.id}/members`)
      })
      .catch(err => {
        if (err && err.response && err.response.data)
          toast.error(err.response.data.error)
      })
  }

  return (
    <div>
      <h2>Add User</h2>
      <div>
        <p>Search for a user</p>
        <Spacer y={1} />
        <FormControl>
          <label>Search for a user</label>
          <input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
            }}
          />
        </FormControl>
        <Spacer y={1} />
        <If condition={userOptions.length > 0}>
          <UserList>
            {userOptions.map(x => (
              <UserListItem>
                <div className="flex justify-between">
                  <div>
                    <p className="m-null p-null">{x.title}</p>
                    <p className="m-null p-null">
                      <small>{x.description}</small>
                    </p>
                  </div>
                  <Button onClick={() => addUser(x.key)}>Add User</Button>
                </div>
              </UserListItem>
            ))}
          </UserList>
        </If>
      </div>
      <style jsx>{''}</style>
    </div>
  )
}

export default withHeader(Page)
