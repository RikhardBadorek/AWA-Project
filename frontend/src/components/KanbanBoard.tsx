import { useEffect, useState } from "react"
import Board from "./Board"

interface BoardType {
  _id: string
  name: string
  userId: string
}

const KanbanBoard = () => {
    const [board, setBoard] = useState<BoardType | null>(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [newBoardName, setNewBoardName] = useState("")

    useEffect(() => {
      const getBoards = async () => {
        const token = localStorage.getItem("token")

        if (!token) {
          setError("User must be logged in to view their board!");
          setLoading(false);
          return;
        }

        if(token) {
          try {
            const res = await fetch("http://localhost:3000/api/board", {
              method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            })

            if(res.ok) {
              const data = await res.json()
              setBoard(data)
            } else {
                setError("Error loading board")
            }

          } catch (error) {
              setError(`Error loading board: ${error}`)
          } finally {
            setLoading(false)
          }
        } 
      } 
      getBoards();
    }, [])

    const doubleClick = () => {
      if(board) {
        setIsEditing(true)
        setNewBoardName(board.name)
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewBoardName(e.target.value)
    }

    const updateBoardName = async () => {
      if(!board) {
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        setError("User must be logged in to edit the board.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/board/${board._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newBoardName }),
        })

        if(!res.ok) {
          setError("Error updating board name")
        }else {
          setBoard({...board, name: newBoardName})
        }
        
        
      } catch (error) {
        setError("Error updating board name")
        
      }
      setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        updateBoardName()
      }
    };

    if (loading) {
      return <div>Loading...</div>
    }

    if(error) {
      return <p>{error}</p>
    }
   
    if(board) {
    return(
      <div>
        {isEditing ? (
          <input type="text" value={newBoardName} onChange={handleInputChange} onBlur={updateBoardName} onKeyDown={handleKeyDown} autoFocus/>): (
            <div onDoubleClick={doubleClick} style={{ cursor: "pointer", display: "inline-block" }}>
              <h2 className="board-header">{board.name}</h2>
            </div>
          )
        }
        <Board board={board}></Board>
      </div>
    )
    }
    
}

export default KanbanBoard
