import mongoose, {Document, Schema} from "mongoose";

//User model 

interface IUser extends Document {
    email: string
    username: string
    password: string
}

const UserSchema: Schema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema)

export {User, IUser}