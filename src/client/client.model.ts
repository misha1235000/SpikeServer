import { model, Schema } from 'mongoose';
import { IClient } from './client.interface';

const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        unique: true,
        required: true,
    },
    teamId: {
        type: String,
        unique: true,
        ref: 'User',
        required: true,
    },
    hostname: {
        type: String,
        unique: true,
        required: true,
    },
    token: {
        type: String,
        unique: true,
        required: true,
    },
});

export const ClientModel = model<IClient>('Client', ClientSchema);
