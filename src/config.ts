// config

export const config = {

    // Client Credentials flow configuration for OAuth2
    clientCredentials: {
        client: {
            id: '123456',
            secret: '123456',
        },
        auth: {
            tokenHost: 'https://localhost:1337',
            tokenPath: '/oauth2/token',
        },
    },

    // Token configuration used for OAuth2 Client Credentials flow
    tokenConfig: {
        scope: 'client_manager_special_scope', // Should include the special scope for register and
                                               // Manage other clients.
        audience: 'https://localhost:1337',    // Mention the audience of the access token (authorization server)
    },

    // Authorization server endpoints configurations
    authorizationServerAPI: 'oauth2/register',

    // Axios global configuration
    axios: {
        baseURL: 'https://localhost:1337',
    },

    secret: 'secretcode',
};
