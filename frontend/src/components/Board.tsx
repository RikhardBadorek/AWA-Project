import { useEffect, useState } from "react";
import Column from "./Column"
import "../styles/Board.css"
import { DragDropContext } from "react-beautiful-dnd"

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

interface BoardProps {
    board: {
      _id: string;
      name: string;
      userId: string;
    };
}

interface ColumnType {
    _id: string;
    name: string;
    position: number;
    cards: CardType[];
}
  
const Board = ({ board }: BoardProps) => {
    const [columns, setColumns] = useState<ColumnType[]>([])
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchColumns = async () => {
            const token = localStorage.getItem("token")

            if (!token) {
                setError("User must be logged in to add a column.");
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/columns?boardId=${board._id}`, {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                })
          
                if (res.ok) {
                    const data = await res.json()
                    const mapData = data.map((column: any) => ({
                        ...column, cards: Array.isArray(column.cards)? column.cards : []
                    }))
                    setColumns(mapData);
                } else {
                    setError("Failed to load columns.")
                }
                
            } catch (error) {
                setError(`Error loading columns: ${error}`)
            }
        }
        fetchColumns()
    }, [board._id])

    const handleAddColumn = async () => {
        const columnName = prompt("Enter name for your column: ")
        if(!columnName) {
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            setError("User must be logged in to add a column.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/columns", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                name: columnName,
                boardId: board._id,
                })
            })

            if(!res.ok) {
                setError("Failed to add colmn")
            }

            const newColumn = await res.json()
            const cardsArrayToColumn = {
                ...newColumn, cards: Array.isArray(newColumn.cards) ? newColumn.cards : []
            }
            setColumns((prev) => [...prev, cardsArrayToColumn])
            setError("")
            
            
        } catch (error) {
            setError(`Error loading columns: ${error}`)
        }
    }


    const handleDeleteColumn = async (columnId: string) => {
        const token = localStorage.getItem("token")

        if (!token) {
            setError("User must be logged in to delete a column.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`,
              }
            })
      
            if (res.ok) {
              setColumns((prevColumns) =>
                prevColumns.filter((column) => column._id !== columnId)
              );
            } else {
              setError("Failed to delete column")
            }
        } catch (error) {
            setError(`Error deleting column: ${error}`)
        }
    };

    const updateColumnNameInParent = (columnId: string, newColumnName: string) => {
        setColumns((prev) => prev.map((column) => column._id === columnId ? {...column, name: newColumnName}: column))
    }

    const updateCardsForColumns = (columnId: string, newCards: CardType[]) => {
        setColumns((prev) => prev.map((column) => column._id === columnId ? {...column, cards: newCards} : column))
    }

    const onDragEnd = async (result: any) => {
        const {destination, source} = result

        if (!destination) {
            return
        }

        if (destination.droppableId === source.droppableId &&destination.index === source.index) {
            return
        }

        const sourceColumn = columns.find(column => column._id === source.droppableId)
        const destinationColumn = columns.find(column => column._id === destination.droppableId)

        if(!sourceColumn){return}
        if(!destinationColumn){return}

        if(sourceColumn._id === destinationColumn._id) {
            const sourceCards = Array.from(sourceColumn.cards)
            const [movedCard] = sourceCards.splice(source.index, 1)

            if(!movedCard) {
                console.error("Moved crad in undefined")
                return
            }
            sourceCards.splice(destination.index, 0, movedCard)

            const updatedSourceCards = sourceCards.map((card, index) => ({
                ...card,
                position: index
            }))

            updateCardsForColumns(sourceColumn._id, updatedSourceCards)

            const token = localStorage.getItem("token")

            if (!token) {
                setError("User must be logged in.");
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/cards/update/${movedCard._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ 
                        columnId: destinationColumn._id,
                        position: destination.index,
                    }),
                })

                if (!res.ok) {
                    setError("Failed to update card on backend.")
                    return;
                }
                await fetch(`http://localhost:3000/api/columns/update/${sourceColumn._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cards: updatedSourceCards,
                    }),
                })
                
            } catch (error) {
                setError(`Error updating card and column: ${error}`);
            }

        } else{
            const sourceCards = Array.from(sourceColumn.cards)
            const destinationCards = Array.from(destinationColumn.cards || [])

            const [movedCard] = sourceCards.splice(source.index, 1)

            if(!movedCard) {
                console.error("Moved crad in undefined")
                return
            }
            destinationCards.splice(destination.index, 0, movedCard)

            const updatedSourceCards = sourceCards.map((card, index) => ({
                ...card,
                position: index
            }))
        
            const updatedDestinationCards = destinationCards.map((card, index) => ({
                ...card,
                position: index
            }))

            updateCardsForColumns(sourceColumn._id, updatedSourceCards)
            updateCardsForColumns(destinationColumn._id, updatedDestinationCards)

            const token = localStorage.getItem("token")

            if (!token) {
                setError("User must be logged in.");
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/cards/update/${movedCard._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        columnId: destinationColumn._id,
                        position: destination.index,
                    }),
                })

                if (!res.ok) {
                    setError("Failed to update card on backend.")
                    return;
                }

                await fetch(`http://localhost:3000/api/columns/update/${destinationColumn._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cards: updatedDestinationCards,
                    }),
                })
                await fetch(`http://localhost:3000/api/columns/update/${sourceColumn._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cards: updatedSourceCards,
                    }),
                })
                
            } catch (error) {
                setError(`Error updating card and column: ${error}`);
            }
        }

    }

    if(error){return(error)}
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
                <button className="board-btn" onClick={handleAddColumn}>Add Column</button>

                <div className="column">
                    {columns.length > 0 ? 
                    (columns.map((column) => <Column key={column._id} column={column} handleDeleteColumn={handleDeleteColumn} updateColumnNameInParent={updateColumnNameInParent} updateCardsForColumns={updateCardsForColumns}/>)) : 
                    (<p>No columns yet, you should add one!</p>)}
                </div>
            </div>
        </DragDropContext>
    );
};

export default Board;
