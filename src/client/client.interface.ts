import { Document } from 'mongoose';

export interface IClient extends Document {
    name: string;
    clientId: string;
    teamId: string;
    hostname: string;
    token: string;
};