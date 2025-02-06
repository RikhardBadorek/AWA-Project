import {useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

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
