const { database } = require('../infrastructure');
const SQL = require('sql-template-strings');

async function updateAvatar(userId, imgUrl) {
    const updateQuery = SQL`UPDATE users SET avatar = ${imgUrl} WHERE id = ${userId}`;
    const [result] = await database.pool.query(updateQuery);

    const query = SQL`SELECT avatar FROM users WHERE id = ${userId}`;
    const [images] = await database.pool.query(query);

    return images[0].avatar;
}

module.exports = {
    updateAvatar,
};
