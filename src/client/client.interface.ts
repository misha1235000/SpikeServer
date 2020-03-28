// client.interface

import { Document } from 'mongoose';

export interface IClient extends Document {
    name: string;
    clientId: string;
    teamId: string;
    teamName: string;
    hostUris: string[];
    token: string;
}
