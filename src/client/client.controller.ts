import { Request, Response } from 'express';
import { ClientValidator } from './client.validator';
import { ClientRepository } from './client.repository';
import { IClient } from './client.interface';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export class ClientController {
    public static async create(req: Request, res: Response) {
        const client = req.body as IClient;

        if (ClientValidator.isValid(client)) {
            try {
                const createdClient = await ClientRepository.create(client);
                return res.json({ client: createdClient });
            } catch (err) {
                return res.json({ error: err });
            }
        }

        return res.json({ error: 'Error creating the client.' });
    }

    public static async findByToken(req: Request, res: Response) {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).send({ error: 'No token provided.' });
        }
        
        try {
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamId(jwtVerify.id);
            return res.status(200).send(returnedClients);
        } catch(err) {
            return res.status(500).send({error: err});
        }
    }

    public static async update(req: Request, res: Response) {
        const client = req.body as Partial<IClient>;

        if (Object.keys(client).length > 0 && client.id) {
            try {
                const updatedClient = await ClientRepository.update(client.id, client);

                if (!updatedClient) {
                    res.status(404).send({error: 'Client Not Found'});
                }

                return res.json({ client: updatedClient });
            } catch (err) {
                return res.json({ error: err });
            }
        }

        return res.json({ error: 'Update Client Error' });
    }

    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            try {
                const deletedClient = await ClientRepository.delete(id);

                if (!deletedClient) {
                    res.status(404).send({ error: 'Client Not Found' });
                }

                return res.json(deletedClient);
            } catch(err) {
                return res.json({ error: err });
            }
        }

        return res.json({ error: 'Delete Client Error' });
    }
}
