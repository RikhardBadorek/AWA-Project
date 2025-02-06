"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./src/routes/user"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT) || 3000;
const mongoDB = "mongodb://127.0.0.1:27017/testdb";
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
if (process.env.NODE_ENV === "development") {
    const corsOptions = {
        origin: 'http://localhost:5000',
        optionsSuccessStatus: 200,
    };
    app.use((0, cors_1.default)(corsOptions));
}
else if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.resolve('../..', 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.resolve('../..', 'client', 'build', 'index.html'));
    });
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/", user_1.default);
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
