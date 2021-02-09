// client.repository

import { ClientModel } from './client.model';
import { IClient } from './client.interface';
import { DocumentQuery, Types } from 'mongoose';
import { DuplicateUnique } from '../utils/error';

export class ClientRepository {

    private static readonly defaultPopulation = { path: 'teamId',  select: 'teamname' };

    /**
     * Finds clients by pagination parameters.
     * @param limit - Number of clients to return in batch.
     * @param skip - Number of clients to skip.
     * @param sort - Field to sort by.
     * @param desc - Boolean which indicates the order of the sort, True for desc False for asc.
     */
    public static find(limit: number, skip: number, sort: string, desc: boolean) {

        // Ensure the sort field is exists.
        const sortFields = ['name', 'audienceId', 'description'];
        const sortField = sortFields.indexOf(sort) !== -1 ? sort: sortFields[0];

        return ClientModel.aggregate([
            {
                $sort: {
                    [sortField]: desc ? -1 : 1,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            { 
                $lookup: {
                    from: 'scopes',
                    localField: 'audienceId', 
                    foreignField: 'audienceId', 
                    as: 'scopes',
                },
            }, 
            { 
                $lookup: {
                    from: 'teams', 
                    localField: 'teamId', 
                    foreignField: '_id', 
                    as: 'team',
                },
            }, 
            { 
                $unwind: {
                    path: '$team',
                },
            }, 
            { 
                $project: {
                    name: 1.0, 
                    description: 1.0, 
                    audienceId: 1.0, 
                    scopes: {
                        permittedClients: 1.0, 
                        description: 1.0,
                        value: 1.0,
                        type: 1.0,
                    }, 
                    team : {
                        teamname: 1.0, 
                        desc: 1.0, 
                        ownerId: 1.0,
                    },
                },
            },
        ]);
    }

    /**
     * Finds a client by ID
     * @param clientId - ID of a specific client.
     */
    public static findById(clientId: string): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findOne({ clientId });
    }

    /**
     * Finds a client by Audience ID
     * @param audienceId - Audience id of the specific client.
     */
    public static findByAudienceId(audienceId: string) {
        return ClientModel.findOne({ audienceId });
    }

    /**
     * Find clients by clients ids list
     * @param clientIds - Client ids of specific clients.
     */
    public static findByIds(clientIds: string[], population: any = ClientRepository.defaultPopulation) {
        return ClientModel.find({ clientId: { $in: clientIds } }).populate(population);
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
                               selectFields: string = 'name description clientId',
                               population: { path: string, select: string } =  ClientRepository.defaultPopulation) {
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
