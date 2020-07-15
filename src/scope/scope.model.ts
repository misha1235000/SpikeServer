// scope.model

import { Schema, model } from 'mongoose';
import { IScope, ScopeType } from './scope.interface';
import { ScopeValidator } from './scope.validator';

const ScopeSchema = new Schema(
    {
        value: {
            type: String,
            required: true,
            validate: [ScopeValidator.isScopeValueValid, 'Scope value is not valid'],
        },
        audienceId: {
            type: String,
            required: true,
            validator: {
                isAsync: true,
                validator: ScopeValidator.isAudienceIdValid,
                message: 'Audience id not refer existing client',
            },
        },
        permittedClients: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
            required: true,
            default: [],
            validator: {
                isAsync: true,
                validator: ScopeValidator.isPermittedClientsValid,
                message: 'Client id not refer existing client',
            },
        },
        creator: {
            type: String,
            required: true,
            validate: [ScopeValidator.isCreatorValid, 'Creator is not valid'],
        },
        description: {
            type: String,
            default: 'No description provided',
            validate: [ScopeValidator.isDescriptionValid, 'Creator is not valid'],
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

ScopeSchema.virtual('client', {
    ref: 'Client',
    localField: 'audienceId',
    foreignField: 'audienceId',
    justOne: true,
});

// Ensures there's only one unique scope value for unique client
ScopeSchema.index({ value: 1, audienceId: 1 }, { unique: true });

const ScopeModel = model<IScope>('Scope', ScopeSchema);

export default ScopeModel;
