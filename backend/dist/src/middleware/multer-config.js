"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        const extension = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, extension);
        const id = (0, uuid_1.v4)();
        const filename = `${baseName}_${id}${extension}`;
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
