// client.model

import { model, Schema } from 'mongoose';
import { IClient } from './client.interface';
import { ClientValidator } from './client.validator';

const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: [ClientValidator.isNameValid, 'Name isn\'t valid'],
    },
    clientId: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isClientIdValid, 'Client ID isn\'t valid'],
    },
    teamId: {
        type: String,
        ref: 'Team',
        required: true,
        validate: {
            isAsync: true,
            validator: ClientValidator.isTeamIdValid,
            message: 'TeamId isn\'t valid',
        },
    },
    hostUri: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isClientIdValid, 'Hostname isn\'t valid'],
    },
    token: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isClientIdValid, 'Token isn\'t valid'],
    },
});

export const ClientModel = model<IClient>('Client', ClientSchema);
