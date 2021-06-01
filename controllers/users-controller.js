const Joi = require('joi');
const passComplex = require('joi-password-complexity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { uploadImages } = require('../helpers');

const { usersRepository, imagesRepository, postsRepository } = require('../repos');

const { schemaUserProfile, schemaLogin, schemaRegister, complexOpt } = require('../joischemas');

async function getProfile(req, res, next) {
    try {
        const { username } = req.params;

        const user = await usersRepository.getUserByName(username);

        if (!user) {
            const err = new Error(`Account does not exist.`);
            err.code = 404;

            throw err;
        }

        if (user.verified === 0) {
            const err = new Error(`User profile not available (possibly not verified).`);
            err.code = 404;

            throw err;
        }

        const posts = await postsRepository.getPostsByUserId(user.id);
        const nOfLikes = await usersRepository.likesUserReceived(user.id);

        res.send({
            id: user.id,
            username: user.username,
            bio: user.bio,
            avatar: user.avatar,
            userSite: user.userSite,
            userTW: user.userTW,
            userIG: user.userIG,
            love: nOfLikes,
            userPosts: posts,
        });
    } catch (err) {
        next(err);
    }
}

async function getRecentActivity(req, res, next) {
    try {
        const { id } = req.auth;
        const { username } = req.params;
        const schemaId = Joi.number().positive().required();
        await schemaId.validateAsync(id);

        const user = await usersRepository.getUserById(id);
        const userWithName = await usersRepository.getUserByName(username);

        if (!user) {
            const err = new Error(`User does not exist.`);
            err.code = 409;

            throw err;
        }

        if (!userWithName) {
            const err = new Error(`User does not exist.`);
            err.code = 409;

            throw err;
        }

        const activity = await usersRepository.getRecentActivity(id);

        res.send(activity);
    } catch (err) {
        next(err);
    }
}

async function registerUser(req, res, next) {
    try {
        const { username, email, password, confirmPass } = req.body;

        if (password !== confirmPass) {
            const err = new Error('Password and confirmed password must be the same.');
            err.code = 400;

            throw err;
        }

        await schemaRegister.validateAsync({
            username,
            email,
            password,
            confirmPass,
        });

        await passComplex(complexOpt, 'Pass').validateAsync(password, confirmPass);

        const userHasEmail = await usersRepository.getUserByEmail(email);

        if (userHasEmail) {
            const err = new Error(`Email address already in use.`);
            err.code = 409;

            throw err;
        }

        const userHasUsername = await usersRepository.getUserByName(username);

        if (userHasUsername) {
            const err = new Error(`Username already taken.`);
            err.code = 409;

            throw err;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await usersRepository.insertUser({
            username,
            email,
            password: passwordHash,
        });

        const msg = {
            to: `${newUser.email}`,
            from: 'linka.noreply@gmail.com',
            templateId: 'd-115445c28a684e788f3197a79251ec9d',
            dynamicTemplateData: {
                name: newUser.username,
                header: req.headers.host,
                uuid: newUser.UUID,
            },
        };

        await sgMail.send(msg);

        res.status(201);
        res.send({
            id: newUser.id,
            name: newUser.username,
            email: newUser.email,
        });
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const { id } = req.auth;
        const token = req.headers.authorization.slice(7);
        const { username } = req.params;
        const { password, confirmPass, bio, userSite, userTW, userIG } = req.body;

        await schemaUserProfile.validateAsync({
            password,
            confirmPass,
            bio,
            userSite,
            userTW,
            userIG,
        });

        await passComplex(complexOpt, 'Password').validateAsync(password, confirmPass);

        const user = await usersRepository.getUserByName(username);

        if (!user) {
            const err = new Error(`User does not exist.`);
            err.code = 409;

            throw err;
        }

        if (password !== confirmPass) {
            const err = new Error('Password and confirmed password must be the same.');
            err.code = 400;

            throw err;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await usersRepository.updateUser(username, {
            password: passwordHash,
            bio,
            userSite,
            userTW,
            userIG,
        });

        let image;

        if (req.files && req.files.avatar) {
            image = await uploadImages({ file: req.files.avatar, dir: 'avatars' });
            await imagesRepository.updateAvatar(id, image);
            // delete image si ya existe
        }

        const nOfLikes = await usersRepository.likesUserReceived(user.id);

        res.send({
            id,
            username,
            bio,
            love: nOfLikes,
            avatar: image || user.avatar,
            userSite,
            userTW,
            userIG,
            token: token,
        });
    } catch (err) {
        next(err);
    }
}

async function changePass(req, res, next) {
    try {
        const { UUID } = req.params;
        const { password, confirmPass } = req.body;

        await passComplex(complexOpt, 'Password').validateAsync(password, confirmPass);

        if (password !== confirmPass) {
            const err = new Error('Password and confirmed password must be the same.');
            err.code = 400;

            throw err;
        }

        const user = await usersRepository.getUserByUUID(UUID);

        if (!user) {
            const err = new Error(`User does not exist.`);
            err.code = 401;

            throw err;
        }

        if (user.verified === 0) {
            const err = new Error(`User is not verified, confirm your account first.`);
            err.code = 401;

            throw err;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await usersRepository.changePass({
            password: passwordHash,
            username: user.username,
        });

        res.send({
            id: user.id,
            username: user.username,
            message: 'Password has been successfully changed. You can now log in.',
        });
    } catch (err) {
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        const { id } = req.auth;
        const { username } = req.params;

        const schema = Joi.number().positive();

        await schema.validateAsync(id);

        const user = await usersRepository.getUserById(id);
        const userByName = await usersRepository.getUserByName(username);

        if (!user) {
            const err = new Error(`User does not exist.`);
            err.code = 409;

            throw err;
        }

        if (id !== userByName.id) {
            const err = new Error(`This is not you, can't erase someone else in this place.`);
            err.code = 409;

            throw err;
        }

        if (user.username === 'Account suspended.') {
            const err = new Error('User account has already been erased.');
            err.code = 409;
            throw err;
        }

        if (!userByName) {
            const err = new Error(`Username does not exist.`);
            err.code = 409;

            throw err;
        }

        const deletedUser = await usersRepository.deleteUser(id);

        res.send({
            id: deletedUser.id,
        });
    } catch (err) {
        next(err);
    }
}

async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;

        await schemaLogin.validateAsync({ email, password });

        const user = await usersRepository.getUserByEmail(email);

        if (!user) {
            const error = new Error(`Account does not exist.`);
            error.code = 401;

            throw error;
        }

        if (user.verified === 0) {
            const err = new Error(`User is not verified, confirm your account first.`);
            err.code = 401;

            throw err;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            const error = new Error('Wrong password.');
            error.code = 401;

            throw error;
        }

        const tokenPayload = { id: user.id, username: user.username };

        const token = jwt.sign(tokenPayload, process.env.SECRET, {
            expiresIn: '5d',
        });

        const nOfLikes = await usersRepository.likesUserReceived(user.id);

        res.send({
            id: user.id,
            username: user.username,
            bio: user.bio,
            love: nOfLikes,
            avatar: user.avatar,
            userSite: user.userSite,
            userTW: user.userTW,
            userIG: user.userIG,
            token,
        });
    } catch (err) {
        next(err);
    }
}

async function recoverPass(req, res, next) {
    try {
        const { email } = req.body;

        const schema = Joi.string()
            .email()
            .required()
            .error(() => new Error('Not a valid e-mail.'));

        await schema.validateAsync(email);

        const user = await usersRepository.getUserByEmail(email);

        if (!user) {
            const err = new Error(`No user has been found for that email adress.`);
            err.code = 409;

            throw err;
        }

        if (user.verified === 0) {
            const err = new Error(`User must be verified first.`);
            err.code = 409;

            throw err;
        }

        const msg = {
            to: `${email}`,
            from: 'linka.noreply@gmail.com',
            templateId: 'd-266877db2fae4ad1978c23df4bcb584c',
            dynamicTemplateData: {
                name: user.username,
                header: req.headers.host,
                uuid: user.UUID,
            },
        };

        await sgMail.send(msg);

        res.status(200);
        res.send({
            id: user.id,
            name: user.username,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
}

async function validateUser(req, res, next) {
    try {
        const { UUID } = req.params;

        const user = await usersRepository.getUserByUUID(UUID);

        if (!user) {
            const error = new Error(`Invalid ID.`);
            error.code = 401;

            throw error;
        }

        if (user.verified === 1) {
            const error = new Error(`User is already verified.`);
            error.code = 401;

            throw error;
        }

        await usersRepository.validateUser(UUID);

        res.send({
            id: user.id,
            username: user.username,
        });
    } catch (err) {
        next(err);
    }
}

async function resendValidation(req, res, next) {
    try {
        const { email } = req.body;

        const schema = Joi.string()
            .email()
            .required()
            .error(() => new Error('Not a valid e-mail.'));

        await schema.validateAsync(email);

        const user = await usersRepository.getUserByEmail(email);

        if (!user) {
            const err = new Error(`No user has been found for that email address.`);
            err.code = 409;

            throw err;
        }

        if (user.verified === 1) {
            const err = new Error(`User is already verified.`);
            err.code = 409;

            throw err;
        }

        const msg = {
            to: `${user.email}`,
            from: 'linka.noreply@gmail.com',
            templateId: 'd-115445c28a684e788f3197a79251ec9d',
            dynamicTemplateData: {
                name: user.username,
                header: req.headers.host,
                uuid: user.UUID,
            },
        };

        await sgMail.send(msg);

        res.status(200);
        res.send({
            id: user.id,
            name: user.username,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProfile,
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    changePass,
    validateUser,
    resendValidation,
    recoverPass,
    getRecentActivity,
};
