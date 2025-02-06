import {body} from "express-validator"

const registerValidator = [
    body("email").trim().escape().isEmail(),
    body("username").trim().escape().isLength({min:3, max:25}),
    body("password").isLength({min:6}).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[\#\!\&\?\_]/)
]

const loginValidator = [
    body("email").trim().escape().isEmail(),
    body("password").isLength({min:6}).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[\#\!\&\?\_]/)
]

export { registerValidator, loginValidator };
