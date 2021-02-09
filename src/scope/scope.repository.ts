// scope.repository

import ScopeModel from './scope.model';
import { IScope } from './scope.interface';

export class ScopeRepository {

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
    public static async findPermittedScopes(clientId: string, sort: string, desc: boolean) {
        
        // Ensure the sort field is exists.
        const sortFields = ['name', 'audienceId', 'description'];
        const sortField = sortFields.indexOf(sort) !== -1 ? sort: sortFields[0];

        return await ScopeModel.aggregate([
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
                $project: {
                    _id: 0.0,
                    name: '$client.name',
                    description: '$client.name',
                    audienceId: '$_id',
                    scopes: '$scopes',
                    team: {
                        teamname : 1.0,
                        desc: 1.0,
                        ownerId: 1.0,
                    },
                },
            },
            {
                $sort: {
                    [sortField]: desc ? -1 : 1,
                },
            },
        ]);
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
