// const path = require('path');
// const fs = require('fs');

require('dotenv').config();

const express = require('express');

const { usersController, commentsController } = require('./controllers');

const { validateAuth } = require('./middlewares');

const { PORT } = process.env;

const app = express();
app.use(express.json());

// TODO Endpoints / Rutas

// * USERS

app.post('/api/users', usersController.registerUser);
app.post('/api/users/login', usersController.loginUser);
app.post('/api/users/recoverpass', usersController.recoverPass);
app.get('/api/users/:username', usersController.getUserByName);
app.get('/api/users/validate/:UUID', usersController.validateUser);
app.get('/api/users/recover/:UUID', usersController.recoverPassGetter);
app.put('/api/users/:username', validateAuth, usersController.updateUser);

// * POSTS

// * COMMENTS

app.get('/api/posts/:id/comments', commentsController.getComments);
app.post('/api/posts/:id/comments', validateAuth, commentsController.postComment);
app.delete('/api/posts/:id/comments/:id_comment', validateAuth, commentsController.eraseComment);

// prettier-ignore
app.use(async (err, req, res, next) => {
    const status = err.isJoi ? 400 : (err.code || 500);
    res.status(status);
    res.send({ resultado: 'ERROR', error: err.message });
});

app.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT}`));
