const SQL = require('sql-template-strings');
const { database } = require('../infrastructure');

const getPostById = async id => {
    const query = SQL`SELECT * FROM posts WHERE id = ${id}`;
    const [posts] = await database.pool.query(query);

    return posts[0];
};

const getPostsByUserId = async userId => {
    const query = SQL`SELECT * FROM posts WHERE userId = ${userId} ORDER BY id DESC`;
    const [posts] = await database.pool.query(query);

    return posts;
};

const sortPostsByDate = async () => {
    const query = SQL`SELECT posts.id AS "postId",
    userId, title, description, link, linkTitle,
    linkImg, linkSite, linkDesc, likes, commented,
    created_date, modDate, username, avatar
    FROM posts INNER JOIN users
    ON posts.userId = users.id
    ORDER BY created_date DESC`;
    const [posts] = await database.pool.query(query);

    return posts;
};

const sortPostsByLikes = async () => {
    const query = SQL`SELECT posts.id AS "postId",
    userId, title, description, link, linkTitle,
    linkImg, linkSite, linkDesc, likes, commented,
    created_date, modDate, username, avatar
    FROM posts INNER JOIN users
    ON posts.userId = users.id
    ORDER BY likes DESC`;
    const [posts] = await database.pool.query(query);

    return posts;
};

const searchPost = async (value, sort) => {
    const query = SQL`SELECT * FROM posts
    WHERE MATCH(title, description, linkTitle, linkDesc) AGAINST(${value})`;
    if (sort === 'new') {
        query.append(SQL` ORDER BY created_date DESC`);
    }
    const [posts] = await database.pool.query(query);
    return posts;
};

const insertPost = async data => {
    const query = SQL`
    INSERT INTO posts(userId, title, description, link, linkTitle, linkImg, linkSite, linkDesc, created_date)
    VALUES(${data.userId}, ${data.title}, ${data.description}, ${data.link}, 
    ${data.linkTitle}, ${data.linkImg}, ${data.linkSite}, ${data.linkDesc}, ${new Date()})
    `;

    const [result] = await database.pool.query(query);

    return getPostById(result.insertId);
};

const editPost = async data => {
    const query = SQL`
    UPDATE posts SET title = ${data.title}, description = ${data.description}, 
    modDate = ${new Date()} WHERE id = ${data.postId};
    `;

    await database.pool.query(query);

    return getPostById(data.postId);
};

const getLikesFromPost = async postId => {
    const query = SQL`SELECT count(posts.id) as Total FROM posts JOIN likes ON posts.id = likes.postId WHERE posts.id = ${postId}`;
    const [result] = await database.pool.query(query);
    const totalLikes = result[0].Total;

    return totalLikes;
};

const updateLikesQuery = async postId => {
    let totalLikes = await getLikesFromPost(postId);

    const query = SQL`UPDATE posts SET likes = ${totalLikes}
    WHERE id = ${postId}`;
    await database.pool.query(query);

    totalLikes = await getLikesFromPost(postId);

    return totalLikes;
};

const likePost = async (userId, postId) => {
    const query = SQL`
    INSERT INTO likes(userId, postId, liked)
    VALUES(${userId}, ${postId}, true)`;
    const [result] = await database.pool.query(query);

    await updateLikesQuery(postId);

    return result;
};

const unLikePost = async (userId, postId) => {
    const query = SQL`DELETE FROM likes WHERE userId = ${userId} && postId = ${postId}`;
    await database.pool.query(query);

    await updateLikesQuery(postId);
};

const isLikedByUserId = async (userId, postId) => {
    const query = SQL`SELECT * FROM likes WHERE userID = ${userId} && postId = ${postId}`;
    const [result] = await database.pool.query(query);

    return result[0];
};

const deletePost = async id => {
    const query = SQL`DELETE FROM posts WHERE id = ${id}`;

    const [result] = await database.pool.query(query);

    return result;
};

module.exports = {
    insertPost,
    deletePost,
    likePost,
    searchPost,
    unLikePost,
    editPost,
    isLikedByUserId,
    getLikesFromPost,
    updateLikesQuery,
    getPostById,
    getPostsByUserId,
    sortPostsByDate,
    sortPostsByLikes,
};
