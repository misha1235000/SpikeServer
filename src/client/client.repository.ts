import { ClientModel } from './client.model';
import { IClient } from './client.interface';
import { DocumentQuery } from 'mongoose';

export class ClientRepository {

    public static findById(_id: string): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findOne({ _id });
    }

    public static findByTeamId(teamId: string): DocumentQuery<IClient[] | null, IClient> {
        return ClientModel.find({ teamId });
    }

    public static create(client: IClient): Promise<IClient> {
        try {
            return ClientModel.create(client);
        } catch(err) {
            throw err;
        }
    }

    public static update(id: string, client: Partial<IClient>): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findByIdAndUpdate(id, client, { new: true, runValidators: true });
    }

    public static delete(id: string): DocumentQuery<IClient | null, IClient> {
        return ClientModel.findByIdAndRemove(id);
    }
}