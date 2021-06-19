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

    const updateQuery = password
        ? SQL`UPDATE users SET password = ${password},
        bio = ${bio}, userSite = ${userSite},
        userTW = ${userTW}, userIG = ${userIG},
        editDate = ${editDate}
        WHERE username = ${username}`
        : SQL`UPDATE users SET bio = ${bio},
        userSite = ${userSite}, userTW = ${userTW},
        userIG = ${userIG}, editDate = ${editDate}
        WHERE username = ${username}`;

    await database.pool.query(updateQuery);

    return getUserByName(username);
}

async function deleteUser(id) {
    const newDate = new Date();
    const editDate = format(newDate, 'yyyy-MM-dd HH:mm:ss');
    const deleteString = 'Account suspended.';
    const newUUID = uuidv4();

    const updateQuery = SQL`UPDATE users SET email = ${newUUID}, username = ${deleteString}, verified = false, bio = null, avatar = null, userSite = null, userTW = null, userIG = null, editDate = ${editDate} WHERE id = ${id}`;
    await database.pool.query(updateQuery);

    return getUserById(id);
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
    const query = SQL`SELECT child.text AS "comment",
    child.id,
    users.username AS "username",
    users.avatar AS "avatar",
    posts.title AS "postTitle",
    posts.id AS "postId",
    child.created_date AS "commentDate",
    child.parent_comment AS parentId,
    parent.userId AS parentUserId
    FROM comments AS parent
    INNER JOIN comments AS child
    ON child.parent_comment = parent.id
    INNER JOIN users ON child.userId = users.id
    INNER JOIN posts ON child.postId = posts.id
    WHERE child.parent_comment = parent.id
    AND parent.userId = ${id} AND child.userId != ${id}
    AND child.deleted = 0
    UNION
    SELECT comments.text,
    comments.id,
    users.username,
    users.avatar,
    posts.title,
    posts.id,
    comments.created_date,
    comments.parent_comment,
    NULL
    FROM comments
    INNER JOIN posts ON postId = posts.id
    INNER JOIN users ON users.id = comments.userId
    WHERE comments.userId != ${id} && posts.userId = ${id}
    AND comments.deleted = 0
    ORDER BY commentDate DESC`;

    const [comments] = await database.pool.query(query);

    return comments;
};

const likesUserReceived = async userId => {
    const query = SQL`SELECT count(likes.id) as totalLikes FROM likes INNER JOIN users ON likes.userId = users.id INNER JOIN posts ON posts.id = likes.postId WHERE posts.userId = ${userId}`;
    const [result] = await database.pool.query(query);

    return result[0].totalLikes;
};

module.exports = {
    getUserByName,
    getUserByEmail,
    getUserByUUID,
    getUserById,
    insertUser,
    updateUser,
    deleteUser,
    changePass,
    validateUser,
    getRecentActivity,
    likesUserReceived,
};
