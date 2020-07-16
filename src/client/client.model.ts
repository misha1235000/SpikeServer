// client.model

const fuzzySearching = require('mongoose-fuzzy-searching');
import { model, Schema } from 'mongoose';
import { IClient } from './client.interface';
import { ClientValidator } from './client.validator';

const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: [ClientValidator.isNameValid, 'Name isn\'t valid'],
    },
    description: {
        type: String,
        default: 'No description provided.',
    },
    clientId: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isClientIdValid, 'Client ID isn\'t valid'],
    },
    audienceId: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isAudienceIdValid, 'Audience ID isn\'t valid'],
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
    hostUris: {
        type: [String],
        unique: true,
        required: true,
        validate: [ClientValidator.isHostnameValid, 'Hostname isn\'t valid'],
    },
    token: {
        type: String,
        unique: true,
        required: true,
        validate: [ClientValidator.isTokenValid, 'Token isn\'t valid'],
    },
});

ClientSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    delete obj.token;
    return obj;
};

ClientSchema.plugin(fuzzySearching, { fields: ['name'] });

export const ClientModel = model<IClient>('Client', ClientSchema);
