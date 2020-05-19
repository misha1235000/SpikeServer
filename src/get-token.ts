const getTokenCreator = require('spike-get-token');
import * as axios from 'axios';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PUBLIC_KEY_PATH = join(__dirname, 'certs/files/publickeyofclient.pem');

async function readAndWrite() {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const read = await axios.default.get(`${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}/.well-known/publickey.pem`, { httpsAgent: agent });
    writeFileSync(PUBLIC_KEY_PATH, read.data);
}

const options = {
    redisHost: `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`,
    ClientId: process.env.CLIENT_ID,
    ClientSecret: process.env.CLIENT_SECRET,
    spikeURL: `${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}/oauth2/token`,
    tokenGrantType: process.env.TOKEN_GRANT_TYPE || 'client_credentials',
    tokenAudience: process.env.TOKEN_AUDIENCE || 'kartoffel',
    spikePublicKeyFullPath: PUBLIC_KEY_PATH,
    useRedis: true,
    httpsValidation: false,
};

readAndWrite();
export const getToken = getTokenCreator(options);
