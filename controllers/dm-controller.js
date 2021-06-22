const Joi = require('joi');

const { usersRepository, DMsRepository } = require('../repos');

async function getUserList(req, res, next) {
    try {
        const { id: recipientId } = req.auth;

        const schema = Joi.number().positive().required();
        await schema.validateAsync(recipientId);

        const user = await usersRepository.getUserById(recipientId);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        const response = await DMsRepository.getUsersThatMessagedList(recipientId);
        const userList = [...new Set(response)];

        res.send(userList);
    } catch (err) {
        next(err);
    }
}

async function getDMs(req, res, next) {
    try {
        const { id: recipientId } = req.auth;
        const { senderId } = req.params;

        const schema = Joi.number().positive().required();
        await schema.validateAsync(senderId);

        const user = await usersRepository.getUserById(senderId);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 404;

            throw error;
        }

        const directMessages = await DMsRepository.getDirectMessages({ recipientId, senderId });

        res.send(directMessages);
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
            recipientId,
            senderId,
        });

        res.send({
            DMId: message.id,
            avatar: sender.avatar,
            userId: message.userId,
            text: message.text,
            username: sender.username,
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
    getUserList,
};
