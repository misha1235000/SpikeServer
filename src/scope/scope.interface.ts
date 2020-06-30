// scope.interface

import { Document } from 'mongoose';

export interface IScope extends Document {
    name: string; // Name of the scope
    client: string; // Client who owns the scope
    description: string; // Description of the scope purpose
    permittedClients: string[]; // Permitted clients to use that scope
    creator: string; // Scope creator (the user who create the scope)
    type: ScopeType; // Type of the scope (Public/Private)
}

export enum ScopeType { PUBLIC = 'PUBLIC', PRIVATE = 'PRIVATE' }
