// client.repository

import { ClientModel } from './client.model';
import { IClient } from './client.interface';
import { DocumentQuery, Types } from 'mongoose';
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
     * Find clients by clients ids list
     * @param clientIds - Client ids of specific clients.
     */
    public static findByIds(clientIds: string[]) {
        return ClientModel.find({ clientId: { $in: clientIds } });
    }

    /**
     * Finds all the clients of a specified team.
     * @param teamId - The id of a specific team.
     */
    public static findByTeamId(teamId: string): DocumentQuery<IClient[] | null, IClient> {
        return ClientModel.find({ teamId });
    }

    public static findByTeamIds(teamIds: Types.ObjectId[]): DocumentQuery<IClient[] | null, IClient> {
        return ClientModel.find({
            teamId: { $in: teamIds },
        });
    }

    /**
     * Fuzzy searching clients by name.
     * @param clientName - Client name to search
     * @param selectFields - Selection fields to include/exclude from returning object (Like in mongoose queries)
     * @param population - Population field in object, which indicates which field to populate (Like in mongoose queries)
     */
    public static searchByName(clientName: string,
                               selectFields: string = 'name description',
                               population: { path: string, select: string } =  { path: 'teamId', select: 'teamname' }) {
        return (ClientModel as any).fuzzySearch(clientName).select(selectFields).populate(population);
    }

    /**
     * Creates a new client.
     * @param client - The client to create
     */
    public static async create(client: IClient): Promise<IClient> {
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
