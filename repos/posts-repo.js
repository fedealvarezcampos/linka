const SQL = require('sql-template-strings');
const { database } = require('../infrastructure');

const getPostById = async id => {
    const query = SQL`SELECT * FROM posts WHERE id = ${id}`;
    const [posts] = await database.pool.query(query);

    return posts[0];
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

const deletePost = async id => {
    const query = SQL`DELETE FROM posts WHERE id = ${id}`;

    const [result] = await database.pool.query(query);

    return result;
};

module.exports = {
    insertPost,
    deletePost,
    getPostById,
    sortPostsByDate,
    sortPostsByLikes,
};
