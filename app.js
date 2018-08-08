const express = require('express');
const app = express();
const db = require('./db');

const UserController = require('./user/UserController');
const AuthController = require('./auth/AuthController');

// Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

app.use('/users', UserController);
app.use('/api/auth', AuthController);

module.exports = app;