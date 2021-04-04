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
import { PersonRouter } from './person/person.router';
import { errorHandler } from './utils/error.handler';
import { config } from './config';
import { configurePassport } from './passport';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { TeamRepository } from './team/team.repository';
import { ScopeRouter } from './scope/scope.router';
import { LOG_LEVEL, log, parseLogData } from './utils/logger';

const app = express();

// Axios global configuration
axios.defaults.baseURL = config.axios.baseURL;

// TODO: Change that on production to validate https certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

configurePassport();
app.use(express.json());
app.use(express.urlencoded({
    extended: false,
}));
app.use(cookieParser());

app.use(session({
    secret: 'secretcode',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check for Load Balancer
app.get('/health', (req, res) => res.status(200).send('alive'));

/* GET home page. */
app.get('/auth/', passport.authenticate('shraga'), (req, res, next) => {
    res.status(200); // .json(req.user);
});

/* GET home page. */
app.post('/auth/callback', passport.authenticate('shraga'), (req, res, next) => {
// res.send(req.user);
    res.redirect('/');
});

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

const connect = () => {
    const options = {
                      autoReconnect: true,
                      useNewUrlParser: true,
                      reconnectTries: Number.MAX_VALUE,
                      reconnectInterval: 60 * 1000,
                      connectTimeoutMS: 10 * 1000,
                      useCreateIndex: true,
                    };
    mongoose.connect(config.prodDatabaseUrl, options).catch((err) => {
        console.log(err);
    });
}

connect();

mongoose.connection.on('connected', () => {
    console.log('Connected to mongo');

    log(
        LOG_LEVEL.INFO,
        parseLogData(
          'MongoDB Connection Established',
          `MongoDB connection established`,
          '',
          '',
        ),
    );
});

mongoose.connection.on('error', (err) => {
    log(
        LOG_LEVEL.ERROR,
        parseLogData(
            err.name || 'Error MongoDB Connection',
            `Error connecting to mongo server, received: ${err.message || err}`,
            '',
            err.stack,
        ),
    );

    console.error('Error Connecting to mongo.');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Connection Disconnected!');

    log(
        LOG_LEVEL.ERROR,
        parseLogData(
          'MongoDB Connection Disconnected',
          `MongoDB connection Disconnected - received: Connection Destroyed`,
          '',
           '',
        ),
    );

    connect();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check for Load Balancer
app.get('/health', (req, res) => res.send('alive'));

app.use(Wrapper.wrapAsync(AuthController.authorize)); // The authorize middleware.
app.use('/api/auth', new AuthRouter().router);
app.use('/api/client', new ClientRouter().router);
app.use('/api/team', new TeamRouter().router);
app.use('/api/person', new PersonRouter().router);
app.use('/api/scope', new ScopeRouter().router);

// Error handler
app.use(errorHandler);

export const App = app;
