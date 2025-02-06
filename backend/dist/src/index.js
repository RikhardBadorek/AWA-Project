"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateToken_1 = require("../middleware/validateToken");
const router = express_1.default.Router();
const users = [];
const SECRET = process.env.SECRET;
router.post("/api/user/register", (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        if (!password) {
            res.status(400).json({ message: "Password is required" });
            return;
        }
        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
            res.status(403).json({ message: "Email already exists" });
            return;
        }
        const hash = bcrypt_1.default.hashSync(password, 10);
        const newUser = {
            email,
            password: hash
        };
        users.push(newUser);
        res.status(200).json(newUser);
    }
    catch (error) {
        console.error(`Error during user register: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/api/user/list", (req, res) => {
    res.status(200).json(users);
});
router.post("/api/user/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
    }
    const user = users.find((user) => user.email === email);
    if (!user) {
        res.status(403).json({ message: "error in login" });
        return;
    }
    if (bcrypt_1.default.compareSync(password, user.password)) {
        const jwtPayload = {
            email: user.email
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, SECRET, { expiresIn: "10m" });
        res.status(200).json({ success: true, token });
    }
    else {
        res.status(401).json({ message: "Invalid email or password" });
    }
});
router.get("/api/private", validateToken_1.validateToken, (req, res) => {
    res.status(200).json({ message: "This is protected secure route!" });
});
exports.default = router;
