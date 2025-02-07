import {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

// Handles logout and removes JWT token

const Logout = () => {
    const nav = useNavigate()

    useEffect(() => {
        localStorage.removeItem("token")
        nav("/login")
    }, [nav])

  return (
    <div>
      <p>Logging out...</p>
    </div>
  )
}

export default Logout
