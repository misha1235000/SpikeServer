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
            const createdClient = await ClientRepository.create(client);
            return res.json({ client: createdClient });
        }

        throw new Error("Creation Error.");
    }

    public static async find(req: Request, res: Response) {
    }

    public static async findByToken(req: Request, res: Response) {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).send({ auth: false, message: 'No token provided.' });
        }
        
        try {
            const jwtVerify: any = await jwt.verify(token, config.secret);
            const returnedClients: IClient[] | null = await ClientRepository.findByTeamId(jwtVerify.id);
            return res.status(200).send({auth: false, clients: returnedClients});
        } catch(err) {
            return res.status(500).send({ auth: false, message: err.message});
        }

        throw new Error("Find by Token Error.");
    }

    public static async update(req: Request, res: Response) {
        const id = req.params.id;
        const client = req.body as Partial<IClient>;

        if (Object.keys(client).length > 0 && id) {
            const updatedClient = await ClientRepository.update(id, client);

            if (!updatedClient) {
                throw new Error("Client to update not found.");
            }

            return res.json({ client: updatedClient });
        }

        throw new Error("Update client error.");
    }

    public static async delete(req: Request, res: Response) {
        const id = req.params.id;

        if (id) {
            const deletedClient = await ClientRepository.delete(id);

            if (!deletedClient) {
                throw new Error("Client to delete not found.");
            }

            return res.json(deletedClient);
        }

        throw new Error("Delete client error.");
    }
}