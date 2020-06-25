// scope.interface

import { Document } from 'mongoose';

export interface IScope extends Document {
    scopeName: string;
    scopeClient: string;
    scopeDesc: string;
    permittedClients: string[];
    scopeOwner: string;
    accessType: string;
}
