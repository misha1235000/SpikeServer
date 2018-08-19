// client.controller

import { Request, Response } from 'express';
import { ClientValidator } from './client.validator';
import { ClientRepository } from './client.repository';
import { IClient } from './client.interface';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export class ClientController {
    /**
     * Creates a new client.
     * @param req - Request
     * @param res - Response
     */
    public static async create(req: Request, res: Response) {
        const client = req.body as IClient;

        try {
            const createdClient = await ClientRepository.create(client);
            return res.json({ client: createdClient });
        } catch (err) {
            return res.json({ error: err });
        }
    }

    /**
     * Find all clients of a specified team id.
     * @param req - Request
     * @param res - Response
     */
    public static async findByToken(req: Request, res: Response) {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(401).send({ error: 'No token provided.' });
        }

        try {
            // Checks if a token is valid, and uses the decoded token to
            // find the team by the ID of the decoded token.
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamId(jwtVerify.id);

            return res.status(200).send(returnedClients);
        } catch (err) {
            return res.status(500).send({ error: err });
        }
    }

    /**
     * Updates an old client with a new one.
     * @param req - Request
     * @param res - Response
     */
    public static async update(req: Request, res: Response) {
        const client = req.body as Partial<IClient>;

        if (Object.keys(client).length > 0 && client.id) {
            try {
                const updatedClient = await ClientRepository.update(client.id, client);

                if (!updatedClient) {
                    res.status(404).send({ error: 'Client Not Found' });
                }

                return res.json({ client: updatedClient });
            } catch (err) {
                return res.json({ error: err });
            }
        }

        return res.json({ error: 'Update Client Error' });
    }

    /**
     * Deletes a client by a specified id.
     * @param req - Request
     * @param res - Response
     */
    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const deletedClient = await ClientRepository.delete(id);

                if (!deletedClient) {
                    res.status(404).send({ error: 'Client Not Found' });
                }

                return res.json(deletedClient);
            } catch (err) {
                return res.json({ error: err });
            }
        }

        return res.json({ error: 'Delete Client Error' });
    }
}
