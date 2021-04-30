const SQL = require('sql-template-strings');
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
    const query = SQL`INSERT INTO users (username, email, password) VALUES (${data.username}, ${data.email}, ${data.password})`;
    await database.pool.query(query);

    return getUserByEmail(data.email);
};

module.exports = {
    getUserByName,
    getUserByEmail,
    insertUser,
};
