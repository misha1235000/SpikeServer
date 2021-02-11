// scope.repository

import ScopeModel from './scope.model';
import { IScope } from './scope.interface';

enum SortOptions {
    POPULARITY = 'popularity',
    NAME = 'name',
    DATE = 'date',
    USAGE = 'usage',
}

export class ScopeRepository {

    public static readonly SortOptions = SortOptions;

    private static readonly defaultPopulation = { path: 'client', select: 'clientId name description', populate: { path: 'teamId',  select: 'teamname' } };
    private static readonly defaultPopulationExtended = { path: 'permittedClientsDetails', select: 'clientId name description', populate: { path: 'teamId', select: 'teamname' } };

    // /**
    //  * Find all scopes belonging to the clients ids provided.
    //  * @param clientIds - Arrays of client ids
    //  * @param population - (Optional) Population field to populate after query
    //  */
    // public static async findByClientIds(clientIds: string[], population: any = ScopeRepository.defaultPopulation) {
    //     return await ScopeModel.find({ clientId: { $in: clientIds } }).populate(population);
    // }

    /**
     * Get all permitted scopes for a given client.
     * @param clientId - ID of a specific client.
     */
    public static async findPermittedScopes(clientId: string, sort: SortOptions, desc: boolean) {

        const aggregation: any = [
            {
                $match: {
                    permittedClients: clientId,
                },
            },
            {
                $group: {
                    _id: '$audienceId',
                    scopes: {
                        $push: {
                            value: '$value',
                            type: '$type',
                            description: '$description',
                            permittedClients: '$permittedClients',
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'clients',
                    localField: '_id',
                    foreignField: 'audienceId',
                    as: 'client',
                },
            },
            {
                $unwind: {
                    path: '$client',
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: 'client.teamId',
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
                $sort: {
                    'client._id': -1,
                },
            },
            {
                $project: {
                    _id: 0.0,
                    name: '$client.name',
                    description: '$client.name',
                    audienceId: '$_id',
                    scopes: {
                        value: 1.0,
                        description: 1.0,
                        type: 1.0,
                    },
                    popularity: 1.0,
                    usage: 1.0,
                    team: {
                        teamname : 1.0,
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
                // {
                //     $skip: skip,
                // },
                // {
                //     $limit: limit,
                // },
            ];

            sortAggregationIndexInsert = aggregation.length - 2;
            break;

        case SortOptions.USAGE:

            // Must remove first lookup because this lookup (that one below) operates faster.
            aggregation.splice(0, 1);

            sortAggregationStages = [
                {
                    $addFields: {
                        usage: {
                            $reduce: {
                                input: '$scopes',
                                initialValue: 0,
                                in: {
                                    $add: [
                                        '$$value',
                                        {
                                            $cond: {
                                                if: { $in: [clientId, '$$this.permittedClients'] },
                                                then: 1,
                                                else: 0,
                                            },
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
                // {
                //     $skip: skip,
                // },
                // {
                //     $limit: limit,
                // },
            ];

            sortAggregationIndexInsert = aggregation.length - 2;
            break;

        case SortOptions.NAME:
        case SortOptions.DATE:
        default:
            sortAggregationStages = [
                {
                    $sort: (sort === SortOptions.DATE ? { 'client._id': orderDirection } : { 'client.name': orderDirection }),
                },
                // {
                //     $skip: skip,
                // },
                // {
                //     $limit: limit,
                // },
            ];

            sortAggregationIndexInsert = aggregation.length - 1;
            break;
        }

        // Insert the sort stages to the aggregation pipeline
        aggregation.splice(sortAggregationIndexInsert, 0, ...sortAggregationStages);

        return await ScopeModel.aggregate(aggregation);
    }

    /**
     * Find all scopes belonging to the audience ids provided.
     * @param clientIds - Arrays of audience ids
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByAudienceIds(audienceIds: string[], population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.find({ audienceId: { $in: audienceIds } }).populate(population).populate(ScopeRepository.defaultPopulationExtended);
    }

    /**
     * Find scope by id.
     * @param scopeId - ObjectID of the scope
     * @param population - (Optional) Population field to populate after query
     */
    public static async findById(scopeId: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.findOne({ _id: scopeId }).populate(population).populate(ScopeRepository.defaultPopulationExtended);
    }

    /**
     * @deprecated
     * Find scopes by client name of the scope owner.
     * @param clientName - Client name of the scope owner
     */
    public static async findByClientName(clientName: string) {
        return await ScopeModel.aggregate([
            {
                $lookup: {
                    from: 'clients',
                    localField: 'audienceId',
                    foreignField: 'audienceId',
                    as: 'client',
                },
            },
            {
                $unwind: {
                    path: '$client',
                },
            },
            {
                $match: {
                    'client.name': clientName,
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: 'client.teamId',
                    foreignField: '_id',
                    as: 'client.teamId',
                },
            },
            {
                $unwind: {
                    path: '$client.teamId',
                },
            },
            {
                $project: {
                    value: 1,
                    type: 1,
                    description: 1,
                    permittedClients: 1,
                    creator: 1,
                    audienceId: 1,
                    client: {
                        name: 1,
                        clientId: 1,
                        teamId: {
                            teamname: 1,
                        },
                    },
                },
            },
        ]);
    }

    // /**
    //  * Find scopes by the client id of the scope owner.
    //  * @param clientId - Client ID of the scope owner
    //  * @param population - (Optional) Population field to populate after query
    //  */
    // public static async findByClientId(clientId: string, population: any = ScopeRepository.defaultPopulation) {
    //     return await ScopeModel.find({ clientId }).populate(population);
    // }

    /**
     * Find scopes by the audience id of the scope owner.
     * @param audienceId - Audience ID of the scope owner.
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByAudienceId(audienceId: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.find({ audienceId }).populate(population).populate(ScopeRepository.defaultPopulationExtended);
    }

    // /**
    //  * Find scope by the client id of the scope owner and scope name.
    //  * @param clientId - Client ID of the scope owner
    //  * @param scopeName - Name of the scope
    //  * @param population - (Optional) Population field to populate after query
    //  */
    // public static async findByClientIdAndScopeName(clientId: string, scopeName: string, population: any = ScopeRepository.defaultPopulation) {
    //     return await ScopeModel.findOne({ clientId, value: scopeName }).populate(population);
    // }

    /**
     * Find scope by the audience id of the scope owner and scope name.
     * @param audienceId - Audience ID of the scope owner
     * @param scopeName - Name of the scope
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByAudienceIdAndScopeName(audienceId: string, scopeName: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.findOne({ audienceId, value: scopeName }).populate(population).populate(ScopeRepository.defaultPopulationExtended);
    }

    /**
     * Creates new scope.
     * @param scope - Scope properties
     * @param population - (Optional) Population field to populate after query
     */
    public static async create(scope: IScope, population: any = ScopeRepository.defaultPopulation) {
        return await (await ScopeModel.create(scope)).populate(population).execPopulate();
    }

    // /**
    //  * Updates existing scope.
    //  * @param clientId - Client id of the scope owner.
    //  * @param scopeName - Name of the scope.
    //  * @param updateScope - Scope information to update.
    //  * @param population - (Optional) Population field to populate after query
    //  */
    // public static async update(clientId: string, scopeName: string, updateScope: Partial<IScope>, population: any = ScopeRepository.defaultPopulation) {
    //     return await ScopeModel.findOneAndUpdate({ clientId, value: scopeName }, updateScope, { new: true, runValidators: true }).populate(population);
    // }

    /**
     * Updates existing scope.
     * @param audienceId - Audience id of the scope owner.
     * @param scopeName - Name of the scope.
     * @param updateScope - Scope information to update.
     * @param population - (Optional) Population field to populate after query
     */
    public static async update(audienceId: string, scopeName: string, updateScope: Partial<IScope>, population: any = ScopeRepository.defaultPopulation) {
        // Currently only update permitted clients

        return await ScopeModel.findOneAndUpdate(
            { audienceId, value: scopeName },
            { $set: { permittedClients: updateScope.permittedClients } },
            { new: true, runValidators: true })
            .populate(population)
            .populate(ScopeRepository.defaultPopulationExtended);
    }

    /**
     * Delete scope by a scope ObjectID.
     * @param scopeId - ObjectID of the scope to delete
     */
    public static async delete(scopeId: string) {
        return await ScopeModel.findOneAndRemove({ _id: scopeId });
    }
}
