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

        // res.send(commentReplies);
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

        const schema = Joi.string()
            .min(5)
            .max(500)
            .error(() => new Error(`Say something that's between 5 and 250 characters.`));

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
            deleted: comment.deleted,
            created_date: comment.created_date,
            username: user.username,
            avatar: user.avatar,
        });
    } catch (err) {
        next(err);
    }
}

async function replyToComment(req, res, next) {
    try {
        const { text } = req.body;
        const { id: postId, id_comment: parentId } = req.params;
        const { id } = req.auth;

        const schema = Joi.string().min(5).max(500);
        await schema.validateAsync(text);

        const user = await usersRepository.getUserById(id);
        const post = await postsRepository.getPostById(postId);
        const comment = await commentsRepository.getCommentById(parentId);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        if (!comment) {
            const error = new Error(`No such comment.`);
            error.code = 404;

            throw error;
        }

        if (!post) {
            const error = new Error(`No post there.`);
            error.code = 404;

            throw error;
        }

        const commentReply = await commentsRepository.respondComment({
            text,
            id,
            postId,
            parentId,
        });

        res.send({
            commentId: commentReply.id,
            userId: commentReply.userId,
            postId: commentReply.postId,
            text: commentReply.text,
            parent_comment: commentReply.parent_comment,
            deleted: commentReply.deleted,
            created_date: commentReply.created_date,
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

        await commentsRepository.eraseComment(commentId, postId);

        res.send({ message: "God's in his heaven, All's right with the world" });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getComments,
    postComment,
    replyToComment,
    eraseComment,
};
