// scope.repository

import ScopeModel from './scope.model';
import { IScope } from './scope.interface';

export class ScopeRepository {

    /**
     * Find scope by id
     * @param scopeId - ObjectID of the scope
     */
    public static async findById(scopeId: string) {
        return await ScopeModel.findOne({ _id: scopeId });
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
                    localField: 'client',
                    foreignField: 'clientId',
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
        ]);
    }

    /**
     * Find scopes by the client id of the scope owner.
     * @param clientId - Client ID of the scope owner
     */
    public static async findByClientId(clientId: string) {
        return await ScopeModel.find({ client: clientId });
    }

    /**
     * Find scope by the client id of the scope owner and scope name.
     * @param clientId - Client ID of the scope owner
     * @param scopeName - Name of the scope
     */
    public static async findByClientIdAndScopeName(clientId: string, scopeName: string) {
        return await ScopeModel.findOne({ client: clientId, name: scopeName });
    }

    /**
     * Creates new scope.
     * @param scope - Scope properties
     */
    public static async create(scope: IScope) {
        return await ScopeModel.create(scope);
    }

    public static async update(clientId: string, scopeName: string, updateScope: Partial<IScope>) {
        return await ScopeModel.findOneAndUpdate({ client: clientId, name: scopeName }, updateScope, { new: true, runValidators: true });
    }

    /**
     * Delete scope by a scope ObjectID.
     * @param scopeId - ObjectID of the scope to delete
     */
    public static async delete(scopeId: string) {
        return await ScopeModel.findOneAndRemove({ _id: scopeId });
    }
}
