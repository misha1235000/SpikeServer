// app

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import axios from 'axios';
import { Wrapper } from './utils/wrapper';
import { AuthController } from './auth/auth.controller';
import { TeamRouter } from './team/team.router';
import { AuthRouter } from './auth/auth.router';
import { ClientRouter } from './client/client.router';
import { errorHandler } from './utils/error.handler';
import { config } from './config';

const app = express();

// Axios global configuration
axios.defaults.baseURL = config.axios.baseURL;

// TODO: Change that on production to validate https certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// CORS
const options:cors.CorsOptions = {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'authorization'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: '*',
    preflightContinue: false,
};

app.use(cors(options));
app.options('*', cors(options));

// The connection to the mongodb.
mongoose.connect('mongodb://devdb:Aa123456@ds125472.mlab.com:25472/teamdb').then(() => {
    console.log('Connected to mongo');
}).catch((error) => {
    console.log('Error connecting to mongo');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', new AuthRouter().router);
app.use(Wrapper.wrapAsync(AuthController.authorize)); // The authorize middleware.
app.use('/api/client', new ClientRouter().router);
app.use('/api/team', new TeamRouter().router);

// Error handler
app.use(errorHandler);

export const App = app;
