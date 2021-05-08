const Joi = require('joi');
const { getLinkPreview } = require('link-preview-js');

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

        res.send(post);
    } catch (err) {
        next(err);
    }
}

async function sortPosts(req, res, next) {
    try {
        const { sort } = req.query;

        if (!sort) {
            const posts = await postsRepository.sortPostsByDate();
            res.send(posts);
        }

        if (sort === 'mostliked') {
            const posts = await postsRepository.sortPostsByLikes();
            res.send(posts);
        }
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

        const linkPreview = await getLinkPreview(link, {
            headers: {
                'user-agent': 'googlebot',
            },
        });
        console.log(linkPreview);

        //Meter los datos en la base de datos (usando una función externa)
        const result = await postsRepository.insertPost({
            link,
            userId: id,
            title,
            description,
            linkTitle: linkPreview.title,
            linkImg: linkPreview.images[0],
            linkSite: linkPreview.siteName,
            linkDesc: linkPreview.description,
        });

        return res.send({
            postId: result.id,
            userId: result.userId,
            title,
            description,
            link,
            linkTitle: result.linkTitle,
            linkImg: result.linkImg,
            linkSite: result.linkSite,
            linkDesc: result.linkDesc,
            likes: result.likes,
            created_date: result.created_date,
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
    sortPosts,
};
