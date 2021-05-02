const SQL = require('sql-template-strings');
const { format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const { database } = require('../infrastructure');

const getUserByName = async username => {
    const query = SQL`SELECT * FROM users WHERE username = ${username}`;
    const [users] = await database.pool.query(query);

    return users[0];
};

const getUserByEmail = async email => {
    const query = SQL`SELECT * FROM users WHERE email = ${email}`;
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
    const [rows] = await database.pool.query(updateQuery);

    return getUserByName(username);
}

module.exports = {
    getUserByName,
    getUserByEmail,
    insertUser,
    updateUser,
};
