"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
const registerValidator = [
    (0, express_validator_1.body)("email").trim().escape().isEmail(),
    (0, express_validator_1.body)("username").trim().escape().isLength({ min: 3, max: 25 }),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[\#\!\&\?\_]/)
];
exports.registerValidator = registerValidator;
const loginValidator = [
    (0, express_validator_1.body)("email").trim().escape().isEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[\#\!\&\?\_]/)
];
exports.loginValidator = loginValidator;
