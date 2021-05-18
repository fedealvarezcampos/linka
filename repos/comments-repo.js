const SQL = require('sql-template-strings');
const { database } = require('../infrastructure');

const getCommentById = async id => {
    const query = SQL`SELECT * FROM comments WHERE id = ${id}`;
    const [comments] = await database.pool.query(query);

    return comments[0];
};

const getComments = async postId => {
    const query = SQL`SELECT * FROM comments WHERE postId = ${postId} ORDER BY id DESC`;
    const [comments] = await database.pool.query(query);

    return comments;
};

const getNumberOfComments = async postId => {
    const query = SQL`SELECT count(posts.id) as Total FROM posts JOIN comments WHERE posts.id = comments.postId && posts.id = ${postId} GROUP BY posts.id`;

    const [result] = await database.pool.query(query);

    if (result[0]) {
        return result[0].Total;
    } else return 0;
};

const insertComment = async data => {
    const insertQuery = SQL`INSERT INTO comments (text, postId, userId, created_date)
    VALUES (${data.text}, ${data.postId}, ${data.id}, ${new Date()})`;

    const [result] = await database.pool.query(insertQuery);

    const nOfComments = await getNumberOfComments(data.postId);

    const updateCommentsQuery = SQL`UPDATE posts SET commented = ${nOfComments} WHERE id = ${data.postId}`;

    await database.pool.query(updateCommentsQuery);

    const commentId = result.insertId;

    return getCommentById(commentId);
};

const eraseComment = async commentId => {
    const erasedCommentText = 'Comment deleted.';
    const updateQuery = SQL`UPDATE comments SET text = ${erasedCommentText} WHERE id = ${commentId}`;
    await database.pool.query(updateQuery);

    return getCommentById(commentId);
};

module.exports = {
    getComments,
    getCommentById,
    insertComment,
    eraseComment,
    getNumberOfComments,
};
