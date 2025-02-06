import "../styles/Column.css"
import Card from './Card'
import { useState } from 'react'
import { Droppable } from "react-beautiful-dnd"

interface CardType {
    _id: string;
    title: string;
    description: string;
    columnId: string;
    position: number;
    checkBox: boolean;
    createdAt: string;
    important: boolean;
}

interface ColumnProps {
  column: {
    _id: string;
    name: string;
    position: number;
    cards: CardType[];
  };
  handleDeleteColumn: (columnId: string) => void;
  updateColumnNameInParent: (columnId: string, newColumnName: string) => void
  updateCardsForColumns: (columnId: string, newCards: CardType[]) => void
}

const Column = ({ column, handleDeleteColumn, updateColumnNameInParent, updateCardsForColumns}: ColumnProps) => {
    const [error, setError] = useState<string>("")
    const [isEditing, setIsEditing] = useState(false)
    const [newColumnName, setNewColumnName] = useState("")


    const handleAddCard = async () => {
        const title = prompt("Enter your card's title: ")
        const description = prompt("Enter description: ")

        if(!title) {
            setError("Title required")
            return
        }
        if(!description) {
            setError("description required")
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            setError("User must be logged in to add a card.")
            return
        }

        try {
            const res = await fetch("http://localhost:3000/api/card", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                title,
                description,
                columnId: column._id,
                })
            })

            if(!res.ok) {
                setError("Failed to add card")
            }

            const newCard = await res.json()
            updateCardsForColumns(column._id, [...column.cards, newCard])
            setError("")
            
            
        } catch (error) {
            setError(`Error loading columns: ${error}`)
        }


    }

    const handleDeleteCard = async (cardId: string) => {
        const token = localStorage.getItem("token")
        if (!token) {
            setError("User must be logged in to add a card.")
            return
        }

        const res = await fetch(`http://localhost:3000/api/card/del/${cardId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
        })

        if(!res.ok) {
            setError("Failed to delete card")
        }
        updateCardsForColumns(column._id, column.cards.filter((card) => card._id !== cardId))
    }

    const doubleClick = () => {
        if(column) {
            setIsEditing(true)
            setNewColumnName(column.name)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewColumnName(e.target.value)
    }

    const updateColumnName = async () => {
        if(!column) {
          return
        }
  
        const token = localStorage.getItem("token")
        if (!token) {
          setError("User must be logged in to edit the column.");
          return;
        }
  
        try {
          const res = await fetch(`http://localhost:3000/api/column/editname/${column._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newColumnName }),
          })
  
          if(!res.ok) {
            setError("Error updating column name")
          }else {
            updateColumnNameInParent(column._id, newColumnName);
          }
          
          
        } catch (error) {
          setError("Error updating column name")
          
        }
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
          updateColumnName()
      }
    }

    const handleUpdateCard = (updatedCard: CardType) =>{
      updateCardsForColumns(column._id, column.cards.map((card) => (card._id === updatedCard._id ? updatedCard: card)))
    }

  return (
    <div className="column-card">
        <div className="column-header">
            {isEditing ? (
            <input type="text" value={newColumnName} onChange={handleInputChange} onBlur={updateColumnName} onKeyDown={handleKeyDown} autoFocus/>) : (
            <h3 onDoubleClick={doubleClick} style={{ cursor: "pointer"}}>{column.name}</h3>
            )}
            
        </div>
        
        <p>{error}</p>

        <Droppable droppableId={column._id}>
            {(provided) => (
            <div className="cards" ref={provided.innerRef} {...provided.droppableProps}>
                {column.cards?.length > 0 ? (column.cards.map((card, index) => <Card key={card._id} card={card} handleDeleteCard={handleDeleteCard} handleUpdateCard={handleUpdateCard} index={index}/>)) : 
                (<p>No cards yet, you should add one!</p>)}
                {provided.placeholder}
            </div>
            )}
        </Droppable>

        <div className="column-footer">
            <button onClick={handleAddCard} className="add-card-btn">Add Card</button>
            <button onClick={() => handleDeleteColumn(column._id)} className="delete-column-btn">Delete Column</button>
        </div>

    </div>
  );
};

export default Column;