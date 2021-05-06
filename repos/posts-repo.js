const SQL = require("sql-template-strings");
const { database } = require("../infrastructure");

const insertPost = async ({ link, userId, title, description }) => {
  //creo la query
  const query = SQL`
    INSERT INTO posts(userId, title, description, link, created_date)
    VALUES(${link}, ${userId}, ${title}, ${description}, ${new Date()});
  `;

  //Ejecuto la query
  const [result] = await database.pool.query(query);

  //Devuelvo información del resultado
  return result;
};

module.exports = {
  insertPost,
};
