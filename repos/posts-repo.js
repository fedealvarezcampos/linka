const SQL = require("sql-template-strings");
const { database } = require("../infrastructure");

const insertPost = async ({ link, userId, title, description }) => {
  //creo la query
  const query = SQL`
    INSERT INTO posts(userId, title, description, link, created_date)
    VALUES(${userId}, ${title}, ${description}, ${link}, ${new Date()});
  `;

  //Ejecuto la query
  const [result] = await database.pool.query(query);

  //Devuelvo información del resultado
  return result;
};

const deletePost = async (id) => {
  const query = SQL`DELETE FROM posts WHERE id = ${id}`;

  const [result] = await database.pool.query(query);

  return result;
};

module.exports = {
  insertPost,
  deletePost,
};
