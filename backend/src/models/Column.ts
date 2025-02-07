import mongoose, {Document, Schema} from "mongoose";
import { Card } from "./Card";

//Column model that has the boardId to get the correct columns for users board

interface IColumn extends Document {
    name: string
    boardId: string
    position: number
    createdAt: Date
    cards: []
}

const ColumnSchema: Schema = new Schema({
    name: { type: String, required: true },
    boardId: { type: String, required: true },
    position: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    cards: { type: Array, default: []}
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Column", ColumnSchema)

export {Column, IColumn}