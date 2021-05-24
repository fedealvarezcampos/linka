const Joi = require('joi');
// const { v4: uuidv4 } = require('uuid');
// const download = require('image-downloader');
const { getLinkPreview } = require('link-preview-js');
const { postsRepository, usersRepository } = require('../repos');

async function getPost(req, res, next) {
    try {
        const { id } = req.params;

        const post = await postsRepository.getPostById(id);

        if (!post) {
            const err = new Error('Post does not exist.');
            err.code = 404;

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

async function searchPost(req, res, next) {
    try {
        const { q, sort } = req.query;

        if (!q) {
            const err = new Error(`Need to submit a value to search for.`);
            err.code = 401;

            throw err;
        }

        const schema = Joi.string()
            .min(4)
            .error(() => new Error('Search should be at least 4 characters long.'));

        await schema.validateAsync(q);

        const posts = await postsRepository.searchPost(q, sort);
        res.send(posts);
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
                .max(120)
                .error(() => new Error('Too long of a title. 120 chars max.')),
            description: Joi.string()
                .max(240)
                .error(() => new Error('Too long of a description, max 240 characters.')),
        });

        await schema.validateAsync({ link, title, description });

        const linkPreview = await getLinkPreview(link, {
            headers: {
                'user-agent': 'googlebot',
            },
        });
        console.log(linkPreview);

        // let image;

        // if (link.includes('instagram.com')) {
        //     // image = await uploadImages({ file: linkPreview.favicons[0], dir: 'missedPrevs' });

        //     const options = {
        //         url: linkPreview.images[0],
        //         dest: `./static/images/missedPrevs/${uuidv4()}.jpg`, // will be saved to /path/to/dest/photo.jpg
        //     };

        //     image = await download.image(options);
        // }

        const result = await postsRepository.insertPost({
            link,
            userId: id,
            title,
            description,
            linkTitle: linkPreview.title.slice(0, 45) + '...',
            linkImg: linkPreview.images[0],
            linkSite: linkPreview.siteName,
            linkDesc:
                linkPreview.description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').slice(0, 120) + '...',
        });

        return res.send(result);
    } catch (error) {
        next(error);
    }
}

async function editPost(req, res, next) {
    try {
        const { id: postId } = req.params;

        const { id: userId } = req.auth;

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

        const post = await postsRepository.getPostById(postId);

        if (!post) {
            const err = new Error('Post does not exist.');
            err.code = 404;

            throw err;
        }

        if (userId !== post.userId) {
            const err = new Error('Not your post.');
            err.code = 409;

            throw err;
        }

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

        const user = await usersRepository.getUserById(userId);
        const post = await postsRepository.getPostById(postId);

        if (!post) {
            const err = new Error(`No post there.`);
            err.code = 404;

            throw err;
        }

        if (user.username === 'Account suspended.') {
            const err = new Error(`Account no longer exists.`);
            err.code = 404;

            throw err;
        }

        const isLikedAlready = await postsRepository.isLikedByUserId(userId, postId);

        if (isLikedAlready) {
            await postsRepository.unLikePost(userId, postId);
            res.send(post);
        } else {
            await postsRepository.likePost(userId, postId);
            res.send(post);
        }
    } catch (error) {
        next(error);
    }
}

async function deletePost(req, res, next) {
    try {
        const { id: userId } = req.auth;
        const { id } = req.params;

        const post = await postsRepository.getPostById(id);

        if (!post) {
            const err = new Error(`Post does not exist.`);
            err.code = 404;

            throw err;
        }

        if (post.userId !== userId) {
            const err = new Error(`This post is not yours so you can't delete it, sorry.`);
            err.code = 409;

            throw err;
        }

        await postsRepository.deletePost(id);

        res.send({ message: 'All gone!' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPost,
    editPost,
    searchPost,
    deletePost,
    getPost,
    likePost,
    sortPosts,
};
