// client.controller

import { Request, Response } from 'express';
import { Unauthorized, InvalidToken } from '../auth/auth.error';
import { ClientRepository } from './client.repository';
import { IClient } from './client.interface';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { InvalidParameter, NotFound } from '../utils/error';
import { InvalidClientId } from './client.error';
import { MongoError } from 'mongodb';

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
        const token = req.headers['authorization'];

        if (!token) {
            throw new Unauthorized('Unauthorized, No token provided.');
        }

        try {
            // Checks if a token is valid, and uses the decoded token to
            // find the team by the ID of the decoded token.
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamId(jwtVerify.id);

            if (!returnedClients) {
                throw new InvalidToken('Invalid token, unexisiting clients provided.');
            }

            return res.status(200).send(returnedClients);
        } catch (err) {
            if (err instanceof MongoError) {
                throw err;
            }

            throw new InvalidToken('Invalid token provided.');
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
