import express, {Express, Request, Response} from "express"
import router from "./src/routes/user";
import dotenv from "dotenv"
import mongoose, {Connection} from "mongoose";
import cors, { CorsOptions } from "cors";
import path from "path";

dotenv.config()

const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 3000

const mongoDB: string = "mongodb://127.0.0.1:27017/testdb"

mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error"))

if (process.env.NODE_ENV === "development") {
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:5000',
        optionsSuccessStatus: 200,
    }
    app.use(cors(corsOptions))
} else if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve('../..', 'client', 'build')))
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve('../..', 'client', 'build', 'index.html'))
    })
}

app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.use("/", router);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})