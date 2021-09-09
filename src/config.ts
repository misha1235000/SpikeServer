// config
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config();

export const config = {
    // Database URLs
    prodDatabaseUrl: `mongodb${process.env.DB_SRV || ''}://${process.env.DB_PROD_USER}:${process.env.DB_PROD_PASS}@${process.env.DB_PROD_HOST}/${process.env.DB_PROD_NAME}${process.env.DB_PROD_TYPE || ''}`,
    testDatabaseUrl: `mongodb${process.env.DB_SRV || ''}://${process.env.DB_TEST_USER}:${process.env.DB_TEST_PASS}@${process.env.DB_TEST_HOST}/${process.env.DB_TEST_NAME}${process.env.DB_TEST_TYPE || ''}`,

    // Client Credentials flow configuration for OAuth2
    clientCredentials: {
        client: {
            
            id: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
        },
        auth: {
            tokenHost: `${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}`,
            tokenPath: '/oauth2/token',
        },
    },

    // Token configuration used for OAuth2 Client Credentials flow
    tokenConfig: {
        scope: 'client_manager_special_scope', // Should include the special scope for register and
                                               // Manage other clients.
        audience: `ospike`,    // Mention the audience of the access token (authorization server)
    },

    // Authorization server endpoints configurations
    OAUTH_MANAGEMENT_ENDPOINT: 'oauth2/management',
    OAUTH_CLIENT_MANAGEMENT_ENDPOINT: 'client',
    OAUTH_CLIENT_MANAGEMENT_ACTIVE_TOKENS_ENDPOINT: 'tokens',
    OAUTH_SCOPE_MANAGEMENT_ENDPOINT: 'scope',

    // Axios global configuration
    axios: {
        baseURL: `${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}`,
    },

    secret: process.env.OAUTH_SECRET,

    // HTTPS Configurations
    privateKeyPath: join(__dirname, 'certs/files/privatekey.pem'),
    certificatePath: join(__dirname, 'certs/files/certificate.pem'),
};