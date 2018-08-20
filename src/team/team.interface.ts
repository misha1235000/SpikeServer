// team.interface

import { Document } from 'mongoose';
import { IClient } from '../client/client.interface';

export interface ITeam extends Document {
    teamname: string;
    password: string;
    clients: IClient[];
}
