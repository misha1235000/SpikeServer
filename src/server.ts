// server

import * as https from 'https';
import { readFileSync } from 'fs';
import { App } from './app';
import { config } from './config';

const port = process.env.SERVER_PORT || 3000;

const options = {
    key: readFileSync(config.privateKeyPath),
    cert: readFileSync(config.certificatePath),
};

const server = https.createServer(options, App).listen(port, () => {
    console.log('Spike Server listening on port ' + port + ' via HTTPS');
});

export const Server = server;
