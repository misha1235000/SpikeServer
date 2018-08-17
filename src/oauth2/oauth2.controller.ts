import { create, AccessToken } from 'simple-oauth2';
import { config } from '../config';

export class OAuth2Controller {

    // OAuth2 configured root flow with Client Credentials options
    static oauth2Flow = create(config.clientCredentials);

    // Client Credentials flow shirnked to easy callable function which returns access token which
    // Should be wrapped via accessToken.create for parsing the response from the authorization server
    static clientCredentialsFlow =
        OAuth2Controller.oauth2Flow.clientCredentials.getToken.bind({}, config.tokenConfig);

    // Contains the Access Token
    static accessToken: AccessToken | null  = null;

    /**
     * Returns the access token from the authorization server and save it in the controller
     */
    static async getToken() {
        try {
            // If there's already an access token, need to check it's validity
            if (OAuth2Controller.accessToken) {

                // Check if access token expired
                if (!OAuth2Controller.accessToken.expired()) {
                    return OAuth2Controller.accessToken.token;
                }
            }

            // All other cases require creating new access token
            const result = await OAuth2Controller.clientCredentialsFlow();
            OAuth2Controller.accessToken = OAuth2Controller.oauth2Flow.accessToken.create(result);
            return OAuth2Controller.accessToken.token;
        } catch (err) {
            throw err;
        }
    }
}
