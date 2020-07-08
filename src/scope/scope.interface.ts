// scope.interface

import { Document } from 'mongoose';
import { IClient } from '../client/client.interface';

export interface IScope extends Document {
    value: string; // Name of the scope
    clientId: string | IClient ; // Client who owns the scope (Or client object when populate)
    description: string; // Description of the scope purpose
    permittedClients: string[]; // Permitted clients to use that scope
    creator: string; // Scope creator (the user who create the scope)
    type: ScopeType; // Type of the scope (Public/Private)
}

export enum ScopeType { PUBLIC = 'PUBLIC', PRIVATE = 'PRIVATE' }
