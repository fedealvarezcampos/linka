const SQL = require('sql-template-strings');
const { database } = require('../infrastructure');

const getCommentById = async id => {
    const query = SQL`SELECT * FROM comments WHERE id = ${id}`;
    const [comments] = await database.pool.query(query);

    return comments[0];
};

const getComments = async postId => {
    const query = SQL`SELECT comments.id AS "commentId",
    userId, postId, parent_comment AS parentId, text, deleted, created_date, username, avatar
    FROM comments INNER JOIN users
    ON comments.userId = users.id
    WHERE postId = ${postId}
    ORDER BY created_date DESC`;
    const [comments] = await database.pool.query(query);

    return comments;
};

const getCommentReplies = async parentId => {
    const query = SQL`SELECT comments.id AS "commentId",
    userId, postId, parent_comment AS parentId, text, created_date, username, avatar
    FROM comments INNER JOIN users
    ON comments.userId = users.id
    WHERE parent_comment = ${parentId}
    ORDER BY created_date DESC`;
    const [comments] = await database.pool.query(query);

    return comments;
};

const getNumberOfComments = async postId => {
    const query = SQL`SELECT count(comments.id) as Total FROM comments WHERE postId = ${postId} AND comments.deleted = 0`;

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

const respondComment = async data => {
    const insertQuery = SQL`INSERT INTO comments (text, postId, userId, parent_comment, created_date)
    VALUES (${data.text}, ${data.postId}, ${data.id}, ${data.parentId}, ${new Date()})`;

    const [result] = await database.pool.query(insertQuery);

    const nOfComments = await getNumberOfComments(data.postId);

    const updateCommentsQuery = SQL`UPDATE posts SET commented = ${nOfComments} WHERE id = ${data.postId}`;

    await database.pool.query(updateCommentsQuery);

    const commentId = result.insertId;

    return getCommentById(commentId);
};

const eraseComment = async (commentId, postId) => {
    const erasedCommentText = 'Comment deleted.';
    const updateQuery = SQL`UPDATE comments SET text = ${erasedCommentText}, deleted = true WHERE id = ${commentId}`;
    await database.pool.query(updateQuery);

    const nOfComments = await getNumberOfComments(postId);

    const updateCommentsQuery = SQL`UPDATE posts SET commented = ${nOfComments} WHERE id = ${postId}`;

    await database.pool.query(updateCommentsQuery);

    return getCommentById(commentId);
};

module.exports = {
    getComments,
    getCommentReplies,
    getCommentById,
    insertComment,
    respondComment,
    eraseComment,
    getNumberOfComments,
};
