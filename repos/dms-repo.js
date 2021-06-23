const SQL = require('sql-template-strings');
const { database } = require('../infrastructure');

const getDMById = async id => {
    const query = SQL`SELECT * FROM directMessages WHERE id = ${id}`;
    const [comments] = await database.pool.query(query);

    return comments[0];
};

const getUsersThatMessagedList = async (recipientId, userId) => {
    const query = SQL`SELECT DISTINCT users.username AS "username",
    recipientId, avatar
    FROM directMessages INNER JOIN users
    ON directMessages.recipientId = users.id
    WHERE directMessages.userId = ${userId}
    UNION
    SELECT DISTINCT users.username AS "username",
    userId, avatar
    FROM directMessages INNER JOIN users
    ON directMessages.userId = users.id
    WHERE directMessages.recipientId = ${userId}`;

    const [userList] = await database.pool.query(query);

    return userList;
};

const getDirectMessages = async data => {
    const query = SQL`SELECT directMessages.id AS "DMId",
    userId, recipientId, text, deleted, created_date, username, avatar
    FROM directMessages INNER JOIN users
    ON directMessages.userId = users.id
    WHERE recipientId = ${data.recipientId}
    AND directMessages.userId = ${data.senderId}
    UNION
    SELECT directMessages.id AS "DMId",
    userId, recipientId, text, deleted, created_date, username, avatar
    FROM directMessages INNER JOIN users
    ON directMessages.userId = users.id
    WHERE recipientId = ${data.senderId}
    AND directMessages.userId = ${data.recipientId}
    ORDER BY created_date ASC`;

    const [directMessages] = await database.pool.query(query);

    return directMessages;
};

const insertDirectMessage = async data => {
    const insertQuery = SQL`INSERT INTO directMessages (text, userId, recipientId, created_date)
    VALUES (${data.text}, ${data.senderId}, ${data.recipientId}, ${new Date()})`;

    const [result] = await database.pool.query(insertQuery);

    const DMId = result.insertId;

    return getDMById(DMId);
};

module.exports = {
    getDMById,
    getUsersThatMessagedList,
    getDirectMessages,
    insertDirectMessage,
};
