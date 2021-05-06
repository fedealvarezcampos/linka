const Joi = require('joi');

const { postsRepository } = require('../repos');

async function createPost(req, res, next) {
    try {
        //Saber la id del usuario que está realizando la petición
        const { id } = req.auth;

        //Saber que datos se están enviando en la petición
        const { title, description } = req.body;

        //Validar que los datos que se envían son correctos
        const schema = Joi.object({
            title: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a title. 255 chars max.')),
            description: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a description, max 255 characters.')),
        });

        await schema.validateAsync({ title, description });

        //Meter los datos en la base de datos (usando una función externa)
        const result = await postsRepository.insertPost({
            userId: id,
            title,
            description,
        });

        //Devolver información al usuario de que todo fue bien
        return res.send({
            status: 'ok',
            data: {
                id_user: id,
                id_post: result.insertId,
                title,
                description,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPost,
};
