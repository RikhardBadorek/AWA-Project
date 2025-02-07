"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
//This validates the JWT token on all backend calls
dotenv_1.default.config();
const SECRET = process.env.SECRET;
const validateToken = (req, res, next) => {
    const token = req.header('authorization')?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied, missing token" });
        return;
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Access denied, missing token" });
        return;
    }
};
exports.validateToken = validateToken;
