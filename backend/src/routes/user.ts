import express, { Request, Response, Router } from "express";
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken";
import { registerValidator, loginValidator } from "../validators/inputValidation";
import { User, IUser } from '../models/User'
import { validationResult } from "express-validator";
import { validateToken, CustomRequest } from '../middleware/validateToken';
import { Board } from "../models/Board"
import { Column } from "../models/Column"
import { Card, ICard } from "../models/Card"


const router: Router = express.Router();

//REGISTER AND LOGIN ROUTES:

router.post("/api/user/register", registerValidator, async (req: Request, res: Response) => {
    const error = validationResult(req)

    if (!error.isEmpty()){
        res.status(400).json({error: error.array()})
        return
    }
    try {
        const {email,username,password} = req.body

        if (!email) {
            res.status(400).json({ message: "Email is required" })
            return
        }
        if (!username) {
            res.status(400).json({ message: "Username is required" })
            return
        }
        if (!password) {
            res.status(400).json({ message: "Password is required" })
            return
        }

        const existingUser = await User.findOne({email})
        if (existingUser) {
            res.status(403).json({message: "Email already in use."})
            return
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(req.body.password, salt)

        const newUser = new User({
            email,
            username,
            password: hash,
        });

        await newUser.save()

        res.status(200).json(newUser)

    } catch (error: any) {
        console.error(`Error during user register: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    

});

router.post("/api/user/login", loginValidator, async (req: Request, res: Response) => {
    const error = validationResult(req)

    if (!error.isEmpty()){
        res.status(400).json({error: error.array()})
        return
    }
    
    try {
        const {email,password} = req.body

        const user: IUser | null = await User.findOne({email})
        if (!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Login failed" })
            return
        }

        const jwtPayload: JwtPayload = {
            id: user._id,
            username: user.username,
        }
        const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "1h" })

        res.status(200).json({ success: true, token })
        
    } catch (error: any) {
        console.error(`Error during user login: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    

});

//BOARD ROUTES:

router.get("/api/board", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(400).json({ message: "User not authenticated" });
            return
        }

        let board = await Board.findOne({userId: req.user.id})

        if(!board) {
            board = new Board({
                name: "My kanban board",
                userId: req.user.id,
            })
            await board.save()
        }
        res.status(200).json(board)
        
    } catch (error: any) {
        console.error(`Error getting boardss: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/board/:boardId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const boardId = req.params.boardId
        const {name} = req.body

        if (!name) {
            res.status(400).json({ error: "Board name is required" })
            return
        }

        const board = await Board.findById(boardId)

        if (!board) {
            res.status(400).json({ error: "Board not found" })
            return
        }

        board.name = name

        await board.save()

        res.status(200).json(board)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

//COLUMN ROUTES:

router.put("/api/column/editname/:columnId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const columnId = req.params.columnId
        const {name} = req.body

        if (!name) {
            res.status(400).json({ error: "Board name is required" })
            return
        }

        const column = await Column.findById(columnId)

        if (!column) {
            res.status(400).json({ error: "Board not found" })
            return
        }

        column.name = name

        await column.save()

        res.status(200).json(column)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.get("/api/columns", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const {boardId} = req.query

        if(!boardId) {
            res.status(400).json({message: "Board id is required!"})
            return
        }

        const columns = await Column.find({ boardId }).sort({ position: 1 })

        const columnsWithCards = await Promise.all(columns.map(async (column) => {
            const cards = await Card.find({columnId: column._id}).sort({position: 1})
            return {...column.toObject(), cards}
        }))

        res.status(200).json(columnsWithCards)
        
    } catch (error: any) {
        console.error(`Error getting columns: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    
});

router.post("/api/columns", validateToken, async (req: Request, res: Response) => {


    try {
        const {name, boardId} = req.body

        if(!name) {
            res.status(400).json({ message: "Column name required" })
        }
        if(!boardId) {
            res.status(400).json({ message: "Board id required" })
        }

        const columnCount = await Column.countDocuments({ boardId })

        const newColumn = new Column({
            name,
            boardId,
            position: columnCount + 1,
        })

        await newColumn.save()
        res.status(200).json(newColumn)
        
    } catch (error: any) {
        console.error(`Error during creating column: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/columns/update/:columnId", validateToken, async (req: CustomRequest, res: Response) => {
    const {columnId} = req.params
    const {cards} = req.body
    
    try {
        if(!columnId) {
            res.status(400).json({message: "Column id is required!"})
            return
        }

        const columnsCards = await Card.find({columnId: columnId})
        if (!columnsCards) {
            res.status(404).json({ message: "Cards not found!" })
            return
        }

        const updatePromises = cards.map(async (updatedCard: ICard) => {
            const dbCard = columnsCards.find(card => card.id.toString() === updatedCard._id)

            if (dbCard) {
                dbCard.position = updatedCard.position
                await dbCard.save()
            }
        })

        await Promise.all(updatePromises)

        const updatedCards = await Card.find({ columnId: columnId })

        res.json({ message: "Card positions updated successfully", cards: updatedCards })

       
        
    } catch (error: any) {
        console.error(`Error getting cards: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    
});

router.delete("/api/columns/:id", validateToken, async (req: Request, res: Response) => {
    const {id} = req.params

    try {
        const deleteCol = await Column.findByIdAndDelete(id)

        if(!deleteCol) {
            res.status(400).json({ message: "Column not found" })
        }

        res.status(200).json({message: "Column deleted"})
        
    } catch (error: any) {
        console.error(`Error during deleting column: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

//CARD ROUTES:

router.get("/api/cards", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const {columnId} = req.query

        if(!columnId) {
            res.status(400).json({message: "Column id is required!"})
            return
        }

        const cards = await Card.find({ columnId }).sort({ position: 1 })

        res.status(200).json(cards)
        
    } catch (error: any) {
        console.error(`Error getting cards: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    
});

router.put("/api/cards/update/:movedId", validateToken, async (req: CustomRequest, res: Response) => {
    const {movedId} = req.params
    const {columnId, position} = req.body

    try {
        if(!columnId) {
            res.status(400).json({message: "Column id is required!"})
            return
        }

        const card = await Card.findByIdAndUpdate(
            movedId,
            { columnId, position },
            { new: true }
        )

        if (!card) {
            res.status(404).json({ error: "Card not found" })
            return
        }

        res.json({message: "Card updated successfully", card});
        
    } catch (error: any) {
        console.error(`Error getting cards: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
    
});

router.post("/api/card", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const {title, description, columnId} = req.body

        if(!title) {
            res.status(400).json({ message: "title required" })
            return
        }
        if(!columnId) {
            res.status(400).json({ message: "column id required" })
            return
        }

        const columnExists = await Column.findById(columnId);
        if (!columnExists) {
            res.status(404).json({ message: "Column not found" })
            return
        }

        const cardCount = await Card.countDocuments({ columnId })

        const newCard = new Card({
            title,
            description,
            columnId,
            position: cardCount + 1,
        });

        await newCard.save()
        res.status(200).json(newCard)

    } catch (error: any) {
        console.error(`Error making card: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.delete("/api/card/del/:id", validateToken, async (req: Request, res: Response) => {
    const {id} = req.params

    try {
        const deleteCard = await Card.findByIdAndDelete(id)

        if(!deleteCard) {
            res.status(400).json({ message: "Card not found" })
        }

        res.status(200).json({message: "Card deleted"})
        
    } catch (error: any) {
        console.error(`Error during deleting column: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/card/edit/title/:cardId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const cardId = req.params.cardId
        const {title} = req.body

        if (!title) {
            res.status(400).json({ error: "Board name is required" })
            return
        }

        const card = await Card.findById(cardId)

        if (!card) {
            res.status(400).json({ error: "Card not found" })
            return
        }

        card.title = title

        await card.save()

        res.status(200).json(card)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/card/edit/description/:cardId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const cardId = req.params.cardId
        const {description} = req.body

        if (!description) {
            res.status(400).json({ error: "Board name is required" })
            return
        }

        const card = await Card.findById(cardId)

        if (!card) {
            res.status(400).json({ error: "Card not found" })
            return
        }

        card.description = description

        await card.save()

        res.status(200).json(card)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/card/edit/checkBox/:cardId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const cardId = req.params.cardId
        const {checkBox} = req.body

        const card = await Card.findById(cardId)

        if (!card) {
            res.status(400).json({ error: "Card not found" })
            return
        }

        card.checkBox = checkBox

        await card.save()

        res.status(200).json(card)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.put("/api/card/edit/checkBoxImportant/:cardId", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const cardId = req.params.cardId
        const {checkBoxImportant} = req.body

        const card = await Card.findById(cardId)

        if (!card) {
            res.status(400).json({ error: "Card not found" })
            return
        }

        card.important = checkBoxImportant

        await card.save()

        res.status(200).json(card)
        
    } catch (error: any) {
        console.error(`Error changing board name: ${error}`)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

export default router;