// client.controller

import { Request, Response } from 'express';
import { ClientRepository } from './client.repository';
import { IClient } from './client.interface';
import { InvalidParameter, NotFound } from '../utils/error';
import { InvalidClientId } from './client.error';

export class ClientController {
    /**
     * Creates a new client.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {
        const client = req.body as IClient;

        if (client) {
            const createdClient = await ClientRepository.create(client);

            return res.json({ client: createdClient });
        }

        throw new InvalidParameter('client parameter is missing.');
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
        const client = req.body as Partial<IClient>;

        if (Object.keys(client).length > 0 && client.id) {
            const updatedClient = await ClientRepository.update(client.id, client);

            if (!updatedClient) {
                throw new NotFound('Client not found.');
            }

            return res.json({ client: updatedClient });
        }

        throw new InvalidClientId('Client id not provided.');
    }

    /**
     * Deletes a client by a specified id.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        const deletedClient = await ClientRepository.delete(id);

        if (!deletedClient) {
            throw new NotFound('Client not found.');
        }

        return res.json(deletedClient);
    }
}
