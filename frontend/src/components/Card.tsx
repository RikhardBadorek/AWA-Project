import { useState } from "react";
import "../styles/Card.css"
import { Draggable } from "react-beautiful-dnd"

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

interface CardProps {
  card: CardType;
  index: number;
  handleDeleteCard: (cardId: string) => void;
  handleUpdateCard: (updatedCard: CardType) => void
}

const Card = ({ card, handleDeleteCard, index, handleUpdateCard }: CardProps) => {
  const [isEditingCardTitle, setIsEditingCardTitle] = useState(false)
  const [isEditingCardDescription, setIsEditingCardDescription] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [checkBox, setCheckBox] = useState(card.checkBox || false)
  const [checkBoxImportant, setCheckBoxImportant] = useState(card.important || false)


  const handleDelete = () => {
    handleDeleteCard(card._id)
  }


  const doubleClickTitle = () => {
    if(card) {
        setIsEditingCardTitle(true)
        setNewTitle(card.title)
    }
  }
  const doubleClickDescription = () => {
    if(card) {
        setIsEditingCardDescription(true)
        setNewDescription(card.description)
    }
  }

  const handleInputChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value)
  }
  const handleInputChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(e.target.value)
  }

  const updateCardTitle = async () => {
    if (!card) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      console.log("User must be logged in to edit the card.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/card/edit/title/${card._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if(!res.ok) {
        console.log("Error updating card title")
      }else {
        const updatedCard = {...card, title: newTitle}
        handleUpdateCard(updatedCard);
      }
      
    } catch (error) {
      console.log("Error updating card title")
      
    }
    setIsEditingCardTitle(false)
  }

  const updateCardDescription = async () => {
    if (!card) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      console.log("User must be logged in to edit the card.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/card/edit/description/${card._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: newDescription }),
      })

      if(!res.ok) {
        console.log("Error updating card description")
      }else {
        const updatedCard = {...card, description: newDescription}
        handleUpdateCard(updatedCard);
      }

      
    } catch (error) {
      console.log("Error updating card description")
      
    }
    setIsEditingCardDescription(false)
  }

  const handleKeyDownTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateCardTitle()
    }
  }

  const handleKeyDownDescription = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateCardDescription()
    }
  }

  const toggleCheckBox = async () => {
    const cbValue = !checkBox
    setCheckBox(cbValue)

    const token = localStorage.getItem("token")
    if(!token) {
      console.log("User must be loggedin to update the card")
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/card/edit/checkBox/${card._id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({checkBox: cbValue})
      })

      if(res.ok) {
        const updatedCard = await res.json()
        handleUpdateCard(updatedCard)
      } else {
        console.log("Failed to update checkbox")
      }
      
    } catch (error) {
      console.error("Error updating checkbox ", error)
    }
  }

  const toggleCheckBoxImportant = async () => {
    const cbValue = !checkBoxImportant
    setCheckBoxImportant(cbValue)

    const token = localStorage.getItem("token")
    if(!token) {
      console.log("User must be loggedin to update the card")
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/card/edit/checkBoxImportant/${card._id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({checkBoxImportant: cbValue})
      })

      if(res.ok) {
        const updatedCard = await res.json()
        handleUpdateCard(updatedCard)
      } else {
        console.log("Failed to update checkbox")
      }
      
    } catch (error) {
      console.error("Error updating checkbox ", error)
    }
  }

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided) => (
        <div className={`card ${checkBoxImportant ? "highlighted": ""} ${checkBox ? "done": ""}`}
        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        <div className="card-content">
          {isEditingCardTitle ? (
            <input
            type="text"
            value={newTitle}
            onChange={handleInputChangeTitle}
            onBlur={updateCardTitle}
            onKeyDown={handleKeyDownTitle}
            autoFocus
          />
          ):( <h4 onDoubleClick={doubleClickTitle}>{card.title}</h4>
          )}

          {isEditingCardDescription ? (
            <input
            type="text"
            value={newDescription}
            onChange={handleInputChangeDescription}
            onBlur={updateCardDescription}
            onKeyDown={handleKeyDownDescription}
            autoFocus
          />
          ):( <p className="description" onDoubleClick={doubleClickDescription}>{card.description}</p>
          )}
        </div>
          <div className="label">
            <label>done ?</label> <input type="checkbox" name="checkBox" id="checkBox" onChange={toggleCheckBox} checked={checkBox}/>
          </div>
          <div className="label">
            <label>important</label> <input type="checkbox" name="checkBox2" id="checkBox2" onChange={toggleCheckBoxImportant} checked={checkBoxImportant}/>
          </div>
          <button className="delete-card-btn" onClick={handleDelete}>Delete Card</button>
          <div className="created">
            Created: {new Date(card.createdAt).toLocaleDateString()}
            <br />
            {new Date(card.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
          </div>
        </div>
      )}
    </Draggable>
    
  );
};

export default Card

