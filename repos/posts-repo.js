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
    const query = SQL`SELECT * FROM posts ORDER BY created_date DESC`;
    const [posts] = await database.pool.query(query);

    return posts;
};

const sortPostsByLikes = async () => {
    const query = SQL`SELECT * FROM posts ORDER BY likes DESC`;
    const [posts] = await database.pool.query(query);

    return posts;
};

const insertPost = async data => {
    //creo la query
    const query = SQL`
    INSERT INTO posts(userId, title, description, link, linkTitle, linkImg, linkSite, linkDesc, created_date)
    VALUES(${data.userId}, ${data.title}, ${data.description}, ${data.link}, 
    ${data.linkTitle}, ${data.linkImg}, ${data.linkSite}, ${data.linkDesc}, ${new Date()});
  `;

    //Ejecuto la query
    const [result] = await database.pool.query(query);

    //Devuelvo información del resultado
    return getPostById(result.insertId);
};

const likePost = async data => {
    const query = SQL`
    INSERT INTO likes(userId, postId, liked)
    VALUES(${data.userId}, ${data.postId}, true);
  `;
    await database.pool.query(query);
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
    isLikedByUserId,
    getPostById,
    getPostsByUserId,
    sortPostsByDate,
    sortPostsByLikes,
};
