import { Document } from 'mongoose';
import { IClient } from '../client/client.interface';

export interface IUser extends Document {
    username: string;
    password: string;
    clients: IClient[];
}
