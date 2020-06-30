// scope.model

import { Schema, model } from 'mongoose';
import { IScope, ScopeType } from './scope.interface';

const ScopeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        client: {
            type: String,
            ref: 'Client',
            required: true,
        },
        permittedClients: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
            required: true,
            default: [],
        },
        creator: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: 'No description provided',
        },
        type: {
            type: String,
            enum: Object.keys(ScopeType),
            default: ScopeType.PRIVATE,
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

// Ensures there's only one unique scope value for unique client
ScopeSchema.index({ name: 1, client: 1 }, { unique: true });

const ScopeModel = model<IScope>('Scope', ScopeSchema);

export default ScopeModel;
