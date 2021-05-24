require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const { validateAuth } = require('./middlewares');

const { usersController, commentsController, postsController } = require('./controllers');

const { PORT } = process.env;

const staticPath = path.resolve(__dirname, 'static');

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileupload());

app.use('/', express.static(staticPath));

// * USERS

app.post('/api/users', usersController.registerUser);
app.post('/api/users/login', usersController.loginUser);
app.post('/api/users/resend', usersController.resendValidation);
app.post('/api/users/recoverpass', usersController.recoverPass);
app.post('/api/users/changepass/:UUID', usersController.changePass);
app.get('/api/users/:username', usersController.getProfile);
app.get('/api/users/validate/:UUID', usersController.validateUser);
app.get('/api/users/:username/activity', validateAuth, usersController.getRecentActivity);
app.put('/api/users/:username', validateAuth, usersController.updateUser);
app.delete('/api/users/:username', validateAuth, usersController.deleteUser);

// * POSTS

app.get('/api/posts', postsController.sortPosts);
app.get('/api/posts/:id', validateAuth, postsController.getPost);
app.get('/api/search', validateAuth, postsController.searchPost);
app.post('/api/posts', validateAuth, postsController.createPost);
app.post('/api/posts/:id', validateAuth, postsController.likePost);
app.put('/api/posts/:id', validateAuth, postsController.editPost);
app.delete('/api/posts/delete/:id', validateAuth, postsController.deletePost);

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
