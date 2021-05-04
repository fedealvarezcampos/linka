const SQL = require('sql-template-strings');
const { format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const { database } = require('../infrastructure');

const getUserByName = async username => {
    const query = SQL`SELECT * FROM users WHERE username = ${username}`;
    const [users] = await database.pool.query(query);

    return users[0];
};

const getUserById = async id => {
    const query = SQL`SELECT * FROM users WHERE id = ${id}`;
    const [users] = await database.pool.query(query);

    return users[0];
};

const getUserByEmail = async email => {
    const query = SQL`SELECT * FROM users WHERE email = ${email}`;
    const [users] = await database.pool.query(query);

    return users[0];
};

const getUserByUUID = async UUID => {
    const query = SQL`SELECT * FROM users WHERE UUID = ${UUID}`;
    const [users] = await database.pool.query(query);

    return users[0];
};

const insertUser = async data => {
    const newDate = new Date();
    const regDate = format(newDate, 'yyyy-MM-dd HH:mm:ss');
    const newUUID = uuidv4();

    const query = SQL`INSERT INTO users (username, email, password, UUID, regDate) VALUES (${data.username}, ${data.email}, ${data.password}, ${newUUID}, ${regDate})`;
    await database.pool.query(query);

    return getUserByEmail(data.email);
};

async function updateUser(username, data) {
    const { password, bio, userSite, userTW, userIG } = data;
    const newDate = new Date();
    const editDate = format(newDate, 'yyyy-MM-dd HH:mm:ss');

    const updateQuery = SQL`UPDATE users SET password = ${password}, bio = ${bio}, userSite = ${userSite}, userTW = ${userTW}, userIG = ${userIG}, editDate = ${editDate} WHERE username = ${username}`;
    await database.pool.query(updateQuery);

    return getUserByName(username);
}

async function changePass(data) {
    const { password, username } = data;
    const newDate = new Date();
    const editDate = format(newDate, 'yyyy-MM-dd HH:mm:ss');

    const updateQuery = SQL`UPDATE users SET password = ${password}, editDate = ${editDate} WHERE username = ${username}`;
    await database.pool.query(updateQuery);

    return getUserByName(username);
}

async function validateUser(UUID) {
    const updateQuery = SQL`UPDATE users SET verified = true WHERE UUID = ${UUID}`;
    const [rows] = await database.pool.query(updateQuery);

    return rows[0];
}

const getRecentActivity = async id => {
    const query = SQL`SELECT users.avatar AS "avatar",
        users.username AS "username",
        comments.text AS "comment",
        comments.created_date AS "commentDate"
        FROM comments INNER JOIN posts ON postId = posts.id
        INNER JOIN users ON users.id = comments.userId
        WHERE comments.userId != ${id} && posts.userId = ${id}
        ORDER BY commentDate DESC`;

    const [comments] = await database.pool.query(query);

    return comments;
};

module.exports = {
    getUserByName,
    getUserByEmail,
    getUserByUUID,
    getUserById,
    insertUser,
    updateUser,
    changePass,
    validateUser,
    getRecentActivity,
};
