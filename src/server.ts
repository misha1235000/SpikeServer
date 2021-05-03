// server

import * as apm from 'elastic-apm-node';

// Handler for all uncaught errros happend
process.on('uncaughtException' as any, (error: any, origin: any) => {
    console.log(`Uncaught Exception catched (Origin = ${origin}):`);
    console.log(error);
})

// Must run that at first for configuration
apm.start({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || '',
    active: process.env.ELASTIC_APM_ACTIVE === 'true' || false,
});

// Handle uncaught exceptions with apm
apm.handleUncaughtExceptions((error: any) => {
    console.log('Error caught with apm transport:');
    console.log(error);
  });

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
    console.log(`Spike Server listening on port ${port} via HTTPS`);
});

export const Server = server;
