// config
import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    // Database URLs
    prodDatabaseUrl: `mongodb://${process.env.DB_PROD_USER}:${process.env.DB_PROD_PASS}@ds125472.mlab.com:25472/${process.env.DB_PROD_NAME}`,
    testDatabaseUrl: `mongodb://${process.env.DB_TEST_USER}:${process.env.DB_TEST_PASS}@ds123584.mlab.com:23584/${process.env.DB_TEST_NAME}`,

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
        audience: `${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}`,    // Mention the audience of the access token (authorization server)
    },

    // Authorization server endpoints configurations
    authorizationServerAPI: 'oauth2/register',

    // Axios global configuration
    axios: {
        baseURL: `${process.env.OAUTH_URL}:${process.env.OAUTH_PORT}`,
    },

    secret: process.env.OAUTH_SECRET,
};
