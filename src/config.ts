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
    authorizationServerAPI: {
        register: 'URL_TO_REGISTER_ENDPOINT',
        read: 'URL_TO_READ_ENDPOINT',
        update: 'URL_TO_UPDATE_ENDPOINT',
        delete: 'URL_TO_DELETE_ENDPOINT',
    },

    // Axios global configuration
    axios: {
        baseURL: 'URL_TO_AUTHORIZATION_SERVER',
    },

    secret: 'secretcode',
};
