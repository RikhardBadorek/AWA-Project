"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inputValidation_1 = require("../validators/inputValidation");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const validateToken_1 = require("../middleware/validateToken");
const Board_1 = require("../models/Board");
const Column_1 = require("../models/Column");
const Card_1 = require("../models/Card");
const router = express_1.default.Router();
//REGISTER AND LOGIN ROUTES:
router.post("/api/user/register", inputValidation_1.registerValidator, async (req, res) => {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        res.status(400).json({ error: error.array() });
        return;
    }
    try {
        const { email, username, password } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        if (!username) {
            res.status(400).json({ message: "Username is required" });
            return;
        }
        if (!password) {
            res.status(400).json({ message: "Password is required" });
            return;
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(403).json({ message: "Email already in use." });
            return;
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hash = bcrypt_1.default.hashSync(req.body.password, salt);
        const newUser = new User_1.User({
            email,
            username,
            password: hash,
        });
        await newUser.save();
        res.status(200).json(newUser);
    }
    catch (error) {
        console.error(`Error during user register: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post("/api/user/login", inputValidation_1.loginValidator, async (req, res) => {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        res.status(400).json({ error: error.array() });
        return;
    }
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordCorrect = bcrypt_1.default.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Login failed" });
            return;
        }
        const jwtPayload = {
            id: user._id,
            username: user.username,
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "1h" });
        res.status(200).json({ success: true, token });
    }
    catch (error) {
        console.error(`Error during user login: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//BOARD ROUTES:
router.get("/api/board", validateToken_1.validateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(400).json({ message: "User not authenticated" });
            return;
        }
        let board = await Board_1.Board.findOne({ userId: req.user.id });
        if (!board) {
            board = new Board_1.Board({
                name: "My kanban board",
                userId: req.user.id,
            });
            await board.save();
        }
        res.status(200).json(board);
    }
    catch (error) {
        console.error(`Error getting boardss: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/board/:boardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const boardId = req.params.boardId;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Board name is required" });
            return;
        }
        const board = await Board_1.Board.findById(boardId);
        if (!board) {
            res.status(400).json({ error: "Board not found" });
            return;
        }
        board.name = name;
        await board.save();
        res.status(200).json(board);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//COLUMN ROUTES:
router.put("/api/column/editname/:columnId", validateToken_1.validateToken, async (req, res) => {
    try {
        const columnId = req.params.columnId;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Board name is required" });
            return;
        }
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(400).json({ error: "Board not found" });
            return;
        }
        column.name = name;
        await column.save();
        res.status(200).json(column);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/api/columns", validateToken_1.validateToken, async (req, res) => {
    try {
        const { boardId } = req.query;
        if (!boardId) {
            res.status(400).json({ message: "Board id is required!" });
            return;
        }
        const columns = await Column_1.Column.find({ boardId }).sort({ position: 1 });
        const columnsWithCards = await Promise.all(columns.map(async (column) => {
            const cards = await Card_1.Card.find({ columnId: column._id }).sort({ position: 1 });
            return { ...column.toObject(), cards };
        }));
        res.status(200).json(columnsWithCards);
    }
    catch (error) {
        console.error(`Error getting columns: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post("/api/columns", validateToken_1.validateToken, async (req, res) => {
    try {
        const { name, boardId } = req.body;
        if (!name) {
            res.status(400).json({ message: "Column name required" });
        }
        if (!boardId) {
            res.status(400).json({ message: "Board id required" });
        }
        const columnCount = await Column_1.Column.countDocuments({ boardId });
        const newColumn = new Column_1.Column({
            name,
            boardId,
            position: columnCount + 1,
        });
        await newColumn.save();
        res.status(200).json(newColumn);
    }
    catch (error) {
        console.error(`Error during creating column: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/columns/update/:columnId", validateToken_1.validateToken, async (req, res) => {
    const { columnId } = req.params;
    const { cards } = req.body;
    try {
        if (!columnId) {
            res.status(400).json({ message: "Column id is required!" });
            return;
        }
        const columnsCards = await Card_1.Card.find({ columnId: columnId });
        if (!columnsCards) {
            res.status(404).json({ message: "Cards not found!" });
            return;
        }
        const updatePromises = cards.map(async (updatedCard) => {
            const dbCard = columnsCards.find(card => card.id.toString() === updatedCard._id);
            if (dbCard) {
                dbCard.position = updatedCard.position;
                await dbCard.save();
            }
        });
        await Promise.all(updatePromises);
        const updatedCards = await Card_1.Card.find({ columnId: columnId });
        res.json({ message: "Card positions updated successfully", cards: updatedCards });
    }
    catch (error) {
        console.error(`Error getting cards: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete("/api/columns/:id", validateToken_1.validateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCol = await Column_1.Column.findByIdAndDelete(id);
        if (!deleteCol) {
            res.status(400).json({ message: "Column not found" });
        }
        res.status(200).json({ message: "Column deleted" });
    }
    catch (error) {
        console.error(`Error during deleting column: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//CARD ROUTES:
router.get("/api/cards", validateToken_1.validateToken, async (req, res) => {
    try {
        const { columnId } = req.query;
        if (!columnId) {
            res.status(400).json({ message: "Column id is required!" });
            return;
        }
        const cards = await Card_1.Card.find({ columnId }).sort({ position: 1 });
        res.status(200).json(cards);
    }
    catch (error) {
        console.error(`Error getting cards: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/cards/update/:movedId", validateToken_1.validateToken, async (req, res) => {
    const { movedId } = req.params;
    const { columnId, position } = req.body;
    try {
        if (!columnId) {
            res.status(400).json({ message: "Column id is required!" });
            return;
        }
        const card = await Card_1.Card.findByIdAndUpdate(movedId, { columnId, position }, { new: true });
        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }
        res.json({ message: "Card updated successfully", card });
    }
    catch (error) {
        console.error(`Error getting cards: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post("/api/card", validateToken_1.validateToken, async (req, res) => {
    try {
        const { title, description, columnId } = req.body;
        if (!title) {
            res.status(400).json({ message: "title required" });
            return;
        }
        if (!columnId) {
            res.status(400).json({ message: "column id required" });
            return;
        }
        const columnExists = await Column_1.Column.findById(columnId);
        if (!columnExists) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        const cardCount = await Card_1.Card.countDocuments({ columnId });
        const newCard = new Card_1.Card({
            title,
            description,
            columnId,
            position: cardCount + 1,
        });
        await newCard.save();
        res.status(200).json(newCard);
    }
    catch (error) {
        console.error(`Error making card: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete("/api/card/del/:id", validateToken_1.validateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCard = await Card_1.Card.findByIdAndDelete(id);
        if (!deleteCard) {
            res.status(400).json({ message: "Card not found" });
        }
        res.status(200).json({ message: "Card deleted" });
    }
    catch (error) {
        console.error(`Error during deleting column: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/card/edit/title/:cardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const { title } = req.body;
        if (!title) {
            res.status(400).json({ error: "Board name is required" });
            return;
        }
        const card = await Card_1.Card.findById(cardId);
        if (!card) {
            res.status(400).json({ error: "Card not found" });
            return;
        }
        card.title = title;
        await card.save();
        res.status(200).json(card);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/card/edit/description/:cardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const { description } = req.body;
        if (!description) {
            res.status(400).json({ error: "Board name is required" });
            return;
        }
        const card = await Card_1.Card.findById(cardId);
        if (!card) {
            res.status(400).json({ error: "Card not found" });
            return;
        }
        card.description = description;
        await card.save();
        res.status(200).json(card);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/card/edit/checkBox/:cardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const { checkBox } = req.body;
        const card = await Card_1.Card.findById(cardId);
        if (!card) {
            res.status(400).json({ error: "Card not found" });
            return;
        }
        card.checkBox = checkBox;
        await card.save();
        res.status(200).json(card);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/api/card/edit/checkBoxImportant/:cardId", validateToken_1.validateToken, async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const { checkBoxImportant } = req.body;
        const card = await Card_1.Card.findById(cardId);
        if (!card) {
            res.status(400).json({ error: "Card not found" });
            return;
        }
        card.important = checkBoxImportant;
        await card.save();
        res.status(200).json(card);
    }
    catch (error) {
        console.error(`Error changing board name: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
