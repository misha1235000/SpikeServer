// app

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

const app = express();

import { TeamRouter } from './team/team.router';
import { AuthRouter } from './auth/auth.router';
import { errorHandler } from './utils/error.handler';
import { AuthController } from './auth/auth.controller';

// Error handler
app.use(errorHandler);

// Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// The connection to the mongodb.
mongoose.connect('mongodb://devdb:Aa123456@ds125472.mlab.com:25472/teamdb').then(() => {
    console.log('Connected to mongo');
}).catch((error) => {
    console.log('error connecting to mongo');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', new AuthRouter().router);

app.use(AuthController.authorize);

app.use('/api/team', new TeamRouter().router);

export const App = app;
