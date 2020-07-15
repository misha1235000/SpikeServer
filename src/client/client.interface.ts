// client.interface

import { Document } from 'mongoose';
import { ITeam } from '../team/team.interface';

export interface IClient extends Document {
    name: string;
    clientId: string;
    audienceId: string;
    teamId: string | ITeam;
    teamName: string;
    hostUris: string[];
    token: string;
}
