import mongoose, {Document, Schema} from "mongoose";

//Board models with userID to keep the right board for the right user

interface IBoard extends Document {
    name: string
    userId: string
    createdAt: Date
}

const BoardSchema: Schema = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>("Board", BoardSchema)

export {Board, IBoard}