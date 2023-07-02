import { useEffect, useState } from 'react'
import API from '@/lib/api/client-sdk'

export default function useUser() {
  const [userData, setUserData] = useState({})

  useEffect(() => {
    API.fetchUser().then(data => {
      setUserData(data.data)
    })
  }, [])

  return userData
}
