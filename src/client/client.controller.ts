// client.controller

import { Request, Response } from 'express';
import { OAuth2Controller } from '../oauth2/oauth2.controller';
import { IClientBasicInformation, IClientInformation } from '../oauth2/oauth2.parser';
import { ClientRepository } from './client.repository';
import { IClient } from './client.interface';
import { InvalidParameter, NotFound } from '../utils/error';

export class ClientController {

    /**
     * Creates a new client.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {

        // Gets the client information required for register client in authorization server
        const clientInformation = req.body.clientInformation as IClientBasicInformation;
        const teamId = req.teamId;

        if (clientInformation && teamId) {
            return res.status(200).send(await OAuth2Controller.registerClient(clientInformation, teamId));
        }

        throw new InvalidParameter('Client information or team id parameter is missing.');
    }

    /**
     * Reads client's full information from the authorization server.
     * @param req - Request
     * @param res - Response
     */
    public static async read(req: Request, res: Response) {

        // Gets the client's id to read
        const clientId = req.params.clientId;
        const teamId = req.teamId;

        if (clientId && teamId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc || clientDoc.teamId !== teamId) {
                throw new InvalidParameter('Client id or team id parameter is invalid');
            }

            return res.status(200).send(await OAuth2Controller.readClientInformation(clientId, clientDoc.token));
        }

        throw new InvalidParameter('Client id or team id parameter is missing.');
    }

    /**
     * Find all clients of a specified team id.
     * @param req - Request
     * @param res - Response
     */

    public static async findByToken(req: Request, res: Response) {
        const id = req.teamId;

        if (id) {
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamId(id);

            if (!returnedClients) {
                throw new NotFound('Clients not found.');
            }

            return res.status(200).send(returnedClients);
        }

        throw new InvalidParameter('id parameter is missing.');
    }

    /**
     * Updates an old client with a new one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {

        // Gets the client information required for register client in authorization server
        const clientInformation = req.body.clientInformation as Partial<IClientBasicInformation>;
        const clientId = req.params.clientId;
        const teamId = req.teamId;

        if (Object.keys(clientInformation).length > 0 && clientId && teamId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc || clientDoc.teamId !== teamId) {
                throw new InvalidParameter('Client id or team id parameter is invalid');
            }

            const updatedClient = await OAuth2Controller.updateClientInformation(clientId,
                                                                                 clientInformation,
                                                                                 clientDoc.token);
            return res.status(200).send(updatedClient);
        }

        throw new InvalidParameter('Client information or client id or team id is missing.');
    }

    /**
     * Deletes a client by a specified id.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const clientId = req.params.clientId;
        const teamId = req.teamId;

        if (clientId && teamId) {

            // Getting the client registration token associated to the client
            const clientDoc = await ClientRepository.findById(clientId);

            // Checks if the client is unexist or client not associated to the team
            // (we do that to avoid exposing our db to user who performs information gathering attacks)
            if (!clientDoc || clientDoc.teamId !== teamId) {
                throw new InvalidParameter('Client id or team id parameter is invalid');
            }

            await OAuth2Controller.deleteClient(clientId, clientDoc.token);

            return res.sendStatus(204);
        }

        throw new InvalidParameter('Client id or team id is missing.');
    }
}
