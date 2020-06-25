// team.interface

import { Document } from 'mongoose';
import { IClient } from '../client/client.interface';

export interface ITeam extends Document {
    ownerId: string;
    teamname: string;
    desc: string;
    clients: IClient[];
    userIds: string[];
    adminIds: string[];
    ownerName: string;
}
