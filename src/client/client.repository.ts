// client.repository

import { ClientModel } from './client.model';
import { IClient } from './client.interface';
import { DocumentQuery } from 'mongoose';
import { DuplicateUnique } from '../utils/error';

export class ClientRepository {

    /**
     * Finds a client by ID
     * @param clientId - ID of a specific client.
     */
    public static findById(clientId: string): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findOne({ clientId });
    }

    /**
     * Finds all the clients of a specified team.
     * @param teamId - The id of a specific team.
     */
    public static findByTeamId(teamId: string): DocumentQuery<IClient[] | null, IClient> {
        return ClientModel.find({ teamId });
    }

    /**
     * Creates a new client.
     * @param client - The client to create
     */
    public static async create(client: IClient): Promise<IClient> {
        console.log(client);
        try {
            const createdClient = await ClientModel.create(client);
            return createdClient;
        } catch (error) {
            if (error.code && error.code === 11000) {
                throw new DuplicateUnique('client uniques already exists.');
            } else {
                throw error;
            }
        }
    }

    /**
     * Updates an old client with a new given one.
     * @param clientId - The id of the client to find.
     * @param client - The new client that needs to be replaced with the old one.
     */
    public static update(clientId: string, client: Partial<IClient>): DocumentQuery<IClient | null, IClient> {
  //      const updateHostUris = client.hostUris;
  //      const newClient = client;
  //      delete newClient['hostUris'];
/*
        return ClientModel.findOneAndUpdate(
            { clientId },
            { ...newClient, $addToSet: { hostUris: updateHostUris } },
            { new: true, runValidators: true },
        );*/

        return ClientModel.findOneAndUpdate({ clientId }, client, { new: true, runValidators: true });
    }

    /**
     * Deletes a client by a specific ID.
     * @param clientId - The ID of the client that needs to be removed.
     */
    public static delete(clientId: string): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findOneAndRemove({ clientId });
    }
}
