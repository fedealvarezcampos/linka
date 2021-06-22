const Joi = require('joi');

const { usersRepository, postsRepository, DMsRepository } = require('../repos');

async function getDMs(req, res, next) {
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

        const directMessages = await DMsRepository.getDirectMessages({ postId });

        // res.send(commentReplies);
        res.send(comments);
    } catch (err) {
        next(err);
    }
}

async function sendDM(req, res, next) {
    try {
        const { text } = req.body;
        const { userId: recipientId } = req.params;
        const { id: senderId } = req.auth;

        const schema = Joi.string()
            .min(5)
            .max(500)
            .error(() => new Error(`Say something that's between 5 and 250 characters.`));

        await schema.validateAsync(text);

        const sender = await usersRepository.getUserById(senderId);
        const recipient = await usersRepository.getUserById(recipientId);

        console.log(sender);
        console.log(recipient);

        if (!sender) {
            const error = new Error(`You don't exist (?)`);
            error.code = 404;

            throw error;
        }

        if (!recipient) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        if (sender.id === recipient.id) {
            const error = new Error(`Don't talk to yourself outside of real life`);
            error.code = 404;

            throw error;
        }

        const message = await DMsRepository.insertDirectMessage({
            text,
            senderId,
            recipientId,
        });

        res.send({
            messageId: message.id,
            senderAvatar: sender.avatar,
            senderId: message.userId,
            text: message.text,
            recipientId: message.recipientId,
            recipientName: recipient.username,
            created_date: message.created_date,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDMs,
    sendDM,
};
