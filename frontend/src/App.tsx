import { BrowserRouter, Route, Routes} from "react-router-dom"
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import Register from './components/Register'
import Login from './components/Login'
import Logout from './components/Logout'
import"./App.css"


function App() {

  return (
    <div>
      <BrowserRouter>
        <Header/>
        <div>
          <Routes>
            <Route path="/" element={<KanbanBoard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
