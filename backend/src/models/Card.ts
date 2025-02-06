import mongoose, {Document, Schema} from "mongoose";

interface ICard extends Document {
    title: string
    description: string
    columnId: string
    position: number
    createdAt: Date
    checkBox: boolean
    important: boolean
}

const CardSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    columnId: { type: String, required: true },
    position: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    checkBox: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
})

const Card: mongoose.Model<ICard> = mongoose.model<ICard>("Card", CardSchema)

export {Card, ICard}