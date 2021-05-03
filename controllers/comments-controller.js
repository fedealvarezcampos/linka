const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { commentsRepository, usersRepository } = require('../repos');

async function postComment(req, res, next) {
    try {
        const { text } = req.body;
        const { id: postId } = req.params;
        const { id } = req.auth;

        const schema = Joi.string().min(5).max(500).required();
        await schema.validateAsync(text);

        const user = await usersRepository.getUserById(id);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 401;

            throw error;
        }

        const comment = await commentsRepository.insertComment({
            text,
            id,
            postId,
        });

        res.send(comment);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    postComment,
};
