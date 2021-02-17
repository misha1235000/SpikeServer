// client.repository

import { ClientModel } from './client.model';
import { IClient } from './client.interface';
import { DocumentQuery, Types } from 'mongoose';
import { DuplicateUnique } from '../utils/error';

enum SortOptions {
    POPULARITY = 'popularity',
    NAME = 'name',
    DATE = 'date',
    USAGE = 'usage',
}

export class ClientRepository {

    public static readonly SortOptions = SortOptions;

    private static readonly defaultPopulation = { path: 'teamId', select: 'teamname' };
    private static readonly defaultSearchSelection = 'name description clientId';

    /**
     * Finds clients by pagination parameters.
     * @param limit - Number of clients to return in batch.
     * @param skip - Number of clients to skip.
     * @param sort - Field to sort by.
     * @param desc - Boolean which indicates the order of the sort, True for desc False for asc.
     * @param teams - Array of teams to search by usage of clients of the teams in other clients (By the scopes's permitted clients)
     */
    public static find(limit: number, skip: number, sort: SortOptions, desc: boolean, teams: any = []) {

        const aggregation = [
            {
                $sort: {
                    _id: -1,
                },
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
                    _id: 0.0,
                    name: 1.0,
                    description: 1.0,
                    audienceId: 1.0,
                    scopes: {
                        permittedClients: 1.0,
                        description: 1.0,
                        value: 1.0,
                        type: 1.0,
                    },
                    popularity: 1,
                    usage: 1,
                    team: {
                        teamname: 1.0,
                        desc: 1.0,
                        ownerId: 1.0,
                    },
                },
            },
        ];

        const orderDirection = desc ? -1 : 1;
        let sortAggregationIndexInsert = 0;
        let sortAggregationStages: any = [];

        switch (sort) {

        case SortOptions.POPULARITY:
            sortAggregationStages = [
                {
                    $addFields: {
                        popularity: {
                            $reduce: {
                                input: '$scopes',
                                initialValue: 0,
                                in: { $add: ['$$value', { $size: '$$this.permittedClients' }] },
                            },
                        },
                    },
                },
                {
                    $sort: {
                        popularity: orderDirection,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ];

            sortAggregationIndexInsert = 2;
            break;

        case SortOptions.USAGE:

            // Must remove first lookup because this lookup (that one below) operates faster.
            aggregation.splice(1, 1);

            sortAggregationStages = [
                {
                    $lookup: {
                        from : 'scopes',
                        let : {
                            audience : '$audienceId',
                        },
                        pipeline : [
                            {
                                $match : {
                                    $expr : {
                                        $eq : [
                                            '$audienceId',
                                            '$$audience',
                                        ],
                                    },
                                },
                            },
                            {
                                $lookup : {
                                    from : 'clients',
                                    let : {
                                        currPermittedClients : '$permittedClients',
                                    },
                                    pipeline : [
                                        {
                                            $match : {
                                                $expr : {
                                                    $and : [
                                                        {
                                                            $in : [
                                                                '$clientId',
                                                                '$$currPermittedClients',
                                                            ],
                                                        },
                                                        (teams && teams.length > 0 ?
                                                            {
                                                                $in : [
                                                                    '$teamId',
                                                                    teams,
                                                                ],
                                                            }
                                                            :
                                                            true
                                                        ),
                                                    ],
                                                },
                                            },
                                        },
                                    ],
                                    as : 'clients',
                                },
                            },
                        ],
                        as : 'scopes',
                    },
                },
                {
                    $addFields : {
                        usage : {
                            $reduce : {
                                input : '$scopes',
                                initialValue : 0.0,
                                in : {
                                    $add : [
                                        '$$value',
                                        {
                                            $size : '$$this.clients',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $sort: {
                        usage: orderDirection,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ];

            sortAggregationIndexInsert = 1;
            break;

        case SortOptions.NAME:
        case SortOptions.DATE:
        default:
            sortAggregationStages = [
                {
                    $sort: (sort === SortOptions.DATE ? { _id: orderDirection } : { name: orderDirection }),
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ];

            sortAggregationIndexInsert = 1;
            break;
        }

        // Insert the sort stages to the aggregation pipeline
        aggregation.splice(sortAggregationIndexInsert, 0, ...sortAggregationStages);

        return ClientModel.aggregate(aggregation);
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
                               selectFields: string = ClientRepository.defaultSearchSelection,
                               population: { path: string, select: string } | { path?: string, select?: string }[] = ClientRepository.defaultPopulation) {
        console.log('select fields: ', selectFields);
        console.log('population fields: ', population);
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
