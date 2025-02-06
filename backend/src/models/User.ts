import mongoose, {Document, Schema} from "mongoose";

interface IUser extends Document {
    email: string
    username: string
    password: string
    isAdmin: boolean
}

const UserSchema: Schema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, default: false},
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema)

export {User, IUser}