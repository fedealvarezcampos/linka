const Joi = require("joi");

const { commentsRepository, usersRepository } = require("../repos");

async function getComments(req, res, next) {
  try {
    const { id: postId } = req.params;
    const schema = Joi.number().positive().required();
    await schema.validateAsync(postId);

    const comments = await commentsRepository.getComments(postId);

    res.send(comments);
  } catch (err) {
    next(err);
  }
}

async function postComment(req, res, next) {
  try {
    const { text } = req.body;
    const { id: postId } = req.params;
    const { id } = req.auth;

    const schema = Joi.string().min(5).max(500).required();
    await schema.validateAsync(text);

    const user = await usersRepository.getUserById(id);

    if (!user) {
      const error = new Error(`User doesn't exist.`);
      error.code = 401;

      throw error;
    }

    const comment = await commentsRepository.insertComment({
      text,
      id,
      postId,
    });

    res.send(comment);
  } catch (err) {
    next(err);
  }
}

async function eraseComment(req, res, next) {
  try {
    const { id: postId, id_comment: commentId } = req.params;
    const { id: userId } = req.auth;

    const schema = Joi.number().positive().required();
    await schema.validateAsync(postId, commentId);

    const user = await usersRepository.getUserById(userId);

    if (!user) {
      const error = new Error(`User doesn't exist.`);
      error.code = 401;

      throw error;
    }

    const comment = await commentsRepository.eraseComment(commentId);

    res.send(comment);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getComments,
  postComment,
  eraseComment,
};
