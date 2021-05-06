const Joi = require('joi');

const { postsRepository } = require('../repos');

async function getPost(req, res, next) {
    try {
        const { id } = req.params;

        const post = await postsRepository.getPostById(id);

        if (!post) {
            const err = new Error(`Post does not exist.`);
            err.code = 409;

            throw err;
        }

        res.send({
            id: post.id,
            title: post.title,
            link: post.link,
            description: post.description,
            date: post.created_date,
        });
    } catch (err) {
        next(err);
    }
}

async function getRecentPosts(req, res, next) {
    try {
        const posts = await postsRepository.sortPostsByDate();

        if (!posts) {
            const err = new Error(`No posts.`);
            err.code = 409;

            throw err;
        }

        res.send(posts);
    } catch (err) {
        next(err);
    }
}

async function createPost(req, res, next) {
    try {
        const { id } = req.auth;

        //Saber que datos se están enviando en la petición
        const { link, title, description } = req.body;

        //Validar que los datos que se envían son correctos
        const schema = Joi.object({
            link: Joi.string().uri().required(),
            title: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a title. 255 chars max.')),
            description: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a description, max 255 characters.')),
        });

        await schema.validateAsync({ link, title, description });

        //Meter los datos en la base de datos (usando una función externa)
        const result = await postsRepository.insertPost({
            link,
            userId: id,
            title,
            description,
        });

        //Devolver información al usuario de que todo fue bien
        return res.send({
            status: 'ok',
            data: {
                link,
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

async function deletePost(req, res, next) {
    try {
        const { id } = req.params;

        const result = await postsRepository.deletePost(id);

        return res.send(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPost,
    deletePost,
    getPost,
    getRecentPosts,
};
