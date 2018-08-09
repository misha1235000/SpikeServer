import * as express from 'express';
import * as bodyParser from 'body-parser';
import { db } from './db';

const app = express();

import { UserRouter } from './user/user.router';
import { AuthController } from './auth/auth.controller';

// Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/user', new UserRouter().router);
app.use('/api/auth', AuthController);

export const App = app;