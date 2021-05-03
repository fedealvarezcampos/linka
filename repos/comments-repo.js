const SQL = require('sql-template-strings');
const { format } = require('date-fns');
const { database } = require('../infrastructure');

const getCommentById = async id => {
    const query = SQL`SELECT * FROM comments WHERE id = ${id}`;
    const [comments] = await database.pool.query(query);

    return comments[0];
};

const getComments = async postId => {
    const query = SQL`SELECT * FROM comments WHERE postId = ${postId}`;
    const [comments] = await database.pool.query(query);

    return comments;
};

const insertComment = async data => {
    const newDate = new Date();
    const postedDate = format(newDate, 'yyyy-MM-dd HH:mm:ss');

    const query = SQL`INSERT INTO comments (text, postId, userId, created_date) VALUES (${data.text}, ${data.postId}, ${data.id}, ${postedDate})`;
    const [result] = await database.pool.query(query);

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
};
