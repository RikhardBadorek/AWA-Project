import { useState } from "react"
import "../styles/header.css"

//Header component that has the burger icon for smaller screens

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const openMenu = () =>setMenuOpen(!menuOpen)
  return (
    <div>
        <header className='header'>
            <h1>Mr. Kanban</h1>

            <nav className={`nav ${menuOpen ? "active": ""}`}>
                <ul>
                    <a href="/" onClick={()=>setMenuOpen(false)}>Home</a>
                    <a href="/register" onClick={()=>setMenuOpen(false)}>Register</a>
                    <a href="/login" onClick={()=>setMenuOpen(false)}>Login</a>
                    <a href="/logout" onClick={()=>setMenuOpen(false)}>Logout</a>
                </ul>
            </nav>
            <div className="icon" onClick={openMenu}>
                <i className="fa fa-bars"></i>
            </div>
        </header>
    </div>
  )
}

export default Header
