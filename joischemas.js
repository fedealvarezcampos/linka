const Joi = require('joi');
const complexOpt = {
    min: 10,
    max: 20,
    lowerCase: 1,
    upperCase: 1,
    numeric: 2,
    symbol: 0,
    requirementCount: 0,
};

const usernameRegex = /^[A-Za-z][A-Za-z0-9]*$/;

const schemaUserProfile = Joi.object({
    password: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
    confirmPass: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
    bio: Joi.string()
        .min(5)
        .max(100)
        .error(() => new Error('Bio must be between 5 and 100 characters long.')),
    userSite: Joi.string()
        .min(5)
        .max(50)
        .uri()
        .error(() => new Error('Must be a valid URL.')),
    userTW: Joi.string()
        .min(5)
        .max(50)
        .uri()
        .error(() => new Error('Must be a valid URL.')),
    userIG: Joi.string()
        .min(5)
        .max(50)
        .uri()
        .error(() => new Error('Must be a valid URL.')),
});

const schemaLogin = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .error(() => new Error('Not a valid e-mail.')),
    password: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
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
        .min(4)
        .max(20)
        .regex(usernameRegex)
        .required()
        .error(() => new Error('Username must be 4 to 20 characters long, no spaces.')),
    email: Joi.string()
        .email()
        .required()
        .error(() => new Error('Not a valid e-mail.')),
    password: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
    confirmPass: Joi.string().error(() => new Error('Password must be 5 to 20 characters long.')),
});

module.exports = { schemaUserProfile, schemaLogin, schemaPassChange, schemaRegister, complexOpt };