const Joi = require('joi');
const complexOpt = {
    min: 10,
    max: 20,
    lowerCase: 0,
    upperCase: 1,
    numeric: 2,
    symbol: 0,
    requirementCount: 0,
};

const usernameRegex = /^[A-Za-z][A-Za-z0-9]*$/;

const schemaUserProfile = Joi.object({
    password: Joi.string()
        .optional()
        .error(() => new Error('Password must be 10 to 20 characters long.')),
    confirmPass: Joi.string()
        .optional()
        .error(() => new Error('Password must be 10 to 20 characters long.')),
    bio: Joi.string()
        .allow('')
        .min(5)
        .max(100)
        .error(() => new Error('Bio must be between 5 and 100 characters long.')),
    userSite: Joi.string()
        .allow('')
        .min(5)
        .max(50)
        .uri()
        .error(() => new Error('Must be a valid URL.')),
    userTW: Joi.string()
        .allow('')
        .min(0)
        .max(50)
        .error(() => new Error('Something is not ok with that username.')),
    userIG: Joi.string()
        .allow('')
        .min(0)
        .max(50)
        .error(() => new Error('Something is not ok with that username.')),
});

const schemaLogin = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .error(() => new Error('A valid email is required.')),
    password: Joi.string().error(() => new Error('Password is required.')),
});

const schemaPassChange = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .error(() => new Error('Not a valid e-mail.')),
    password: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
    confirmPass: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
});

const schemaRegister = Joi.object({
    username: Joi.string()
        .min(5)
        .max(10)
        .regex(usernameRegex)
        .required()
        .error(() => new Error('Username must be 5 to 10 characters long, no spaces.')),
    email: Joi.string()
        .email()
        .required()
        .error(() => new Error('Not a valid e-mail.')),
    password: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
    confirmPass: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
});

module.exports = { schemaUserProfile, schemaLogin, schemaPassChange, schemaRegister, complexOpt };
