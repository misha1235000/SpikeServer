// config

export const config = {

    // Client Credentials flow configuration for OAuth2
    clientCredentials: {
        client: {
            id: 'CLIENT_ID',
            secret: 'CLIENT_SECRET',
        },
        auth: {
            tokenHost: 'URL_TO_TOKEN_ENDPOINT',
        },
    },

    // Token configuration used for OAuth2 Client Credentials flow
    tokenConfig: {
        scope: 'SCOPE_FOR_CLIENT_CREDENTIALS', // Should include the special scope for register and
                                               // Manage other clients.
    },

    // Authorization server endpoints configurations
    authorizationServerAPI: 'register',

    // Axios global configuration
    axios: {
        baseURL: 'https://localhost:3000',
    },

    secret: 'secretcode',
};
