const Joi = require('joi');

const { commentsRepository, usersRepository, postsRepository } = require('../repos');

async function getComments(req, res, next) {
    try {
        const { id: postId } = req.params;
        const schema = Joi.number().positive().required();
        await schema.validateAsync(postId);

        const post = await postsRepository.getPostById(postId);

        if (!post) {
            const error = new Error(`No post there.`);
            error.code = 404;

            throw error;
        }

        const comments = await commentsRepository.getComments(postId);

        res.send(comments);
    } catch (err) {
        next(err);
    }
}

async function postComment(req, res, next) {
    try {
        const { text } = req.body;
        const { id: postId } = req.params;
        const { id } = req.auth;

        const schema = Joi.string().min(5).max(500);
        await schema.validateAsync(text);

        const user = await usersRepository.getUserById(id);
        const post = await postsRepository.getPostById(postId);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        if (!post) {
            const error = new Error(`No post there.`);
            error.code = 404;

            throw error;
        }

        const comment = await commentsRepository.insertComment({
            text,
            id,
            postId,
        });

        res.send({
            commentId: comment.id,
            userId: comment.userId,
            postId: comment.postId,
            text: comment.text,
            created_date: comment.created_date,
            username: user.username,
            avatar: user.avatar,
        });
    } catch (err) {
        next(err);
    }
}

async function eraseComment(req, res, next) {
    try {
        const { id: postId, id_comment: commentId } = req.params;
        const { id: userId } = req.auth;

        const schema = Joi.number().positive().required();
        await schema.validateAsync(postId, commentId);

        const user = await usersRepository.getUserById(userId);
        const comment = await commentsRepository.getCommentById(commentId);
        const post = await postsRepository.getPostById(postId);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        if (!post) {
            const error = new Error(`No post there.`);
            error.code = 404;

            throw error;
        }

        if (!comment) {
            const error = new Error(`Comment does not exist.`);
            error.code = 404;

            throw error;
        }

        if (comment.text === 'Comment deleted.') {
            const error = new Error(`Comment already erased.`);
            error.code = 404;

            throw error;
        }

        if (userId !== comment.userId) {
            const error = new Error(`Not your comment.`);
            error.code = 401;

            throw error;
        }

        const erasedComment = await commentsRepository.eraseComment(commentId);

        res.send(erasedComment);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getComments,
    postComment,
    eraseComment,
};
