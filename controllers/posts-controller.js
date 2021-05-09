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

        const { link, title, description } = req.body;

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

        return res.send(result);
    } catch (error) {
        next(error);
    }
}

async function editPost(req, res, next) {
    try {
        const { id: postId } = req.params;

        const { title, description } = req.body;

        const schema = Joi.object({
            title: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a title. 255 chars max.')),
            description: Joi.string()
                .max(255)
                .error(() => new Error('Too long of a description, max 255 characters.')),
        });

        await schema.validateAsync({ title, description });

        const result = await postsRepository.editPost({
            postId: postId,
            title,
            description,
        });

        return res.send(result);
    } catch (error) {
        next(error);
    }
}

async function likePost(req, res, next) {
    try {
        const { id: userId } = req.auth;
        const { id: postId } = req.params;

        const isLikedAlready = await postsRepository.isLikedByUserId(userId, postId);

        if (isLikedAlready) {
            await postsRepository.unLikePost(userId, postId);
        } else {
            await postsRepository.likePost(userId, postId);
        }

        return res.send();
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
    editPost,
    deletePost,
    getPost,
    likePost,
    sortPosts,
};
