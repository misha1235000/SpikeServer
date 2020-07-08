// scope.repository

import ScopeModel from './scope.model';
import { IScope } from './scope.interface';

export class ScopeRepository {

    private static readonly defaultPopulation = { path: 'clientId', select: 'name description', populate: { path: 'teamId',  select: 'teamname' } };

    /**
     * Find all scopes belonging to the clients ids provided.
     * @param clientIds - Arrays of client ids
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByClientIds(clientIds: string[], population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.find({ clientId: { $in: clientIds } }).populate(population);
    }

    /**
     * Find scope by id.
     * @param scopeId - ObjectID of the scope
     * @param population - (Optional) Population field to populate after query
     */
    public static async findById(scopeId: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.findOne({ _id: scopeId }).populate(population);
    }

    /**
     * Find scopes by client name of the scope owner.
     * @param clientName - Client name of the scope owner
     */
    public static async findByClientName(clientName: string) {
        return await ScopeModel.aggregate([
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: 'clientId',
                    as: 'clientId',
                },
            },
            {
                $unwind: {
                    path: '$clientId',
                },
            },
            {
                $match: {
                    'clientId.name': clientName,
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: 'clientId.teamId',
                    foreignField: '_id',
                    as: 'clientId.teamId',
                },
            },
            {
                $unwind: {
                    path: '$clientId.teamId',
                },
            },
            {
                $project: {
                    value: 1,
                    type: 1,
                    description: 1,
                    permittedClients: 1,
                    creator: 1,
                    clientId: {
                        name: 1,
                        description: 1,
                        clientId: 1,
                        teamId: {
                            teamname: 1,
                        },
                    },
                },
            },
        ]);
    }

    /**
     * Find scopes by the client id of the scope owner.
     * @param clientId - Client ID of the scope owner
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByClientId(clientId: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.find({ clientId }).populate(population);
    }

    /**
     * Find scope by the client id of the scope owner and scope name.
     * @param clientId - Client ID of the scope owner
     * @param scopeName - Name of the scope
     * @param population - (Optional) Population field to populate after query
     */
    public static async findByClientIdAndScopeName(clientId: string, scopeName: string, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.findOne({ clientId, value: scopeName }).populate(population);
    }

    /**
     * Creates new scope.
     * @param scope - Scope properties
     * @param population - (Optional) Population field to populate after query
     */
    public static async create(scope: IScope, population: any = ScopeRepository.defaultPopulation) {
        return await (await ScopeModel.create(scope)).populate(population);
    }

    /**
     * Updates existing scope.
     * @param clientId - Client id of the scope owner.
     * @param scopeName - Name of the scope.
     * @param updateScope - Scope information to update.
     * @param population - (Optional) Population field to populate after query
     */
    public static async update(clientId: string, scopeName: string, updateScope: Partial<IScope>, population: any = ScopeRepository.defaultPopulation) {
        return await ScopeModel.findOneAndUpdate({ clientId, value: scopeName }, updateScope, { new: true, runValidators: true }).populate(population);
    }

    /**
     * Delete scope by a scope ObjectID.
     * @param scopeId - ObjectID of the scope to delete
     */
    public static async delete(scopeId: string) {
        return await ScopeModel.findOneAndRemove({ _id: scopeId });
    }
}
