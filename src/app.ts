import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

const app = express();

import { UserRouter } from './user/user.router';
import { AuthRouter } from './auth/auth.router';

// Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

mongoose.connect('mongodb://testuser:Test123@ds227171.mlab.com:27171/testjwt').then(() => {
    console.log('Connected to mongo');
}).catch(() => {
    console.log('error connecting to mongo');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/user', new UserRouter().router);
app.use('/api/auth', new AuthRouter().router);

export const App = app;
