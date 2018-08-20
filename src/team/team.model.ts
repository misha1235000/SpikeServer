// team.model

import { model, Schema } from 'mongoose';
import { ITeam } from './team.interface';
import { TeamValidator } from './team.validator';

const TeamSchema = new Schema({
    teamname: {
        type: String,
        unique: true,
        required: true,
        validate: [TeamValidator.isTeamnameValid, 'Teamname isn\'t valid'],
    },
    password: {
        type: String,
        required: true,
        validate: [TeamValidator.isPasswordValid, 'Password isn\'t valid'],
    },
});

// Virtual field for getting all the clients of specific team
// Used via population as described in https://mongoosejs.com/docs/populate.html#populate-virtuals
TeamSchema.virtual('clients', {
    ref: 'Client',
    localField: '_id',
    foreignField: 'teamId',
    justOne: false,
    options: { sort: { name: -1 } },
});

export const TeamModel = model<ITeam>('Team', TeamSchema);
