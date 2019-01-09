// oauth2.controller

import axios from 'axios';
import { create, AccessToken } from 'simple-oauth2';
import { config } from '../config';
import { OAuth2Parser, IClientInformation, IClientBasicInformation } from './oauth2.parser';
import { ClientRepository } from '../client/client.repository';
import { NotFound, InvalidParameter } from '../utils/error';
import { InvalidClientInformation } from './oauth2.error';

// TODO: Need to add the server token somehow in the authroization server api requests

export class OAuth2Controller {

    // OAuth2 configured root flow with Client Credentials options
    static oauth2Flow = create(config.clientCredentials as any);

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
                    return OAuth2Controller.accessToken.token.access_token;
                }
            }

            // All other cases require creating new access token
            const result = await OAuth2Controller.clientCredentialsFlow();
            OAuth2Controller.accessToken = OAuth2Controller.oauth2Flow.accessToken.create(result);
            return OAuth2Controller.accessToken.token.access_token;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Register client in the authorization server
     *
     * @param clientInformation - Client information to register
     */
    static async registerClient(clientInformation: IClientBasicInformation, teamId: string) {
        // Register the client in the authorization server
        const response = await axios.post(
            config.authorizationServerAPI,
            { clientInformation },
            { headers: { 'Authorization-Registrer': await OAuth2Controller.getToken() } },
        );

        // Client registers successfully
        if (response.status === 201) {

            const createdClient = await ClientRepository.create({
                teamId,
                ...OAuth2Parser.parseClientInfoToModel(response.data),
            });

        }

        return OAuth2Parser.parseResponse(response);
    }

    /**
     * Reads client information from authorization server
     *
     * @param clientId - Client id of the client to read
     * @param clientToken - Client token for managing the client
     */
    static async readClientInformation(clientId: string, clientToken: string) {

        // Read client information from authorization server
        const response = await axios.get(
            `${config.authorizationServerAPI}/${clientId}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response);
    }

    /**
     * Updates client information in authorization server
     * @param clientId - Client id of the client to update
     * @param clientInformation - Client information to update
     * @param clientToken - Client token for managing the client
     */
    static async updateClientInformation(clientId: string,
                                         clientInformation: Partial<IClientBasicInformation>,
                                         clientToken: string) {

        // Checks if included client id
        if (clientId) {

            const response = await axios.put(
                `${config.authorizationServerAPI}/${clientId}`,
                { clientInformation },
                {
                    headers: {
                        'Authorization-Registrer': await OAuth2Controller.getToken(),
                        Authorization: clientToken,
                    },
                },
            );

            // Update the client metadata in client model
            const updatedClient =
                await ClientRepository.update(clientId, OAuth2Parser.parseClientInfoToModel(clientInformation));
            if (!updatedClient) {
                throw new NotFound('Client not exists.');
            }

            return OAuth2Parser.parseResponse(response);
        }

        throw new InvalidClientInformation('Client id parameter is missing');
    }

    /**
     * Deletes client from the authorization server
     * @param clientId - Client id of the client to delete
     * @param clientToken - Client token for managing the client
     * @returns Boolean indicates if the client deleted otherwise throws error
     */
    static async deleteClient(clientId: string, clientToken: string) {

        // Need to first delete the client from the db
        const deletedClient = await ClientRepository.delete(clientId);
        if (!deletedClient) {
            throw new NotFound('Client is not exists.');
        }

        // Delete from authorization server
        const response = await axios.delete(
            `${config.authorizationServerAPI}/${clientId}`,
            {
                headers: {
                    'Authorization-Registrer': await OAuth2Controller.getToken(),
                    Authorization: clientToken,
                },
            },
        );

        return OAuth2Parser.parseResponse(response);
    }
}
